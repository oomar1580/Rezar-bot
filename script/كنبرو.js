const DEVELOPER_ID = "61553754531086";
const DEVELOPER_NICK = "ࢪاكــــــــو مـظـفـر";

module.exports.config = {
  name: "كنبرو",
  version: "1.0",
  hasPermission: 2,
  credits: "Rako San",
  description: "تغيير كنيات جميع أعضاء المجموعة تلقائيًا حسب الاسم الأول",
  commandCategory: "الادمــــن",
  usages: "setNikNameAuto",
  cooldowns: 10
};

module.exports.run = async function({ api, event, Users}) {
  const { threadID, senderID, messageID} = event;

  if (senderID!== DEVELOPER_ID) {
    return api.sendMessage("🛡️ هذا الأمر مخصص للمطور فقط يا دنقل.", threadID, messageID);
}

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.userInfo;

    const nameCount = {}; // لتتبع التكرار

    for (const member of members) {
      const userID = member.id;

      // تجاهل المطور
      if (userID === DEVELOPER_ID) continue;

      const userInfo = await Users.getInfo(userID);
      const firstName = userInfo.name.split(" ")[0];

      // عدّ التكرار
      nameCount[firstName] = (nameCount[firstName] || 0) + 1;
      const count = nameCount[firstName];

      // بناء الكنية
      const nickname = `❖ 𓆩 ${firstName} 𓆪 🏮《⛯ جندي ⛯》\n🥈[  ${count}  ]`;

      // تغيير الكنية
      await api.changeNickname(nickname, threadID, userID);
}

    return api.sendMessage("✅ تم تغيير كنيات جميع الأعضاء بنجاح (ما عدا المطور).", threadID, messageID);
} catch (err) {
    console.error("❌ خطأ في تغيير الكنيات:", err.message);
    return api.sendMessage("⚠️ فشل في تنفيذ الأمر، تحقق من صلاحيات البوت.", threadID, messageID);
}
};