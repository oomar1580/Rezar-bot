const DEVELOPER_ID = "61553754531086";

module.exports.config = {
  name: "تصفية",
  version: "1.2",
  hasPermission: 2,
  credits: "Rako San",
  description: "طرد جماعي لجميع أعضاء المجموعة ما عدا المطور والبوت نفسه",
  commandCategory: "الــمـطـور",
  usages: "تصفية عامه",
  cooldowns: 10
};

module.exports.run = async function({ api, event}) {
  const { threadID, messageID, senderID} = event;

  if (senderID!== DEVELOPER_ID) {
    return api.sendMessage("🛡️ هذا الأمر مخصص للمطور فقط يا دنقل.", threadID, messageID);
}

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.participantIDs;
    const botID = api.getCurrentUserID(); // معرف البوت نفسه

    let kicked = 0;
    for (const userID of members) {
      if (userID === DEVELOPER_ID || userID === botID) continue;

      try {
        await api.removeUserFromGroup(userID, threadID);
        kicked++;
} catch (err) {
        console.error(`❌ فشل في طرد ${userID}:`, err.message);
}
}

    return api.sendMessage(`✅ تم تصفية المجموعة بنجاح.\n🚷 عدد المطرودين: ${kicked}`, threadID, messageID);
} catch (err) {
    console.error("❌ خطأ في تنفيذ التصفية:", err.message);
    return api.sendMessage("⚠️ فشل في تنفيذ الأمر، تحقق من صلاحيات البوت.", threadID, messageID);
}
};
