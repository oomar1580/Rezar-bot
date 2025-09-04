module.exports.config = {
  name: "حذف",
  version: "1.0",
  hasPermssion: 2,
  credits: "مطور البوت",
  description: "حذف أمر",
  commandCategory: "الــمـطـور",
  usages: ".حذف <اسم الملف>.js",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
const { senderID } = event;
  if (senderID !== "61553754531086") {
    return api.sendMessage("⚠️ هذا الأمر متاح فقط للمالك.", event.threadID);
  }; 
  if (!args[0]) return api.sendMessage("يرجى إدخال اسم الملف", event.threadID);
  const fs = require("fs");
  const filePath = __dirname + "/" + args[0];
  if (!fs.existsSync(filePath)) return api.sendMessage("الملف غير موجود", event.threadID);
  fs.unlinkSync(filePath);
  api.sendMessage(`تم حذف الملف ${args[0]} بنجاح`, event.threadID);
};