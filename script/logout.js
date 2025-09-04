module.exports.config = {
    name: "تسجيل-خروج",
    version: "1.0.1",
    role: 2,
    credits: "Rako San",
    description: "تسجيل خروج من حساب البوت",
    commandCategory: "نظام",
    usages: "",
    cooldowns: 0
};

module.exports.run = async function({ api, event })
{
api.sendMessage("جاري تسجيل الخروج ...",event.threadID,event.messageID)
api.logout()
}