module.exports.config = {
    name: "اشعار",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Rako San",
    description: "إرسال رسالة لجميع المجموعات، يمكن استخدامها فقط من قبل المطور.",
    usePrefix: true,
    commandCategory: "إشعارات",
    usages: "[النص]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args}) => {
    const المطور = ['61576232405796'];

    if (!المطور.includes(event.senderID)) {
        return api.sendMessage("❌ ليس لديك صلاحية استخدام هذا الأمر.", event.threadID);
}

    const threadList = await api.getThreadList(25, null, ['INBOX']);
    let sentCount = 0;
    const custom = args.join(' ');

    async function sendMessage(thread) {
        try {
            await api.sendMessage(`📢 إشعار من المطور\n------------------\n👤 المطور: Rako San\n------------------\n\n📌 محتوى الإشعار:\n"${custom}"`, thread.threadID);
            sentCount++;
} catch (error) {
            console.error("خطأ أثناء إرسال الرسالة:", error);
}
}

    for (const thread of threadList) {
        if (sentCount>= 20) break;
        if (thread.isGroup && thread.name!= thread.threadID && thread.threadID!= event.threadID) {
            await sendMessage(thread);
}
}

    if (sentCount> 0) {
        api.sendMessage(`✅ تم إرسال الإشعار إلى ${sentCount} مجموعة بنجاح.`, event.threadID);
} else {
        api.sendMessage("⚠️ لم يتم العثور على مجموعات مؤهلة لإرسال الإشعار إليها.", event.threadID);
}
};
