const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { loadImage, createCanvas} = require("canvas");

module.exports = {
  config: {
    name: "مطلوب",
    version: "1.3",
    hasPermssion: 0,
    credits: "Rako San",
    description: "دمج صورة البروفايل داخل قالب مطلوب بدون ميلان",
    commandCategory: "صــــــور",
    usages: "",
    cooldowns: 3
},

  run: async function({ api, event}) {
    const { senderID, messageReply, mentions, threadID} = event;

    let targetID = senderID;
    if (messageReply && messageReply.senderID!== senderID) {
      targetID = messageReply.senderID;
} else if (mentions && Object.keys(mentions).length> 0) {
      targetID = Object.keys(mentions)[0];
}

    // إنشاء مجلد cache لو ما موجود
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // ✅ دالة جلب صورة البروفايل بدون توكن
    async function getAvatarUrl(userID) {
      try {
        const user = await axios.post(`https://www.facebook.com/api/graphql/`, null, {
          params: {
            doc_id: "5341536295888250",
            variables: JSON.stringify({ height: 512, scale: 1, userID, width: 512})
}
});
        return user.data.data.profile.profile_picture.uri;
} catch (err) {
        return "https://i.ibb.co/bBSpr5v/143086968-2856368904622192-1959732218791162458-n.png";
}
}

    // روابط الصور
    const avatarURL = await getAvatarUrl(targetID);
    const overlayURL = "https://i.postimg.cc/vmFqjkw8/467471884-1091680152417037-7359182676446817237-n.jpg";

    const avatarPath = path.join(cacheDir, `${targetID}_avatar.jpg`);
    const overlayPath = path.join(cacheDir, "wanted_overlay.jpg");
    const outputPath = path.join(cacheDir, `wanted_${targetID}.png`);

    // تحميل الصور
    const downloadImage = async (url, filepath) => {
      const res = await axios.get(url, { responseType: "arraybuffer"});
      fs.writeFileSync(filepath, Buffer.from(res.data, "binary"));
};

    await Promise.all([
      downloadImage(avatarURL, avatarPath),
      downloadImage(overlayURL, overlayPath)
    ]);

    // تحميل الصور بالرسم
    const [avatarImg, overlayImg] = await Promise.all([
      loadImage(avatarPath),
      loadImage(overlayPath)
    ]);

    const canvas = createCanvas(overlayImg.width, overlayImg.height);
    const ctx = canvas.getContext("2d");

    // رسم الخلفية أولاً
    ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);

    // رسم صورة البروفايل في منتصف الصورة
    const avatarSize = overlayImg.width / 2;
    const x = overlayImg.width / 2 - avatarSize / 2;
    const y = overlayImg.height / 2 - avatarSize / 2 - 25;

    ctx.drawImage(avatarImg, x, y, avatarSize, avatarSize);

    fs.writeFileSync(outputPath, canvas.toBuffer());

    const info = await api.getUserInfo(targetID);
    const name = info[targetID]?.name || "شخص";

    // إرسال الرسالة بالصورة
    api.sendMessage({
      body: `🚨︙ ${name} مطلوب فوراً!`,
      attachment: fs.createReadStream(outputPath)
}, threadID, () => {
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(overlayPath);
      fs.unlinkSync(outputPath);
});
}
};