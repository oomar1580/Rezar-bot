const fs = require("fs-extra");
const path = require("path");

const activeGroupsFilePath = path.join(__dirname, "groupSettings.json");
const imageBackupDir = path.join(__dirname, "images");

// تحميل إعدادات الحماية
let activeGroups = {};
if (fs.existsSync(activeGroupsFilePath)) {
  try {
    const data = fs.readFileSync(activeGroupsFilePath, "utf-8");
    activeGroups = JSON.parse(data);
} catch (e) {
    console.error("❌ فشل قراءة إعدادات الحماية:", e.message);
}
}

module.exports.config = {
  //name: "antichanget",
  eventType: [
    "log:thread-name",
    "log:thread-image",
    "log:subscribe",
    "log:thread-nickname"
  ],
  version: "1.0.4",
  credits: "Kibutsuji",
  description: "منع التغييرات غير المصرح بها داخل المجموعة"
};

module.exports.run = async function({ api, event, Threads, Users}) {
  const { logMessageType, logMessageData, author, threadID} = event;

  if (!activeGroups[threadID]) return;

  const BOT_ID = "100058293865622";

  // تجاهل البوت إذا كان هو الفاعل
  if (author === BOT_ID && ["log:thread-name", "log:thread-image", "log:thread-nickname"].includes(logMessageType)) return;

  const threadInfo = (await Threads.getData(threadID)).threadInfo;
  const admins = threadInfo.adminIDs.map(admin => admin.id);
  if (admins.includes(author)) return;

  const userName = await Users.getNameUser(author);

  // حماية اسم المجموعة
  if (logMessageType === "log:thread-name") {
    await api.setTitle(activeGroups[threadID].name || threadInfo.threadName, threadID);
    return api.sendMessage(`🚫 ${userName} غير مسموح لك بتغيير اسم المجموعة.`, threadID);
}

  // حماية صورة المجموعة
  if (logMessageType === "log:thread-image") {
    const imagePath = path.join(imageBackupDir, `${threadID}.jpg`);
    try {
      if (fs.existsSync(imagePath)) {
        await api.changeGroupImage(fs.createReadStream(imagePath), threadID);
}
} catch (err) {
      console.warn("❌ فشل استرجاع الصورة:", err.message);
}
    return api.sendMessage(`🚫 ${userName} غير مسموح لك بتغيير صورة المجموعة.`, threadID);
}

  // منع إضافة أعضاء غير مصرح بهم
  if (logMessageType === "log:subscribe") {
    const addedIDs = logMessageData.addedParticipants.map(u => u.userFbId);
    for (const id of addedIDs) {
      await api.removeUserFromGroup(id, threadID);
}
    return api.sendMessage(`🚫 ${userName} لا يمكنك إضافة أعضاء إلى المجموعة.`, threadID);
}

  // حماية الكنيات
  if (logMessageType === "log:thread-nickname") {
    const targetID = logMessageData?.nicknameChange?.participant_id;
    const originalNickname = activeGroups[threadID]?.nicknames?.[targetID];

    if (originalNickname && typeof originalNickname === "string") {
      try {
        await api.changeNickname(originalNickname, targetID, threadID);
} catch (err) {
        console.warn("⚠️ فشل استرجاع الكنية:", err.message);
}
}

    return api.sendMessage(`🚫 ${userName} غير مسموح لك بتغيير كنية أحد في هذه المجموعة.`, threadID);
}
};