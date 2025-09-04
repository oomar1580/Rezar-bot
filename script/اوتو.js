this.config = {
  name: "اوتو",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rako San ",
  description: "إعادة تشغيل البوت يدويًا + تلقائيًا",
  commandCategory: "الــمـطـور",
  cooldowns: 0,
  images: [],
};

const ownerID = "61553754531086"; // حساب المطور
const devGroupID = "30837607085854897"; // مجموعة المطورين

this.run = ({ event, api}) => {
const { senderID } = event;
  if (senderID !== "61553754531086") {
    return;
  }
  api.sendMessage("🔄 جاري إعادة تشغيل البوت يدويًا...", event.threadID, () => {
    api.sendMessage("⚙️ البوت قام بعمل Restart يدوي الآن", ownerID);
    api.sendMessage("📢 تنبيه: تم تنفيذ Restart يدوي من مسؤول البوت", devGroupID);
    process.exit(1);
}, event.messageID);
};

// ⏱ إعادة تشغيل تلقائي كل 3 ساعات
setInterval(() => {
  const message = "🔁 البوت قام بعمل Restart تلقائي للحفاظ على استقراره\n⏱ التوقيت الحالي: " + new Date().toLocaleString("ar-EG", { timeZone: "Africa/Cairo"});

  try {
    global.api.sendMessage(message, ownerID);
    global.api.sendMessage(message, devGroupID);
} catch (e) {
    console.error("خطأ في إرسال تنبيه الإنعاش:", e);
}

  process.exit(1);
}, 3 * 60 * 60 * 1000); // كل 3 ساعات