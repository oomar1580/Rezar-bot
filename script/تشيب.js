const axios = require("axios");

module.exports.config = {
  name: "تشيب",
  version: "1.0",
  hasPermission: 0,
  credits: "Rako San",
  description: "رد ذكي باستخدام Chipp ويدعم الصور",
  commandCategory: "زكـــــــاء",
  usages: "[سؤال] (رد على صورة أو أرسل صورة مباشرة)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args}) {
  const { threadID, messageID, senderID, attachments, messageReply} = event;
  const ask = args.join(" ").trim();

  if (!ask) {
    return api.sendMessage("🧠 اكتب سؤالك يا زول، ولو عندك صورة أرسلها أو رد عليها!", threadID, messageID);
}

  let imageUrl = null;

  if (messageReply?.attachments?.[0]?.type === "photo") {
    imageUrl = messageReply.attachments[0].url;
} else if (attachments?.[0]?.type === "photo") {
    imageUrl = attachments[0].url;
}

  const apiUrl = `https://rapido.zetsu.xyz/api/chipp?ask=${encodeURIComponent(ask)}&uid=${senderID}${imageUrl? `&image=${encodeURIComponent(imageUrl)}`: ''}`;

  try {
    const res = await axios.get(apiUrl);
    const reply = res.data?.response || "ما قدرت أفهمك، جرب تاني يا زول.";

    return api.sendMessage(reply, threadID, messageID);
} catch (err) {
    console.error("❌ خطأ في الاتصال بـ Chipp:", err.message);
    return api.sendMessage("⚠️ حصلت مشكلة في الرد، جرب لاحقًا.", threadID, messageID);
}
};
