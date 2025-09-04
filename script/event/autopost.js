module.exports["config"] = {
   // name: "autopost",
    version: "1.0.0",
    credits: "Rako San",
};

let isCronStarted = false;

const greetings = {
    morning: [
        "صباح الخير! أتمنى لك يومًا رائعًا!",
        "انهض وتألّق! صباح الخير!",
        "صباح النور! أتمنى لك يومًا مليئًا بالإيجابية!",
        "استيقظوا، لقد أصبح الصباح!",
    ],
    afternoon: [
        "مساء الخير! واصل العمل الرائع!",
        "أتمنى لك ظهيرة ممتعة!",
        "مرحبًا! نتمنى لك ظهيرة مليئة بالراحة!",
        "حان وقت تناول شيء لذيذ!",
        "وقت الغداء يا أصدقاء، لا تنسوا الأكل!",
    ],
    evening: [
        "مساء الخير! استرخِ واستمتع بوقتك!",
        "أتمنى أن يكون يومك مثمرًا!",
        "مساء هادئ وممتع للجميع!",
    ],
    night: [
        "تصبحون على خير! ارتاحوا جيدًا!",
        "ليلة سعيدة وأحلام جميلة!",
        "نتمنى لكم ليلة هادئة ومريحة!",
        "هيا إلى النوم الآن!",
    ]
};

function greetRandom(timeOfDay) {
    const messages = greetings[timeOfDay];
    return messages[Math.floor(Math.random() * messages.length)];
}

async function motivation(chat) {
    try {
        console.log('يتم نشر اقتباسات تحفيزية...');
        const response = await require('axios').get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
        const quotes = response.data;
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const quote = `"${randomQuote.quoteText}"\n\n— ${randomQuote.quoteAuthor || "Kenneth Panio"}`;
        await chat.post(require('chatbox-utility').font.thin(quote));
} catch (error) {
        console.error('خطأ أثناء جلب أو نشر الاقتباس التحفيزي:', error);
}
}

async function greetThreads(chat, timeOfDay) {
    try {
        console.log(`يتم إرسال تحية ${timeOfDay}...`);
        const msgTxt = greetRandom(timeOfDay);
        const threads = await chat.threadList(10, null, ['INBOX']);
        if (!threads || threads.length === 0) return;
        for (const thread of threads) {
            if (thread.isGroup) {
                await chat.reply(require('chatbox-utility').font.thin(msgTxt), thread.threadID);
}
}
} catch (error) {
        console.error(`خطأ أثناء إرسال تحية ${timeOfDay}:`, error);
}
}

const scheduleCronJobs = (chat, hours, timeOfDay) => {
    if (!Array.isArray(hours)) return;
    hours.forEach(hour => {
        require('node-cron').schedule(`0 ${hour} * * *`, () => {
            console.log(`تم جدولة تحية ${timeOfDay} في الساعة ${hour}`);
            greetThreads(chat, timeOfDay);
}, {
            scheduled: true,
            timezone: 'Asia/Dhaka'
});
});
};

module.exports["handleEvent"] = async function ({ api, event}) {
    const chat = new (require('chatbox-utility').OnChat)(api, event);
    if (!isCronStarted) {
        isCronStarted = true;
        scheduleCronJobs(chat, [5, 6, 7], 'morning');
        scheduleCronJobs(chat, [12, 13], 'afternoon');
        scheduleCronJobs(chat, [18, 19, 20, 21], 'evening');
        scheduleCronJobs(chat, [22, 23], 'night');
        require('node-cron').schedule('*/50 * * * *', () => motivation(chat), {
            scheduled: true,
            timezone: 'Asia/Dhaka'
});
}
};