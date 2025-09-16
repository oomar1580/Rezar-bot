const axios = require("axios");
const fs = require("fs");
const request = require("request");
const path = require("path");

module.exports.config = {
    name: "تتبع",
    version: "2.1.0",
    hasPermsion: 0,
    credits: "Rako San",
    description: "جلب معلومات باستخدام UID أو منشن أو الرد على رسالة",
    usages: "[رد/UID/منشن]",
    commandCategory: "معلومات",
    usePrefix: false,
    cooldowns: 0
};

function convert(time) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}||${hours}:${minutes}:${seconds}`;
}

const headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like) Version/12.0 AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1",
    "accept": "application/json, text/plain, _/_ "
};

module.exports.run = async function({ api, event, args}) {
    const token = "EAAD6V7....";
    let id;

    if (args.join().indexOf('@')!== -1) {
        id = Object.keys(event.mentions)[0];
} else if (event.type === "message_reply") {
        id = event.messageReply.senderID;
} else {
        id = args[0] || event.senderID;
}

    const filePath = path.join(__dirname, `/cache/info_${id}.png`);

    try {
        const resp = await axios.get(`https://graph.facebook.com/${id}?fields=id,is_verified,cover,created_time,work,hometown,username,link,name,locale,location,about,website,birthday,gender,relationship_status,significant_other,quotes,first_name,subscribers.summary{total_count}&access_token=${token}`, { headers});
        const data = resp.data;

        const name = data.name;
        const link_profile = data.link;
        const uid = data.id;
        const first_name = data.first_name;
        const username = data.username || "لا يوجد!";
        const created_time = convert(data.created_time);
        const web = data.website || "لا يوجد!";
        const gender = data.gender || "لا يوجد!";
        const relationship_status = data.relationship_status || "لا يوجد!";
        const love = data.significant_other? data.significant_other.name: "لا يوجد!";
        const bday = data.birthday || "لا يوجد!";
        const follower = data.subscribers?.summary?.total_count || "لا يوجد!";
        const is_verified = data.is_verified;
        const quotes = data.quotes || "لا يوجد!";
        const about = data.about || "لا يوجد!";
        const locale = data.locale || "لا يوجد!";
        const hometown = data.hometown?.name || "لا يوجد مدينة أصلية";
        const cover = data.cover?.source || "لا يوجد صورة غلاف";
        const avatar = `https://graph.facebook.com/${id}/picture?width=1500&height=1500&access_token=${token}`;

        const callback = () => {
            api.sendMessage({
                body: `•——معلومات الحساب——•\n📛 الاسم: ${name}\n🧾 الاسم الأول: ${first_name}\n📆 تاريخ الإنشاء: ${created_time}\n🔗 رابط الحساب: ${link_profile}\n🚻 الجنس: ${gender}\n💞 الحالة العاطفية: ${relationship_status}\n🎂 تاريخ الميلاد: ${bday}\n👥 عدد المتابعين: ${follower}\n🏡 المدينة الأصلية: ${hometown}\n🌐 اللغة: ${locale}\n•——النهاية——•`,
                attachment: fs.createReadStream(filePath)
}, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
};

        request(encodeURI(avatar)).pipe(fs.createWriteStream(filePath)).on("close", callback);

} catch (err) {
        api.sendMessage(`حدث خطأ: ${err.message}`, event.threadID, event.messageID);
        console.error(err);
}
};