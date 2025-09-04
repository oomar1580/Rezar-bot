.تعديل nino.js const axios = require('axios');

const binId = "68b1297bd0ea881f4069d28a"; // مثال: "68a6dedf43b1c97be92426df"
const masterKey = "$2a$10$V6m/7anDHsUmD8PNxlVHr.49kh2pau1VkKaQVzbUaPLwuyRa861Pe";

module.exports = {
  config: {
    name: "نينو",
    version: "1.0",
    hasPermssion: 0,
    credits: "Rako San",
    description: "شات بوت يجيب ردود من JSONBin",
    commandCategory: "نــصـوص",
    usages: "[رسالتك]",
    cooldowns: 5
},

  run: async function({ api, event, args}) {
    const msg = args.join(" ").trim();
    if (!msg) return api.sendMessage("احكي (𖠂_𖠂)", event.threadID);

    // جلب الردود من JSONBin
    let replies = {};
    try {
      const res = await axios.get(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: {
          "X-Master-Key": masterKey
}
});
      replies = res.data.record || {};
} catch (err) {
      return api.sendMessage("❌ فشل تحميل الردود من الخادم.", event.threadID);
}

    // البحث عن رد مباشر
    let reply = "";
    for (const key in replies) {
      if (msg.includes(key)) {
        reply = getRandom(replies[key]);
        break;
}
}

    // البحث عن رد جزئي
    if (!reply) {
      const words = msg.split(" ");
      for (const word of words) {
        for (const key in replies) {
          if (key.includes(word) || word.includes(key)) {
            reply = getRandom(replies[key]);
            break;
}
}
        if (reply) break;
}
}

    // رد افتراضي
    if (!reply) reply = "احكي عربي (𖠂_𖠂)";

    return api.sendMessage(reply, event.threadID);
}
};

// دالة لاختيار رد عشوائي
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}