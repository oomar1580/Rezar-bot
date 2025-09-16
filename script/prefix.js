module.exports.config = {
  name: "البادئة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "miko BOT",
  description: "عرض تفاصيل البادئة المستخدمة",
  commandCategory: "إداري",
  usages: "",
  cooldowns: 5,
};

module.exports.handleEvent = async ({ event, api, Threads}) => {
  const { threadID, messageID, body} = event;
  const dataThread = await Threads.getData(threadID);
  const data = dataThread.data;
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  const triggers = [
    "prefix", "ما هي البادئة", "دالة البوت", "كيف أستخدم البوت", "bot not working",
    "bot is offline", "where prefix", "prefx", "prfix", "prifx", "perfix"
  ];

  triggers.forEach(trigger => {
    const normalized = trigger.toLowerCase();
    if (body.toLowerCase() === normalized) {
      const response = `📌 البادئة الحالية هي: [ ${prefix} ]\n👤 المطور: Rako San\n📎 لاستخدام الأوامر، ابدأ بها بهذه البادئة.`;
      return api.sendMessage(response, threadID, messageID);
}
});
};

module.exports.run = async ({ event, api}) => {
  return api.sendMessage("❌ خطأ في تنفيذ الأمر.", event.threadID);
};
