module.exports.config = {
  name: "حذف",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['حذف-رسالة', 'إزالة', 'rm'],
  usage: 'حذف [رد على رسالة البوت]',
  description: "حذف رسالة أرسلها البوت",
  credits: 'Rako San',
  cooldown: 0
};
module.exports.run = async function({
  api,
  event
}) {
  if (event.messageReply.senderID!= api.getCurrentUserID()) return api.sendMessage("🐸💔☝ لا يمكنني حذف رسالة لم أرسلها.", event.threadID, event.messageID);
  if (event.type!= "message_reply") return api.sendMessage("↩️ يرجى الرد على رسالة البوت التي تريد حذفها.", event.threadID, event.messageID);
  return api.unsendMessage(event.messageReply.messageID, err => (err)? api.sendMessage("❌ حدث خطأ أثناء الحذف.", event.threadID, event.messageID): '');
}