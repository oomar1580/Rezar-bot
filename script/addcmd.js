module.exports.config = {
  name: "اضف",
  version: "1.0",
  hasPermssion: 2,
  credits: "مطور البوت",
  description: "إضافة أمر جديد",
  commandCategory: "الــمـطـور",
  usages: ".add <اسم الأمر>.js <كود الأمر>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
const { senderID } = event;
  if (senderID !== "61553754531086") {
    return api.sendMessage("⚠️ هذا الأمر متاح فقط للمالك.", event.threadID);
  }
  if (!args[0]) return api.sendMessage("يرجى إدخال اسم الأمر", event.threadID);
  if (!args[1]) return api.sendMessage("يرجى إدخال كود الأمر", event.threadID);

  const fs = require("fs");
  const path = require("path");
  const fileName = args[0];
  const filePath = path.join(__dirname, fileName);
  const code = args.slice(1).join(" ");

  if (fs.existsSync(filePath)) return api.sendMessage("الأمر موجود مسبقًا", event.threadID);

  fs.writeFileSync(filePath, code);
  api.sendMessage(`تم إضافة الأمر ${fileName} بنجاح`, event.threadID);
};