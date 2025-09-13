const moment = require("moment-timezone");
moment.tz.setDefault("Africa/Khartoum");

module.exports = function ({ api, models, Users, Threads, Currencies}) {
 const logger = require("../../utils/log.js");
 const developerID = "61553754531086"; // آيديك يا زول

 return async function ({ event}) {
 const { threadID, logMessageType, logMessageData, author} = event;
 const { setData, getData, delData} = Threads;

 try {
 let threadData = await getData(threadID);
 if (!threadData) {
 logger('❌ بيانات المجموعة غير موجودة: ' + threadID, '[ERROR]');
 return;
}

 let dataThread = threadData.threadInfo || {};
 dataThread.adminIDs = dataThread.adminIDs || [];
 dataThread.participantIDs = dataThread.participantIDs || [];

 switch (logMessageType) {
 case "log:thread-admins": {
 if (logMessageData.ADMIN_EVENT == "add_admin") {
 dataThread.adminIDs.push({ id: logMessageData.TARGET_ID});
} else if (logMessageData.ADMIN_EVENT == "remove_admin") {
 dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id!= logMessageData.TARGET_ID);
}
 logger('🔄 تحديث قائمة الأدمن في المجموعة ' + threadID, '[UPDATE DATA]');
 await setData(threadID, { threadInfo: dataThread});
 break;
}

 case "log:thread-name": {
 dataThread.threadName = logMessageData.name;
 await setData(threadID, { threadInfo: dataThread});
 logger('🔄 تحديث اسم المجموعة ' + threadID, '[UPDATE DATA]');
 break;
}

 case 'log:unsubscribe': {
 const userFbId = logMessageData.leftParticipantFbId;

 // إذا البوت نفسه تم طرده
 if (userFbId == api.getCurrentUserID()) {
 logger('🗑️ حذف بيانات المجموعة بعد طرد البوت: ' + threadID, '[DELETE DATA THREAD]');
 const index = global.data.allThreadID?.findIndex(item => item == threadID);
 if (index> -1) global.data.allThreadID.splice(index, 1);
 await delData(threadID);

 // إرسال إشعار للمطور
 try {
 const info = await api.getThreadInfo(threadID);
 const groupName = info.name || "غير معروف";
 const time = moment().format("hh:mm A - DD/MM/YYYY");
 const messageToDev = `❌ تم طرد البوت من مجموعة:\n📌 الاسم: ${groupName}\n🆔 آيدي المجموعة: ${threadID}\n👤 الطارد: ${author}\n🕒 الوقت: ${time}`;
 await api.sendMessage(messageToDev, developerID);
} catch (err) {
 console.error("❌ فشل إرسال إشعار الطرد للمطور:", err.message);
}

 return;
}

 // إذا عضو عادي خرج → فقط تحديث البيانات بدون إرسال رسالة
 const participantIndex = dataThread.participantIDs.findIndex(item => item == userFbId);
 if (participantIndex> -1) dataThread.participantIDs.splice(participantIndex, 1);

 const adminIndex = dataThread.adminIDs.findIndex(item => item.id == userFbId);
 if (adminIndex> -1) dataThread.adminIDs.splice(adminIndex, 1);

 logger('🗑️ حذف بيانات العضو: ' + userFbId, '[DELETE DATA USER]');
 await setData(threadID, { threadInfo: dataThread});

 break;
}
}
} catch (e) {
 console.error('❌ خطأ أثناء تحديث البيانات: ' + e);
}

 return;
};
};