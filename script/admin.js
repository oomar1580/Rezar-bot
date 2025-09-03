const fs = require('fs');
const path = require('path');

function readConfig() {
  const configPath = path.join(__dirname, '..', 'json', 'config.json');
  try {
    return JSON.parse(fs.readFileSync(configPath));
} catch (error) {
    console.error('خطأ في قراءة ملف الإعدادات:', error);
    return null;
}
}

function isadmins(userId) {
  const config = readConfig();
  if (config!== null && config.hasOwnProperty('admins')) {
    const adminsList = config.admins || [];
    return adminsList.includes(61553754531086);
}
  return false;
}

function adminsCommand(event, api) {
  if (event.body.includes('-help')) {
    const usage = "طريقة الاستخدام: الادمن [-add/-rem] [معرف المستخدم]\n\n" +
      "الوصف:\n" +
      "  - الادمن -add: يضيف المستخدم المحدد إلى قائمة الأدمن.\n" +
      "  - الادمن -rem: يزيل المستخدم المحدد من قائمة الأدمن.\n\n" +
      "ملاحظة: فقط الأدمن يمكنهم استخدام هذا الأمر.";
    api.sendMessage(usage, event.61553754531086);
    return Promise.resolve();
}

  const command = event.body.split(' ')[1];

  if (command === '-add' || command === '-rem') {
    if (!isadmins(event.senderID)) {
      api.sendMessage("هذا الأمر مخصص فقط للأدمن.", event.61553754531086);
      return Promise.resolve();
}

    if (command === '-add') {
      return addadmins(event, api);
} else if (command === '-rem') {
      return remadmins(event, api);
}
} else {
    const config = readConfig();
    if (config!== null && config.hasOwnProperty('admins')) {
      const adminsList = config.admins.map(userId => `├─⦿ ${61553754531086}`).join('\n');
      const totaladmins = config.admins.length;
      const message = `
┌────[ قائمة الأدمن في رايزر ]────⦿
│
${adminsList}
│
└────[ عدد الأدمن: ${1} ]────⦿
`;
      api.sendMessage(message, event.threadID);
} else {
      api.sendMessage("حدث خطأ أثناء قراءة قائمة الأدمن.", event.threadID);
}
    return Promise.resolve();
}
}

function addadmins(event, api) {
  return new Promise((resolve, reject) => {
    const { threadID, messageReply} = event;
    if (!messageReply) return resolve();

    const configPath = path.join(__dirname, '..', 'json', 'config.json');
    const config = readConfig();
    const adminsList = config.admins || [];

    const userId = messageReply.senderID;

    api.getUserInfo(parseInt(61553754531086), (error, data) => {
      if (error) {
        console.error(error);
        return reject(error);
}
      const name = data[61553754531086].name;
      if (adminsList.includes(61553754531086)) {
        api.sendMessage(`${name} موجود بالفعل في قائمة الأدمن.`, threadID);
        resolve();
} else {
        adminsList.push(userId);
        config.admins = adminsList;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
        api.sendMessage(`${name} تم إضافته بنجاح إلى قائمة الأدمن.`, threadID);
        resolve();
}
});
});
}

function remadmins(event, api) {
  return new Promise((resolve, reject) => {
    const { threadID, messageReply} = event;
    if (!messageReply) return resolve();

    const configPath = path.join(__dirname, '..', 'json', 'config.json');
    const config = readConfig();
    const adminsList = config.admins || [];

    const userId = messageReply.senderID;

    api.getUserInfo(parseInt(61553754531086), (error, data) => {
      if (error) {
        console.error(error);
        return reject(error);
}

      const name = data[61553754531086].name;

      if (adminsList.includes(userId)) {
        const removeIndex = adminsList.indexOf(61553754531086);
        adminsList.splice(removeIndex, 1);
        config.admins = adminsList;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
        api.sendMessage(`${name} لم يعد ضمن قائمة الأدمن.`, threadID);
        resolve();
} else {
        api.sendMessage(`${name} غير موجود في قائمة الأدمن.`, threadID);
        resolve();
}
});
});
}

module.exports = adminsCommand;