const axios = require("axios");

module.exports.config = {
  name: "سيم",
  version: "1.0.0",
  role: 0,
  aliases: ["سيم"],
  credits: "تعريب: Rako San",
  description: "تحدث مع سيم أو علمه إجابات جديدة",
  cooldown: 0,
  hasPrefix: false
};

module.exports.run = async function({ api, event, args}) {
  const reply = event.body.trim();
  const apiUrl = "https://jan-40wx.onrender.com";

  async function fetchCount() {
    try {
      const response = await axios.get(`${apiUrl}/count`);
      return response.data.count;
} catch (error) {
      return 0;
}
}

  async function getAnswer(question) {
    try {
      const response = await axios.get(`${apiUrl}/answer/${encodeURIComponent(question)}`);
      if (response.data && response.data.answer) {
        return response.data.answer;
} else {
        return "لم أتعلم هذا بعد، هل يمكنك تعليمي؟ 👀";
}
} catch (error) {
      return "❌ حدث خطأ أثناء جلب الإجابة، حاول تعليمي من فضلك!";
}
}

  async function addQuestionAnswer(question, answer) {
    try {
      const response = await axios.post(`${apiUrl}/add`, { question, answer});
      return response.data.message;
} catch (error) {
      return "❌ فشل في إضافة السؤال والإجابة!";
}
}

  if (args.length < 1) {
    return api.sendMessage("❌ يرجى كتابة سؤال أو أمر!", event.threadID, event.messageID);
}

  const command = args[0].toLowerCase();

  if (command === "معرفة") {
    const count = await fetchCount();
    return api.sendMessage(`📊 لقد تعلمت حتى الآن ${count} سؤالًا.`, event.threadID, event.messageID);
}

  if (command === "add") {
    const input = args.slice(1).join(" ").split(" - ");
    if (input.length!== 2) {
      return api.sendMessage("❌ الصيغة غير صحيحة. استخدم: سيم add <السؤال> - <الإجابة>", event.threadID, event.messageID);
}

    const question = input[0].trim();
    const answer = input[1].trim();
    const responseMessage = await addQuestionAnswer(question, answer);
    return api.sendMessage(responseMessage, event.threadID, event.messageID);
}

  const input = args.join(" ").trim();
  const responseMessage = await getAnswer(input);

  await api.sendMessage(responseMessage, event.threadID, (error, info) => {
    if (!error) {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID
});
}
}, event.messageID);
};
