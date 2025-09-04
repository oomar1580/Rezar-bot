module.exports.config = {
  name: "تخيل",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  credits: "Rako San",
  description: "توليد صورة باستخدام خدمة polination",
  usages: "توليد-صورة [الوصف]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args}) => {
  const axios = require('axios');
  const fs = require('fs-extra');
  try {
    const { threadID, messageID} = event;
    const query = args.join(" ");
    const time = new Date();
    const timestamp = time.toISOString().replace(/[:.]/g, "-");
    const path = __dirname + '/cache/' + `${timestamp}_tid.png`;

    if (!query) return api.sendMessage("يرجى إدخال وصف الصورة المطلوب توليدها.", threadID, messageID);

    api.sendMessage(`جاري البحث عن: ${query}`, threadID, messageID);

    const poli = (await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
      responseType: "arraybuffer",
})).data;

    fs.writeFileSync(path, Buffer.from(poli, "utf-8"));

    setTimeout(() => {
      api.sendMessage({
        body: "✅ تم تحميل الصورة بنجاح!",
        attachment: fs.createReadStream(path)
}, threadID, () => fs.unlinkSync(path));
}, 5000);

} catch (error) {
    api.sendMessage(`حدث خطأ: ${error.message}`, event.threadID, event.messageID);
}
};