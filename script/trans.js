module.exports.config = {
  name: "ترجم",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  description: "ترجمة النصوص",
  usages: "ترجم [رمز اللغة، مثل: ar, en] [النص]",
  credits: "Rako San",
  cooldowns: 5,
};
module.exports.run = async ({
  api,
  event,
  args,
  prefix
}) => {
  const request = require("request");
  const targetLanguage = args[0];
  const content = args.slice(1).join(" ");
  try {
    if (content.length === 0 && event.type!== "message_reply") return api.sendMessage(`يرجى إدخال نص للترجمة أو الرد على رسالة.\n\nمثال: ${prefix}ترجم ar ما معنى الحياة`, event.threadID, event.messageID);
    let translateThis, lang;
    if (event.type === "message_reply") {
      translateThis = event.messageReply.body;
      lang = targetLanguage || 'ar';
} else {
      translateThis = content;
      lang = targetLanguage || 'ar';
}
    return request(encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${translateThis}`), (err, response, body) => {
      if (err) return api.sendMessage("حدث خطأ أثناء الترجمة!", event.threadID, event.messageID);
      const retrieve = JSON.parse(body);
      let text = '';
      retrieve[0].forEach(item => (item[0])? text += item[0]: '');
      const fromLang = (retrieve[2] === retrieve[8][0][0])? retrieve[2]: retrieve[8][0][0];
      api.sendMessage(`📘 الترجمة: ${text}\n🌐 من اللغة: ${fromLang} إلى ${lang}`, event.threadID, event.messageID);
});
} catch (error) {
    api.sendMessage(error.message, event.threadID, event.messageID);
}
};