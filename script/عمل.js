module.exports.config = {
name: "عمل",
version: "1.0.1",
hasPermssion: 0,
credits: "صلاح عمـــــــــكم ",
description: "يجب أن تعمل لتحصل على المال!",
commandCategory: "نــصـوص",
cooldowns: 5,
envConfig: {
cooldownTime: 1200000
}
};

module.exports.languages = {
"en": {
"cooldown": "لقد عملت اليوم، لتجنب الإرهاق يرجى العودة بعد: %1 دقيقة %2 ثانية.",
"rewarded": "لقد عملت كـ %1 و حصلت على %2$",
"job1": "بيع تذاكر يانصيب",
"job2": "إصلاح سيارة",
"job3": "برمجة",
"job4": "شفشفه فيسبوك ",
"job5": "طباخ",
"job6": "بنّاء",
"job7": "سائق تاكسي وهمي",
"job9": "سباك محظوظ ( ͡° ͜ʖ ͡°)",
"job10": "ستريمر",
"job11": "بائع إلكتروني",
"job12": "ربة منزل",
"job13": 'بيع "زهور"',
"job14": "البحث عن كود جاف/ لـ SpermLord",
"job15": "يلعب Yasuo ويحمل فريقه"
}
};

module.exports.run = async ({ event, api, Currencies, getText }) => {
const { threadID, messageID, senderID } = event;
const cooldown = global.configModule[this.config.name].cooldownTime;
let data = (await Currencies.getData(senderID)).data || {};
if (typeof data !== "undefined" && cooldown - (Date.now() - data.workTime) > 0) {
var time = cooldown - (Date.now() - data.workTime),
minutes = Math.floor(time / 60000),
seconds = ((time % 60000) / 1000).toFixed(0);
return api.sendMessage(getText("cooldown", minutes, (seconds < 10 ? "0" + seconds : seconds)), event.threadID, event.messageID);
} else {
const job = [
getText("job1"),
getText("job2"),
getText("job3"),
getText("job4"),
getText("job5"),
getText("job6"),
getText("job7"),
getText("job9"),
getText("job10"),
getText("job11"),
getText("job12"),
getText("job13"),
getText("job14"),
getText("job15")
];
const amount = Math.floor(Math.random() * 600);
return api.sendMessage(getText("rewarded", job[Math.floor(Math.random() * job.length)], amount), threadID, async () => {
await Currencies.increaseMoney(senderID, parseInt(amount));
data.workTime = Date.now();
await Currencies.setData(event.senderID, { data });
return;
}, messageID);
}
};