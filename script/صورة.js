const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "صورة",
  version: "2.1.0",
  hasPermission: 0,
  credits: "Kibutsuji",
  description: "يرسل صورة عشوائية مع تفاعل محدود حسب الوقت (باستثناء المطور)",
  commandCategory: "صــــــور",
  usages: "",
  cooldowns: 3
};

const userRequestMap = {}; // messageID -> userID
const usageMap = {}; // userID -> { count, lastUsed}

const MAX_USES = 5;
const COOLDOWN_MS = 30 * 60 * 1000; // نصف ساعة
const OWNER_ID = "61553754531086"; // ID المطور

async function sendImage(api, threadID, userID) {
  const imageURL = "https://rapido.zetsu.xyz/api/ba";

  try {
    const res = await axios.get(imageURL, { responseType: "stream"});
    const tempPath = path.join(__dirname, "temp.jpg");
    const writer = fs.createWriteStream(tempPath);

    res.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        api.sendMessage({
          body: "❀┊تفاعل بـ 👍 لإرسال المزيد!",
          attachment: fs.createReadStream(tempPath)
}, threadID, (err, messageInfo) => {
          fs.unlinkSync(tempPath);
          if (!err && messageInfo?.messageID) {
            userRequestMap[messageInfo.messageID] = userID;
}
          resolve();
});
});

      writer.on("error", err => {
        console.error("❌ خطأ في حفظ الصورة:", err.message);
        api.sendMessage("⚠️ فشل تحميل الصورة.", threadID);
        reject(err);
});
});

} catch (err) {
    console.error("❌ فشل الوصول إلى API:", err.message);
    api.sendMessage("⚠️ تعذر جلب الصورة من المصدر.", threadID);
}
}

module.exports.run = async function({ api, event}) {
  const { threadID, senderID} = event;
  const now = Date.now();

  // المطور مستثنى من الحماية
  if (senderID!== OWNER_ID) {
    const usage = usageMap[senderID] || { count: 0, lastUsed: 0};

    if (usage.count>= MAX_USES && now - usage.lastUsed < COOLDOWN_MS) {
      return api.sendMessage("❌ استخدمت الأمر 5 مرات بالفعل.\n⏳ حاول بعد نصف ساعة.", threadID);
}

    if (now - usage.lastUsed>= COOLDOWN_MS) {
      usage.count = 0;
}

    usage.count++;
    usage.lastUsed = now;
    usageMap[senderID] = usage;
}

  await sendImage(api, threadID, senderID);
};

module.exports.handleReaction = async function({ api, event}) {
  const { messageID, userID, threadID, reaction} = event;
  const now = Date.now();

  if (reaction!== "👍") return;
  if (userRequestMap[messageID]!== userID) return;

  // المطور مستثنى من الحماية
  if (userID!== OWNER_ID) {
    const usage = usageMap[userID] || { count: 0, lastUsed: 0};

    if (usage.count>= MAX_USES && now - usage.lastUsed < COOLDOWN_MS) return;

    if (now - usage.lastUsed>= COOLDOWN_MS) {
      usage.count = 0;
}

    usage.count++;
    usage.lastUsed = now;
    usageMap[userID] = usage;
}

  await sendImage(api, threadID, userID);
};