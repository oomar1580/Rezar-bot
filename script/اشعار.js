const fs = require("fs");
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "اشعار",
  version: "0.0.4",
  hasPermssion: 2,
  credits: "Rako San ",
  description: "ارسال رسالة إلى جميع المجموعات، مع دعم الصور",
  commandCategory: "الــمـطـور",
  usages: "اشعار [الرسالة] (رد على صورة)",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args}) {
  const permission = ["61553754531086"];
  if (!permission.includes(event.senderID)) return api.sendMessage("❌ هذا الامر مخصص لذكور فقط ", event.threadID, event.messageID);

  const msg = args.join(" ");
  if (!msg) return api.sendMessage("يرجى كتابة الرسالة بعد الأمر", event.threadID, event.messageID);

  const gio = moment.tz("Asia/Baghdad").format("HH:mm:ss D/MM/YYYY");
  const threads = await api.getThreadList(100, null, ['INBOX']);
  const groups = threads.filter(thread => thread.threadID!== event.threadID && thread.isGroup);

  let imagePath = null;

  // ✅ تحقق من وجود صورة في الرد
  if (event.messageReply && event.messageReply.attachments.length> 0) {
    const attachment = event.messageReply.attachments[0];
    if (attachment.type === "photo") {
      const url = attachment.url;
      const fileName = `temp_${Date.now()}.jpg`;
      imagePath = path.join(__dirname, fileName);

      const response = await axios.get(url, { responseType: "arraybuffer"});
      fs.writeFileSync(imagePath, Buffer.from(response.data, "utf-8"));
}
}

  let count = 0;

  for (const group of groups) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // ⏳ تأخير 3 ثواني

    const message = {
      body: `❖━━[ اشعار من المطور ]━━❖\nالوقت: ${gio}\n\nالرسالة: ${msg}`
};

    if (imagePath) {
      message.attachment = fs.createReadStream(imagePath);
}

    api.sendMessage(message, group.threadID);
    count++;
}

  // ✅ حذف الصورة بعد الإرسال
  if (imagePath && fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
}

  return api.sendMessage(`✅ تم إرسال الرسالة إلى ${count} مجموعة${imagePath? " مع صورة": ""} بنجاح`, event.threadID, event.messageID);
};