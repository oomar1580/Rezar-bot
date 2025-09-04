module.exports.config = {
  name: "فلوكس",
  version: "1.0.0",
  permission: 0,
  credits: "Rako San",
  description: "إنشاء صورة باستخدام فلوكس",
  prefix: true,
  category: "صور",
  usages: ".فلوكس <وصف>",
  cooldowns: 7,
};

module.exports.run = async ({ api, event, args}) => {
  const axios = require('axios');
  const fs = require('fs-extra');
  const { threadID, messageID} = event;
  const prompt = args.join(" ");

  try {
    if (!prompt) return api.sendMessage("🤍 يرجى إدخال وصف لإنشاء الصورة.", threadID, messageID);

    api.sendMessage("🤍 جاري إنشاء الصورة، يرجى الانتظار...", threadID, messageID);

    const path = __dirname + `/cache/flux_image.png`;
    const response = await axios.get(`https://ccprojectapis.ddns.net/api/flux?prompt=${encodeURIComponent(prompt)}`, {
      responseType: "arraybuffer",
});

    fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

    api.sendMessage({
      body: "🤍 تم إنشاء الصورة بنجاح",
      attachment: fs.createReadStream(path)
}, threadID, () => fs.unlinkSync(path), messageID);

} catch (error) {
    api.sendMessage(`حدث خطأ: ${error.message}`, threadID, messageID);
}
};