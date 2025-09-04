const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage} = require("canvas");

module.exports.config = {
  name: "رسم",
  version: "2.2",
  hasPermission: 0,
  credits: "Rako San ",
  description: "إنشاء صورة من وصف بسيط باستخدام ",
  prefix: true,
  commandCategory: "زكـــــــاء",
  usages: ".فلاكس <الوصف>",
  cooldowns: 7,
};

const activeThreads = new Set();
const userLimits = {};
const DEVELOPER_ID = "61553754531086";

module.exports.run = async ({ api, event, args}) => {
  const { threadID, messageID, senderID} = event;
  const userInput = args.join(" ").trim();

  if (!userInput) return api.sendMessage("يا حش ارسم ليك شنو ؟؟", threadID, messageID);
  if (activeThreads.has(threadID)) return api.sendMessage("⏳ في طلب تحت التنفيذ حالياً، انتظر يحش يا .", threadID, messageID);

  const now = Date.now();
  const limitWindow = 30 * 60 * 1000;
  const isDeveloper = senderID === DEVELOPER_ID;

  if (!userLimits[senderID]) userLimits[senderID] = { count: 0, startTime: now};
  const userData = userLimits[senderID];
  if (now - userData.startTime> limitWindow) userLimits[senderID] = { count: 0, startTime: now};
  if (!isDeveloper && userLimits[senderID].count>= 3) return api.sendMessage("🚫 وصلت الحد الأقصى لعدد الطلبات (3) خلال نصف ساعة. جرب بعد شوية يا دنقل.", threadID, messageID);
  if (!isDeveloper) userLimits[senderID].count++;

  activeThreads.add(threadID);

  try {
    const geminiPrompt = `
حول الوصف التالي إلى نص دقيق باللغة الإنجليزية لإنشاء صورة عبر الذكاء الاصطناعي.
أضف تفاصيل واضحة مثل: نوع الشخصية، الملابس، الخلفية، الإضاءة، المشاعر، الزاوية، الأسلوب الفني.
لا تكرر الوصف الأصلي، بل حسّنه وأعد صياغته بدقة.
الوصف: ${userInput}
`;

    const geminiRes = await axios.get(`https://rapido.zetsu.xyz/api/gemini?chat=${encodeURIComponent(geminiPrompt)}`);
    if (!geminiRes.data ||!geminiRes.data.response) {
      activeThreads.delete(threadID);
      return api.sendMessage("⚠️ ما قدرنا نحصل على وصف محسّ.", threadID, messageID);
}

    const refinedPrompt = geminiRes.data.response.trim();

    // ⏱️ فاصل زمني بسيط بين Gemini و Flux
    await new Promise(resolve => setTimeout(resolve, 3000));

    const fluxPrompt = `
Generate a 2x2 grid image with four highly distinct visual interpretations of the following concept.
Each quadrant must differ in style, color palette, composition, lighting, and artistic approach by at least 80%.
Top-left: vibrant and colorful
Top-right: dark and cinematic
Bottom-left: minimal and clean
Bottom-right: futuristic and surreal
Concept: ${refinedPrompt}
`;

    const imageName = `flux_${Date.now()}.png`;
    const imagePath = __dirname + `/cache/${imageName}`;
    const imageBuffer = (await axios.get(`https://rapido.zetsu.xyz/api/flux?prompt=${encodeURIComponent(fluxPrompt)}`, {
      responseType: "arraybuffer"
})).data;

    fs.writeFileSync(imagePath, Buffer.from(imageBuffer, "utf-8"));

    api.sendMessage({
      body: `📸 هاك الصورة حسب وصفك:\n\n📝 وصفك:\n${userInput}\n\n🧩 اختار :\n[ U1 | U2 | U3 | U4 ]\n📌 رد بأي خيار منهم عشان نرسل لك التصميم المختار.`,
      attachment: fs.createReadStream(imagePath)
}, threadID, (err, info) => {
      activeThreads.delete(threadID);
      if (err) return console.error("❌ خطأ في إرسال الصورة:", err);
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: senderID,
        threadID,
        imageName
});

      setTimeout(() => {
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
}, 5 * 60 * 1000);
}, messageID);

} catch (error) {
    console.error("❌ خطأ:", error.message);
activeThreads.delete(threadID);
    api.sendMessage(`⚠️ حصل خطأ أثناء توليد الصورة:\n${error.message}`, threadID, messageID);
}
};

module.exports.handleReply = async ({ api, event, handleReply}) => {
  const { threadID, messageID, senderID, body} = event;
  if (senderID!== handleReply.author || threadID!== handleReply.threadID) return;

  const choice = body.trim().toUpperCase();
  const validChoices = ["U1", "U2", "U3", "U4"];
  if (!validChoices.includes(choice)) {
    return api.sendMessage("⚠️ اختار من الخيارات دي بس: [ U1 | U2 | U3 | U4 ]", threadID, messageID);
}

  const imagePath = __dirname + `/cache/${handleReply.imageName}`;
  const outputPath = __dirname + `/cache/${choice}_${Date.now()}.png`;

  try {
    const img = await loadImage(imagePath);
    const w = img.width;
    const h = img.height;
    const canvas = createCanvas(w / 2, h / 2);
    const ctx = canvas.getContext("2d");

    let sx = 0, sy = 0;
    if (choice === "U2") sx = w / 2;
    if (choice === "U3") sy = h / 2;
    if (choice === "U4") { sx = w / 2; sy = h / 2;}

    ctx.drawImage(img, sx, sy, w / 2, h / 2, 0, 0, w / 2, h / 2);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    api.sendMessage({
      body: `🖼️ التصميم المختار (${choice}):`,
      attachment: fs.createReadStream(outputPath)
}, threadID, () => {
      fs.unlinkSync(outputPath);
}, messageID);

} catch (err) {
    console.error("❌ خطأ في القص باستخدام canvas:", err.message);
    api.sendMessage("⚠️ فشل في استخراج التصميم المختار.", threadID, messageID);
}
};