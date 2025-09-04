const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "شوتي",
    version: "1.0.0",
    permission: 0,
    description: "فيديو عشوائي من واجهة Shoti API",
    prefix: false,
    premium: false,
    credits: "Rako San",
    cooldowns: 10,
    category: "وسائط"
};

module.exports.run = async function ({ api, event}) {
    try {
        const response = await axios.get('https://kaiz-apis.gleeze.com/api/shoti');
        const data = response.data.shoti;
        const fileName = `${event.messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const { videoUrl, title, username, nickname, region} = data;

        const downloadResponse = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
});

        const writer = fs.createWriteStream(filePath);
        downloadResponse.data.pipe(writer);

        writer.on('finish', async () => {
            api.sendMessage({
                body: `🎬 العنوان: ${title}\n👤 المستخدم: ${username}\n📛 الاسم المستعار: ${nickname}\n🌍 المنطقة: ${region}`,
                attachment: fs.createReadStream(filePath)
}, event.threadID, () => {
                fs.unlinkSync(filePath);
}, event.messageID);
});

        writer.on('error', () => {
            api.sendMessage('حدث خطأ أثناء تحميل الفيديو. يرجى المحاولة لاحقًا.', event.threadID, event.messageID);
});

} catch (error) {
        console.error('خطأ في جلب الفيديو:', error);
        api.sendMessage(error.message, event.threadID, event.messageID);
}
};