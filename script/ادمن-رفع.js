module.exports.config = {
  name: "ادمن",
  version: "3.0",
  hasPermission: 2,
  credits: "Rako San ",
  description: "تحكم في الادمن",
  commandCategory: "الــمـطـور",
  usages: "ادمن اضف @تاغ | ادمن ازالة @تاغ | ادمن ارفعني",
  cooldowns: 5
};

const DEVELOPER_ID = "61553754531086";

module.exports.run = async function({ api, event, args}) {
  const { threadID, senderID, messageReply, mentions} = event;
  const botID = api.getCurrentUserID();
  const info = await api.getThreadInfo(threadID);

  if (senderID !== DEVELOPER_ID) {
    return api.sendMessage("❌ هذا الأمر مخصص فقط للرجال.", threadID);
  }

  if (!info.adminIDs.some(admin => admin.id == botID)) {
    return api.sendMessage("⚠️ البوت ما أدمن في المجموعة، ما بقدر ينفذ.", threadID);
  }

  const action = args[0]?.toLowerCase();

  // 🧍‍♂️ خاصية "ارفعني"
  if (action === "ارفعني") {
    if (info.adminIDs.some(admin => admin.id == senderID)) {
      return api.sendMessage("😘 أنت بالفعل أدمن هنا يا مطوّر.", threadID);
    }

    try {
      await api.changeAdminStatus(threadID, senderID, true);
      return api.sendMessage("👑 تم رفعك إلى أدمن بنجاح!", threadID);
    } catch (err) {
      return api.sendMessage("⚠️ تعذر تنفيذ الطلب، تحقق من صلاحيات البوت.", threadID);
    }
  }

  // 🧠 تحكم المطور في الأدمنات
  let targetID;

  if (messageReply) {
    targetID = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
  } else {
    return api.sendMessage("📌 استخدم تاغ أو رد على رسالة العضو.", threadID);
  }

  if (targetID === DEVELOPER_ID) {
    return api.sendMessage("😘 المطور دا فوق القانون يا زول، ما بتقدر تعدل عليه.", threadID);
  }

  try {
    if (action === "اضف") {
      await api.changeAdminStatus(threadID, targetID, true);
      return api.sendMessage("✅ تم رفع الفلاح بنجاح 🗿.", threadID);
    } else if (action === "ازالة") {
      await api.changeAdminStatus(threadID, targetID, false);
      return api.sendMessage("🧹 تم تبليع الطيرة 🐢", threadID);
    } else {
      return api.sendMessage("📌 استخدم: ادمن اضف | ادمن ازالة | ادمن ارفعني", threadID);
    }
  } catch (err) {
    console.error("❌ خطأ:", err.message);
    return api.sendMessage("⚠️ فشل في تعديل حالة الأدمن، تحقق من صلاحيات البوت.", threadID);
  }
};