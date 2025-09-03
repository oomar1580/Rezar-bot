module.exports.config = {
  name: "مرحبا",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rako San",
  usePrefix: true,
  description: "رد تلقائي مع ملصق عند التحية",
  commandCategory: "صندوق الترحيب",
  usages: "[نص]",
  cooldowns: 5
};

module.exports.handleEvent = async ({ event, api, Users}) => {
  const KEY = [
    "hello", "hi", "hey", "hiii", "helloo", "hai", "hí", "hì", "lo", "low", "loe",
    "good evening", "evening", "goodevening", "gn", "eve",
    "good afternoon", "afternoon", "aftie"
  ];
  const thread = global.data.threadData.get(event.threadID) || {};
  if (typeof thread["hi"] == "undefined" || thread["hi"] == false) return;

  if (KEY.includes(event.body.toLowerCase())) {
    const stickers = [
      "422812141688367", "1775288509378520", "476426593020937", "476420733021523",
      "147663618749235", "466041158097347", "1528732074026137", "476426753020921",
      "529233794205649", "1330360453820546"
    ];
    const sticker = stickers[Math.floor(Math.random() * stickers.length)];

    const phrases = [
      "هل تناولت طعامك؟", "ماذا تفعل الآن؟", "كيف حالك يا جميل؟",
      "أنا بوت دردشة، تشرفت بمعرفتك", "أقوم بتحديث أوامري، ماذا تفعل؟",
      "هل تود التفاعل معي باستخدام أمر sim؟", "أنت جميل/جميلة جدًا",
      "أحبك، قبلة على جبينك", "هل تشعر بالملل؟ تحدث إلى المطور",
      "كيف حالك يا عزيزي؟", "تناول بعض الحلوى", "هل أنت بخير؟", "ابقَ بأمان"
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    const moment = require("moment-timezone");
    const hours = moment.tz('Africa/Cairo').format('HHmm');
    const session =
      hours> 0 && hours <= 400? "صباح مشرق":
      hours> 400 && hours <= 1100? "صباح الخير":
      hours> 1100 && hours <= 1500? "مساء الخير":
      hours> 1500 && hours <= 2100? "مساء الخير":
      hours> 2100 && hours <= 2400? "ليلة سعيدة ونوم هانئ":
      "وقت غير معروف";

    let day = moment.tz('Africa/Cairo').format('dddd');
    const name = await Users.getNameUser(event.senderID);
    const mentions = [{ tag: name, id: event.senderID}];
    const message = `مرحبًا ${name}، أتمنى لك ${day} جميل، ${phrase}`;
    const msg = { body: message, mentions};

    api.sendMessage(msg, event.threadID, (e, info) => {
      setTimeout(() => {
        api.sendMessage({ sticker}, event.threadID);
}, 100);
}, event.messageID);
}
};

module.exports.languages = {
  "en": {
    "on": "تم التفعيل",
    "off": "تم الإيقاف",
    "successText": "أمر الترحيب"
}
};

module.exports.run = async ({ event, api, Threads, getText}) => {
  const { threadID, messageID} = event;
  const data = (await Threads.getData(threadID)).data;
  data["hi"] =!data["hi"];
  await Threads.setData(threadID, { data});
  global.data.threadData.set(threadID, data);
  return api.sendMessage(`${data["hi"]? getText("on"): getText("off")} ${getText("successText")}`, threadID, messageID);
};