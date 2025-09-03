module.exports.config = {
    name: "ملف",
    version: "1.0.1",
    hasPermssion: 2,
    credits: "Rako San",
    description: "حذف ملف أو مجلد من مجلد الأوامر",
    commandCategory: "إداري",
    usages: "\nملف start <نص>\nملف ext <نص>\nملف <نص>\nملف [فارغ]\nملف help\nملاحظة: <نص> هو الحرف أو الكلمة التي تريد إدخالها",
    cooldowns: 5
};

module.exports.handleReply = ({ api, event, args, handleReply}) => {
    if (event.senderID!= handleReply.author) return;
    const fs = require("fs-extra");
    const arrnum = event.body.split(" ");
    let msg = "";
    const nums = arrnum.map(n => parseInt(n));

    for (let num of nums) {
        const target = handleReply.files[num - 1];
        const fileOrdir = fs.statSync(__dirname + '/' + target);
        let typef = "";

        if (fileOrdir.isDirectory()) {
            typef = "[مجلد🗂️]";
            fs.rmdirSync(__dirname + '/' + target, { recursive: true});
} else if (fileOrdir.isFile()) {
            typef = "[ملف📄]";
            fs.unlinkSync(__dirname + "/" + target);
}

        msg += `${typef} ${target}\n`;
}

    api.sendMessage("⚡️تم حذف الملفات التالية من مجلد الأوامر:\n\n" + msg, event.threadID, event.messageID);
};

module.exports.run = async function ({ api, event, args}) {
    const fs = require("fs-extra");
    let files = fs.readdirSync(__dirname + "/") || [];
    let msg = "", i = 1, key = "";

    if (args[0] == 'help') {
        msg = `
طريقة استخدام الأمر:
• المفتاح: start <نص>
• التأثير: تصفية الملفات التي تبدأ بحرف معين
• مثال: ملف start test
• المفتاح: ext <نص>
• التأثير: تصفية الملفات حسب الامتداد
• مثال: ملف ext js
• المفتاح: فارغ
• التأثير: عرض جميع الملفات والمجلدات
• مثال: ملف
• المفتاح: help
• التأثير: عرض طريقة الاستخدام
• مثال: ملف help`;
        return api.sendMessage(msg, event.threadID, event.messageID);
} else if (args[0] == "start" && args[1]) {
        const word = args.slice(1).join(" ");
        files = files.filter(file => file.startsWith(word));
        if (files.length == 0) return api.sendMessage(`⚡️لا توجد ملفات تبدأ بـ: ${word}`, event.threadID, event.messageID);
        key = `⚡️يوجد ${files.length} ملف يبدأ بـ: ${word}`;
} else if (args[0] == "ext" && args[1]) {
        const ext = args[1];
        files = files.filter(file => file.endsWith(ext));
        if (files.length == 0) return api.sendMessage(`⚡️لا توجد ملفات تنتهي بـ: ${ext}`, event.threadID, event.messageID);
        key = `⚡️يوجد ${files.length} ملف ينتهي بـ: ${ext}`;
} else if (!args[0]) {
        if (files.length == 0) return api.sendMessage("⚡️لا توجد ملفات أو مجلدات في مجلد الأوامر", event.threadID, event.messageID);
        key = "⚡️جميع الملفات في مجلد الأوامر:";
} else {
        const word = args.join(" ");
        files = files.filter(file => file.includes(word));
        if (files.length == 0) return api.sendMessage(`⚡️لا توجد ملفات تحتوي على: ${word}`, event.threadID, event.messageID);
        key = `⚡️يوجد ${files.length} ملف يحتوي على: ${word}`;
}

    files.forEach(file => {
        const fileOrdir = fs.statSync(__dirname + '/' + file);
        const typef = fileOrdir.isDirectory()? "[مجلد🗂️]": "[ملف📄]";
        msg += `${i++}. ${typef} ${file}\n`;
});

    api.sendMessage(`⚡️قم بالرد على هذه الرسالة بالأرقام لحذف الملفات المقابلة، يمكنك الرد بأكثر من رقم مفصول بمسافة.\n${key}\n\n${msg}`, event.threadID, (e, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            files
});
});
};