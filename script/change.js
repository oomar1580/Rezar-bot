module.exports.config = {
  name: "تعديل",
  version: "1.0",
  hasPermssion: 2,
  credits: "مطور البوت",
  description: "تعديل أمر",
  commandCategory: "الــمـطـور",
  usages: ".تعديل <اسم الأمر>.js <كود الأمر>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
const { senderID } = event;
  if (senderID !== "61553754531086") {
    return api.sendMessage("⚠️ هذا الأمر متاح فقط للمالك.", event.threadID);
  }
  if (!args[0]) return api.sendMessage("يرجى إدخال اسم الأمر", event.threadID);
  const fileName = args[0];
  const filePath = __dirname + "/" + fileName;
  const newCode = args.slice(1).join(" ");
  const fs = require("fs");
  if (!fs.existsSync(filePath)) return api.sendMessage("الأمر غير موجود", event.threadID);
  fs.writeFileSync(filePath, newCode);
  api.sendMessage(`تم تعديل الأمر ${fileName} بنجاح`, event.threadID);
};