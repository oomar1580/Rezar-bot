const axios = require("axios");

module.exports.config = {
  name: "انمي",
  version: "1.0",
  hasPermission: 0,
  credits: "Rako San ",
  description: "يرسل صورة أنمي عشوائية",
  commandCategory: "صــــــور",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event}) {
  const { threadID, messageID} = event;

  try {
    const res = await axios.get("https://rapido.zetsu.xyz/api/anime-photo", {
      responseType: "stream"
});

    return api.sendMessage({
      body: "📸 صورة أنمي عشوائية:",
      attachment: res.data
}, threadID, messageID);
} catch (err) {
    console.error("❌ خطأ في جلب صورة الأنمي:", err.message);
    return api.sendMessage("⚠️ حصلت مشكلة في تحميل الصورة، جرب لاحقًا.", threadID, messageID);
}
};
