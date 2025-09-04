const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://textpro.me/",
};

module.exports.config = {
  name: "تأثير",
  version: "1.0",
  hasPermission: 0,
  credits: "Rako San ",
  description: "إنشاء صور نصية بتأثيرات من TextPro",
  prefix: true,
  commandCategory: "صــــــور",
  usages: ".textpro list | <رقم التأثير> | <النص>",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args}) => {
  const { threadID, messageID} = event;

  const usageMessage = `
❴ طريقة استخدام امر تأثير ❵

1️⃣ عرض قائمة التأثيرات:
• تأثير قائمة 

2️⃣ إنشاء صورة نصية:
•تأثير <رقم التأثير> | <النص>
— مثال:
.تأثير 3 | Rako San `;

  if (!args.length || args[0].toLowerCase() === "مساعدة") {
    return api.sendMessage(usageMessage, threadID, messageID);
}

  const subcmd = args[0].toLowerCase();

  if (subcmd === "قائمة") {
    try {
      const res = await axios.get("https://textpro-zeta.vercel.app/list", { headers: HEADERS});
      if (!res.data.success) return api.sendMessage("❌ فشل في جلب قائمة التأثيرات.", threadID, messageID);

      const allEffects = res.data.chunks.flat();
      if (!allEffects.length) return api.sendMessage("❌ لم يتم العثور على تأثيرات.", threadID, messageID);

      const chunkSize = 50;
      for (let i = 0; i < allEffects.length; i += chunkSize) {
        const chunk = allEffects.slice(i, i + chunkSize);
        const listText = chunk.map(e => `${e.number}. ${e.title}`).join("\n");
        await api.sendMessage(`🎨 التأثيرات (${i + 1}-${i + chunk.length}):\n${listText}`, threadID);
}
      return;
} catch (err) {
      return api.sendMessage(`❌ خطأ أثناء جلب التأثيرات: ${err.message}`, threadID, messageID);
}
}

  const input = args.join(" ").split("|");
  const effectInput = input[0].trim();
  const text = input[1]? input[1].trim(): "";

  if (!text) return api.sendMessage("❌ الرجاء إدخال النص بعد '|'.", threadID, messageID);
  if (isNaN(effectInput)) return api.sendMessage("❌ رقم التأثير يجب أن يكون رقمًا.", threadID, messageID);

  const effectNumber = parseInt(effectInput, 10);

  try {
    const res = await axios.get("https://textpro-zeta.vercel.app/list", { headers: HEADERS});
    if (!res.data.success) return api.sendMessage("❌ فشل في جلب قائمة التأثيرات.", threadID, messageID);

    const allEffects = res.data.chunks.flat();
    const effect = allEffects.find(e => e.number === effectNumber);
    if (!effect) return api.sendMessage(`❌ التأثير رقم ${effectNumber} غير موجود.`, threadID, messageID);

    const genRes = await axios.get("https://textpro-zeta.vercel.app/textpro", {
      params: { text, effectNumber},
      headers: HEADERS,
});

    if (!genRes.data.success) return api.sendMessage("❌ فشل في إنشاء الصورة.", threadID, messageID);

    const imageUrl = genRes.data.imageUrl.startsWith("http")? genRes.data.imageUrl: `https:${genRes.data.imageUrl}`;
    const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer", headers: HEADERS});

    const cacheDir = __dirname + "/cache";
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const ext = path.extname(new URL(imageUrl).pathname) || ".jpg";
    const fileName = `textpro_${Date.now()}${ext}`;
    const filePath = path.join(cacheDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(imgRes.data, "binary"));

    api.sendMessage({
      body: `✅ النص: ${genRes.data.text}\n🎨 التأثير: ${genRes.data.effectTitle}`,
      attachment: fs.createReadStream(filePath),
}, threadID, () => fs.unlinkSync(filePath), messageID);

} catch (err) {
    console.error("❌ خطأ:", err.message);
api.sendMessage(`⚠️ حصل خطأ أثناء إنشاء الصورة:\n${err.message}`, threadID, messageID);
}
};