const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "سجل",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rako San ",
  description: "عرض سجل التغييرات المحمية",
  commandCategory: "الــمـطـور",
  usages: "[عرض سجل التغييرات]",
  cooldowns: 5
};

module.exports.run = async function({ api, event}) {
  const { threadID, senderID} = event;

  // تجاهل غير المطور بصمت
  if (senderID!== "61553754531086") return;

  const logPath = path.join(__dirname, "..", "events", "changeLogs.json");

  if (!fs.existsSync(logPath)) {
    return api.sendMessage("📂 لا يوجد سجل تغييرات محفوظ حتى الآن.", threadID);
}

  let logs;
  try {
    logs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
} catch (err) {
    return api.sendMessage("❌ فشل في قراءة سجل التغييرات.", threadID);
}

  if (logs.length === 0) {
    return api.sendMessage("📭 السجل فارغ، لا توجد تغييرات غير مصرح بها.", threadID);
}

  // تنسيق السجل
  const formatted = logs
.slice(-10) // عرض آخر 10 تغييرات فقط
.reverse()
.map((log, index) => {
      const time = new Date(log.time).toLocaleString("ar-EG", { hour12: false});
      switch (log.type) {
        case "name":
          return `📛 [${index + 1}] ${log.userName} (${log.userID})\n🔄 غيّر اسم المجموعة إلى: "${log.newName}"\n✅ تم استرجاع الاسم: "${log.restoredName}"\n🕒 ${time}`;
        case "image":
          return `🖼️ [${index + 1}] ${log.userName} (${log.userID})\n🔄 غيّر صورة المجموعة\n🗂️ تم حفظ الصورة باسم: ${log.backupImage}\n🕒 ${time}`;
        case "nickname":
          return `🏷️ [${index + 1}] ${log.userName} (${log.userID})\n🔄 غيّر كنية العضو (${log.targetID})\n✅ تم استرجاع الكنية الأصلية: "${log.restoredNickname}"\n🕒 ${time}`;
        default:
          return `❓ [${index + 1}] تغيير غير معروف من ${log.userName} (${log.userID})\n🕒 ${time}`;
}
})
.join("\n\n");

  return api.sendMessage(`📋 آخر تغييرات غير مصرح بها:\n\n${formatted}`, threadID);
};
