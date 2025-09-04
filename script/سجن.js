const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { loadImage, createCanvas} = require("canvas");

module.exports = {
  config: {
    name: "سجن",
    version: "1.1",
    hasPermssion: 0,
    credits: " راكو ",
    description: "سجن المستخدم داخل صورة قضبان شفافة",
    commandCategory: "صــــــور",
    usages: "",
    cooldowns: 3
},

  run: async function({ api, event}) {
    const { senderID, messageReply, mentions, threadID} = event;

    // تحديد الزول المستهدف
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
    const prisonURL = "https://i.postimg.cc/Hxx4pNj0/pngtree-prison-bars-isolated-on-transparent-png-image-5489739.png";

    const avatarPath = path.join(cacheDir, `${targetID}_avatar.png`);
    const prisonPath = path.join(cacheDir, "prison_overlay.png");
    const outputPath = path.join(cacheDir, `sjn_${targetID}.png`);

    // تحميل الصور
    const downloadImage = async (url, filepath) => {
      const res = await axios.get(url, { responseType: "arraybuffer"});
      fs.writeFileSync(filepath, Buffer.from(res.data, "binary"));
};

    await Promise.all([
      downloadImage(avatarURL, avatarPath),
      downloadImage(prisonURL, prisonPath)
    ]);

    // تحميل الصور بالرسم
    const [avatarImg, prisonImg] = await Promise.all([
      loadImage(avatarPath),
      loadImage(prisonPath)
    ]);

    const canvasSize = 512;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(avatarImg, 0, 0, canvasSize, canvasSize);
    ctx.drawImage(prisonImg, 0, 0, canvasSize, canvasSize); // تغطية كاملة

    fs.writeFileSync(outputPath, canvas.toBuffer());

    // اسم المستخدم
    const info = await api.getUserInfo(targetID);
    const nameTarget = info[targetID]?.name || "زول";

    // إرسال الصورة
    api.sendMessage({
      body: `🚔︙ تم سجن ${nameTarget} خلف القضبان!`,
      attachment: fs.createReadStream(outputPath)
}, threadID, () => {
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(prisonPath);
      fs.unlinkSync(outputPath);
});
}
};