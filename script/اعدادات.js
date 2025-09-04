const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const activeGroupsFilePath = path.join(__dirname, "..", "events", "groupSettings.json");
const imageBackupDir = path.join(__dirname, "..", "events", "images");

fs.ensureDirSync(imageBackupDir);

let activeGroups = {};
if (fs.existsSync(activeGroupsFilePath)) {
 try {
 const fileData = fs.readFileSync(activeGroupsFilePath, "utf-8");
 activeGroups = JSON.parse(fileData);
 if (typeof activeGroups!== "object") activeGroups = {};
} catch (error) {
 console.error("❌ خطأ أثناء تحميل إعدادات المجموعات:", error);
}
}

const saveActiveGroups = () => {
 try {
 fs.writeFileSync(activeGroupsFilePath, JSON.stringify(activeGroups, null, 2), "utf-8");
} catch (error) {
 console.error("❌ خطأ أثناء حفظ إعدادات المجموعات:", error);
}
};

module.exports.config = {
 name: 'اعدادات',
  version: '1.0.0',
  role: 2,
  hasPrefix: true,
  aliases: ['حماية'],
  description: "تشغيل أو إيقاف حماية المجموعة",
  usage: "اعدادات تشغيل | اعدادات ايقاف",
  credits: 'Rako San'
};

this.run = async function({ api, event, args, Threads}) {
 const { threadID, senderID} = event;
 const threadInfo = await api.getThreadInfo(threadID);
 const isAdmin = threadInfo.adminIDs.some(admin => admin.id == senderID);
 const isBotAdmin = global.config.ADMINBOT.includes(senderID);

 if (!isAdmin &&!isBotAdmin) {
 return api.sendMessage("❌ هذا الأمر مخصص فقط للمشرفين أو مسؤولي البوت.", threadID);
}

 const initialGroupName = threadInfo.threadName;
 const initialGroupImage = threadInfo.imageSrc || "https://i.imgur.com/HUS1nK8.png";
 const imagePath = path.join(imageBackupDir, `${threadID}.jpg`);

 const { getData, setData, delData} = Threads;

 if (args[0] === "تشغيل") {
 if (!activeGroups[threadID]) {
 // حفظ صورة المجموعة محليًا
 try {
 const res = await axios.get(initialGroupImage, { responseType: "arraybuffer"});
 fs.writeFileSync(imagePath, Buffer.from(res.data, "binary"));
} catch (err) {
 console.warn("⚠️ تعذر تحميل صورة المجموعة:", err.message);
}

 // حفظ الكنيات الخاصة بكل مستخدم
 const nicknames = {};
 threadInfo.userInfo.forEach(user => {
 if (user.nickname) {
 nicknames[user.id] = user.nickname;
}
});

 activeGroups[threadID] = {
 name: initialGroupName,
 nicknames: nicknames
};

 const groupData = await getData(threadID);
 await setData(threadID, { threadInfo: groupData.threadInfo});
 saveActiveGroups();

 return api.sendMessage("✅ تم تفعيل الحماية على الاسم، الصورة، والكنيات.", threadID);
} else {
 return api.sendMessage("⚠️ الحماية مفعّلة مسبقًا في هذه المجموعة.", threadID);
}
} else if (args[0] === "ايقاف") {
 if (activeGroups[threadID]) {
 delete activeGroups[threadID];

 const imgToDelete = path.join(imageBackupDir, `${threadID}.jpg`);
 if (fs.existsSync(imgToDelete)) fs.unlinkSync(imgToDelete);

 await delData(threadID);
 saveActiveGroups();

 return api.sendMessage("🚫 تم تعطيل الحماية وتم حذف البيانات المرتبطة.", threadID);
} else {
 return api.sendMessage("⚠️ الحماية غير مفعّلة حاليًا في هذه المجموعة.", threadID);
}
} else {
 return api.sendMessage("ما كدا يا دنقل .\n📝 استخدم:\n'اعدادات تشغيل' لتفعيل\n'اعدادات ايقاف' للإلغاء", threadID);
}
};