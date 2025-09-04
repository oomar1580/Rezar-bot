module.exports.config = {
// name: "antiout", // اسم الوحدة
  eventType: ["log:unsubscribe"], // نوع الحدث
  version: "0.0.1", // الإصدار
  credits: "MIRAI-BOT", // الائتمان
  description: "إشعار للمجموعة عند مغادرة شخص ما وحاول إعادة إضافتهم مع صورة/فيديو عشوائي" // الوصف
};

module.exports.run = async ({ event, api, Threads, Users }) => {
  // الحصول على بيانات المجموعة
  let data = (await Threads.getData(event.threadID)).data || {};
  
  // إذا كانت خاصية antiout معطلة، فلا تفعل شيئًا
  if (data.antiout == false) return;
  
  // تجاهل إذا تمت إزالة البوت نفسه
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
  
  // الحصول على اسم المستخدم الذي غادر
  const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
  
  // تحديد نوع المغادرة (مغادرة ذاتية أو إزالة من قبل الإدارة)
  const type = (event.author == event.logMessageData.leftParticipantFbId) ? "مغادرة ذاتية" : "إزالة من قبل الإدارة";
  
  // إذا كانت المغادرة ذاتية، حاول إعادة إضافة المستخدم
  if (type == "مغادرة ذاتية") {
    api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error, info) => {
      if (error) {
        // إرسال رسالة خطأ إذا فشلت إعادة الإضافة
        api.sendMessage(`${name}\n ☝🐸 شايفين الءب دا طلع ود فدادية ما بلزمنا  \n⋆✦⎯⎯⎯⎯⎯⎯⎯⎯✦⋆\n`, event.threadID);
      } else {
        // إرسال رسالة نجاح إذا تمت إعادة الإضافة بنجاح
        api.sendMessage(`يا 🐸🗿 ${name} ماش وين يا سابي خش هنا خلي نبلعك بانكاي نحن \n⋆✦⎯⎯⎯⎯⎯⎯⎯⎯✦⋆\n`, event.threadID);
      }
    });
  }
};