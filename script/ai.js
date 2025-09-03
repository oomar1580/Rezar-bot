const axios = require('axios');

module.exports.config = {
  name: 'ذكاء',
  version: '1.0.0',
  hasPermission: 0,
  usePrefix: false,
  aliases: ['gpt', 'مساعد'],
  description: "أمر ذكاء اصطناعي مدعوم بـ GPT-4",
  usages: "ذكاء [سؤال أو طلب]",
  credits: 'Rako San',
  cooldowns: 3,
  dependencies: {
    "axios": ""
}
};

module.exports.run = async function({ api, event, args}) {
  const input = args.join(' ');

  if (!input) {
    return api.sendMessage(`يرجى كتابة سؤال أو عبارة بعد كلمة 'ذكاء'. مثال: 'ذكاء ما هي عاصمة فرنسا؟'`, event.threadID, event.messageID);
}

  if (input === "مسح") {
    try {
      await axios.post('https://gaypt4ai.onrender.com/clear', { id: event.senderID});
      return api.sendMessage("تم مسح سجل المحادثة.", event.threadID, event.messageID);
} catch (error) {
      console.error(error);
      return api.sendMessage('حدث خطأ أثناء مسح سجل المحادثة.', event.threadID, event.messageID);
}
}

  let chatInfoMessageID = "";

  api.sendMessage(`🔍 "${input}"`, event.threadID, (error, chatInfo) => {
    chatInfoMessageID = chatInfo.messageID;
},event.messageID);

  try {
    const url = (event.type === "message_reply" && event.messageReply.attachments[0]?.type === "photo")
? { link: event.messageReply.attachments[0].url}
: {};

    const { data} = await axios.post('https://gays-porno-api.onrender.com/chat', {
      prompt: input,
      customId: event.senderID,
...url
});

    api.editMessage(`${data.message}`, chatInfoMessageID, (err) => {
      if (err) {
        console.error(err);
}
});

} catch (error) {
    console.error(error);
    return api.sendMessage('حدث خطأ أثناء معالجة طلبك.', event.threadID, event.messageID);
}
};