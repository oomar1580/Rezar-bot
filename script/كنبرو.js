const DEVELOPER_ID = "61553754531086";

module.exports.config = {
  name: "كنبرو",
  version: "1.1",
  role: 2,
  credits: "Rako San",
  description: "تغيير كنيات الأعضاء بزخرفة مخصصة حسب الاسم والجنس",
  commandCategory: "الــمـطـور",
  usages: "كنيةاوتو [الزخرفة]",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args, Users}) {
  const { threadID, senderID, messageID} = event;

  if (senderID!== DEVELOPER_ID) {
    return api.sendMessage("🛡️ هذا الأمر مخصص للمطور فقط يا دنقل.", threadID, messageID);
}

  const format = args.join(" ").trim();
  if (!format.includes("اسم") ||!format.includes("جنس")) {
    return api.sendMessage("⚠️ لازم تحتوي الزخرفة على كلمة 'اسم' و 'جنس' عشان أقدر أركّبها.", threadID, messageID);
}

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.userInfo;

    for (const member of members) {
      const userID = member.id;
      if (userID === DEVELOPER_ID) continue;

      const userInfo = await Users.getInfo(userID);
      const firstName = userInfo.name.split(" ")[0];

      // تحديد الجنس من كل الاحتمالات
      let gender = "مـواطـن";
      const rawGender = userInfo.gender;
      if (rawGender === "FEMALE" || rawGender === 2 || rawGender === "2") {
        gender = "مـواطـنـة";
}

      // نقاط افتراضية
      const points = 0;

      // تركيب الكنية حسب الزخرفة
      const nickname = format
.replace(/اسم/g, firstName)
.replace(/جنس/g, gender)
.replace(/0ن/g, `${points}ن`);

      await api.changeNickname(nickname, threadID, userID);
}

    return api.sendMessage("✅ تم تغيير كنيات الأعضاء بنجاح حسب الزخرفة المختارة.", threadID, messageID);
} catch (err) {
    console.error("❌ خطأ في تغيير الكنيات:", err.message);
    return api.sendMessage("⚠️ فشل في تنفيذ الأمر، تحقق من صلاحيات البوت.", threadID, messageID);
}
};