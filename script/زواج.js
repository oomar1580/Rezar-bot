const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage} = require("canvas");

module.exports.config = {
  name: "زوجني",
  version: "2.2",
  hasPermssion: 0,
  credits: "Rako San ",
  description: "زواج عشوائي أو موجه حسب الرد",
  commandCategory: "صــــــور",
  usages: "زوجني أو رد على شخص ثم اكتب: زوجني",
  cooldowns: 10
};

const backgrounds = [
  "https://i.postimg.cc/wjJ29HRB/background1.png",
  "https://i.postimg.cc/zf4Pnshv/background2.png",
  "https://i.postimg.cc/5tXRQ46D/background3.png"
];

// ✅ دالة جلب صورة البروفايل بدون توكن
async function getAvatarUrl(userID) {
  try {
    const user = await axios.post(`https://www.facebook.com/api/graphql/`, null, {
      params: {
        doc_id: "5341536295888250",
        variables: JSON.stringify({ height: 400, scale: 1, userID, width: 400})
}
});
    return user.data.data.profile.profile_picture.uri;
} catch (err) {
    return "https://i.ibb.co/bBSpr5v/143086968-2856368904622192-1959732218791162458-n.png";
}
}

module.exports.run = async function({ api, event, Users}) {
  const { threadID, messageID, senderID, messageReply} = event;

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const senderInfo = threadInfo.userInfo.find(u => u.id === senderID);
    const senderGender = senderInfo?.gender || "UNKNOWN";

    let groomID = senderID;
    let brideID;
    let name1, name2;

    if (messageReply) {
      brideID = messageReply.senderID;
      if (brideID === groomID) return api.sendMessage("😂 ما بتقدر تعرس نفسك يا زول!", threadID, messageID);

      const targetInfo = threadInfo.userInfo.find(u => u.id === brideID);
      const targetGender = targetInfo?.gender || "UNKNOWN";

      if (senderGender === "FEMALE" && targetGender === "FEMALE") {
        return api.sendMessage("😳 ما تخجلي يا بت الناس دايرة تعرسي بت؟ 🙂💔", threadID, messageID);
}

      if (senderGender === "MALE" && targetGender === "MALE") {
        return api.sendMessage("😐 يا زول استهد بالله لسنا قوم لوط،* 🙂💔", threadID, messageID);
}

      name1 = await Users.getNameUser(groomID);
      name2 = await Users.getNameUser(brideID);
} else {
      const females = threadInfo.userInfo.filter(
        mem => mem.gender === "FEMALE" && mem.id!== groomID &&!mem.isSubscribed
);
      if (!females.length) return api.sendMessage("مافي بنات في القروب 😅", threadID, messageID);

      const bride = females[Math.floor(Math.random() * females.length)];
      brideID = bride.id;
      name1 = await Users.getNameUser(groomID);
      name2 = bride.name;
}

    const imgDir = path.join(__dirname, "tmp");
    fs.ensureDirSync(imgDir);
    const imgPath1 = path.join(imgDir, `${groomID}.jpg`);
    const imgPath2 = path.join(imgDir, `${brideID}.jpg`);

    const avatarURL1 = await getAvatarUrl(groomID);
    const avatarURL2 = await getAvatarUrl(brideID);

    const res1 = await axios.get(avatarURL1, { responseType: "arraybuffer"});
    const res2 = await axios.get(avatarURL2, { responseType: "arraybuffer"});
    fs.writeFileSync(imgPath1, Buffer.from(res1.data, "binary"));
    fs.writeFileSync(imgPath2, Buffer.from(res2.data, "binary"));

    const img1 = await loadImage(imgPath1);
    const img2 = await loadImage(imgPath2);
    const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const background = await loadImage(bgURL);

    const canvas = createCanvas(700, 400);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(img1, 40, 100, 200, 200); // العريس
    ctx.drawImage(img2, 460, 100, 200, 200); // العروس

    const finalImg = path.join(imgDir, `zawaj_${groomID}_${brideID}.jpg`);
const out = fs.createWriteStream(finalImg);
    const stream = canvas.createJPEGStream();
    stream.pipe(out);

    await new Promise(resolve => out.on("finish", resolve));

    const msg = `════════════════\n
مبروك للعريس _${name1}_
وعروسته الجميلة _${name2}_ ❤️

نتمنى لكم حياة مليانة فرح وسعادة! 🎉💐
\n════════════════`;

    api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(finalImg),
      mentions: [
        { tag: name1, id: groomID},
        { tag: name2, id: brideID}
      ]
}, threadID, () => {
      fs.unlinkSync(imgPath1);
      fs.unlinkSync(imgPath2);
      fs.unlinkSync(finalImg);
}, messageID);

} catch (err) {
    console.error("❌ خطأ في أمر زوجني:", err.message);
    api.sendMessage("😔 حصل خطأ أثناء تنفيذ الزواج الأشواعي.", threadID, messageID);
}
};