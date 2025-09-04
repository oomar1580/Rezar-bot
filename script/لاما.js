const axios = require("axios");

module.exports.config = {
  name: "لاما",
  version: "1.0",
  hasPermission: 0,
  credits: "Rako San ",
  description: "رد ذكي باستخدام LLaMA 4 Scout من Meta",
  commandCategory: "زكـــــــاء",
  usages: "[سؤالك أو طلبك]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args}) {
  const { threadID, messageID, senderID} = event;
  const query = args.join(" ").trim();

  if (!query) {
    return api.sendMessage("🦙 اكتب سؤالك أو طلبك يا زول، خليه على لاما!", threadID, messageID);
}

  const url = `https://rapido.zetsu.xyz/api/4-scout?query=${encodeURIComponent(query)}&uid=${senderID}`;

  try {
    const res = await axios.get(url);
    const reply = res.data?.response || "ما قدرت أفهمك، جرب تاني يا زول.";

    return api.sendMessage(reply, threadID, messageID);
} catch (err) {
    console.error("❌ خطأ في الاتصال بـ LLaMA:", err.message);
    return api.sendMessage("⚠️ حصلت مشكلة في الرد، جرب لاحقًا.", threadID, messageID);
}
};
