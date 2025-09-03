const fs = require("fs");
const util = require("util");
const path = require("path");
const os = require("os");

const unlinkAsync = util.promisify(fs.unlink);

const historyFilePath = path.resolve(__dirname, '..', 'data', 'history.json');

let historyData = [];

try {
  historyData = require(historyFilePath);
} catch (readError) {
  console.error('خطأ في قراءة ملف history.json:', readError);
}

module.exports.config = {
  name: 'جلسة',
  aliases: ["قائمة-المستخدمين", "قائمة-البوتات", "المستخدمين-النشطين", "قائمة-الاعضاء", "بوتات", "نشطين", "جلسات-نشطة", "حالة-البوت"],
  description: 'عرض جميع البوتات النشطة في سجل الجلسات.',
  version: '1.4.0',
  role: 2,
  cooldown: 0,
  credits: "Rako San",
  hasPrefix: false,
  usage: "جلسة-نشطة",
  dependencies: {
    "process": ""
}
};

module.exports.run = async function ({ api, event, args}) {
  const pogi = "61553754531086";
   if (!pogi.includes(event.senderID))
   return api.sendMessage("هذا الأمر مخصص فقط لمالك بوت رايزر ", event.threadID, event.messageID);
  const { threadID, messageID} = event;

  if (args[0] && args[0].toLowerCase() === 'تسجيل-الخروج') {
    await logout(api, event);
    return;
}

  if (historyData.length === 0) {
    api.sendMessage('لا يوجد مستخدمين في سجل الجلسات.', threadID, messageID);
    return;
}

  const currentUserId = api.getCurrentUserID();
  const mainBotIndex = historyData.findIndex(user => user.userid === currentUserId);

  if (mainBotIndex === -1) {
    api.sendMessage('لم يتم العثور على البوت الرئيسي في السجل.', threadID, messageID);
    return;
}

  const mainBot = historyData[mainBotIndex];
  const mainBotName = await getUserName(api, currentUserId);
  const mainBotOSInfo = getOSInfo();
  const mainBotRunningTime = convertTime(mainBot.time);

  const userPromises = historyData
.filter((user) => user.userid!== currentUserId)
.map(async (user, index) => {
      const userName = await getUserName(api, user.userid);
      const userRunningTime = convertTime(user.time);
      return `[ ${index + 1} ]\nالاسم: ${userName}\nالمعرف: ${user.userid}\nمدة التشغيل: ${userRunningTime}`;
});

  const userList = (await Promise.all(userPromises)).filter(Boolean);

  const userCount = userList.length;

  const userMessage = `البوت الرئيسي: ${mainBotName}\nالمعرف: ${currentUserId} \nمدة التشغيل: ${mainBotRunningTime}\n\n| النظام |\n\n${mainBotOSInfo}\n\nجلسات أخرى [${userCount}]\n\n${userList.join('\n')}\n\n إذا كنت ترغب في إنهاء الجلسة في أي وقت، فقط اكتب "جلسة-نشطة تسجيل-الخروج" وسأغادر بهدوء.`;

  api.sendMessage(userMessage, threadID, messageID);
};

async function logout(api, event) {
  const { threadID, messageID} = event;
  const currentUserId = api.getCurrentUserID();
  const jsonFilePath = path.resolve(__dirname, '..', 'data', 'session', `${currentUserId}.json`);

  try {
    await unlinkAsync(jsonFilePath);
    api.sendMessage('تم تسجيل خروج البوت!', threadID, messageID, ()=> process.exit(1));
} catch (error) {
    console.error('خطأ أثناء حذف ملف الجلسة:', error);
    api.sendMessage('حدث خطأ أثناء تسجيل الخروج. حاول مرة أخرى.', threadID, messageID);
}
}

async function getUserName(api, userID) {
  try {
    const userInfo = await api.getUserInfo(userID);
    return userInfo && userInfo[userID]? userInfo[userID].name: "غير معروف";
} catch (error) {
    return "غير معروف";
}
}

function getOSInfo() {
  const osInfo = `${os.type()} ${os.release()} ${os.arch()} (${os.platform()})`;
  const totalMemory = formatBytes(os.totalmem());
  const freeMemory = formatBytes(os.freemem());
  return `النظام: ${osInfo}\nالمعالج: ${os.cpus()[0].model}\nعدد الأنوية: ${os.cpus().length}\nالذاكرة الكلية: ${totalMemory}\nالذاكرة المتاحة: ${freeMemory}`;
}

function convertTime(timeValue) {
  const totalSeconds = parseInt(timeValue, 10);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const remainingHours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${days} يوم ${remainingHours} ساعة ${remainingMinutes} دقيقة ${remainingSeconds} ثانية`;
}

function formatBytes(bytes) {
  const sizes = ['بايت', 'ك.ب', 'م.ب', 'ج.ب', 'ت.ب'];
  if (bytes === 0) return '0 بايت';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
}