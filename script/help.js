const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const IMAGE_URL = "https://i.postimg.cc/qRyRRbLx/Messenger-creation-EC4-D26-A9-6-D6-A-4-D84-9-F29-A6-CE7-B80-B2-FC.jpg";
const LOCAL_IMG_PATH = path.join(__dirname, "img", "menu.png");
const FALLBACK_IMG_PATH = path.join(__dirname, "cache", "menu.jpg");
const BOT_NAME = "رازر";
const DEVELOPER_NAME = "Rako San";

module.exports.config = {
  name: "اوامر",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["معلومات"],
  description: "عرض قائمة الأوامر أو تفاصيل أمر معين",
  usage: "اوامر [رقم الصفحة] أو [اسم الأمر]",
  credits: "Rako San"
};

async function getImageStream() {
  if (fs.existsSync(LOCAL_IMG_PATH)) {
    return fs.createReadStream(LOCAL_IMG_PATH);
}

  fs.ensureDirSync(path.dirname(FALLBACK_IMG_PATH));
  if (!fs.existsSync(FALLBACK_IMG_PATH)) {
    const res = await axios.get(IMAGE_URL, { responseType: "arraybuffer"});
    fs.writeFileSync(FALLBACK_IMG_PATH, res.data);
}

  return fs.createReadStream(FALLBACK_IMG_PATH);
}

module.exports.run = async function({ api, event, args, enableCommands, Utils, prefix}) {
  const { threadID, messageID} = event;
  const commands = enableCommands[0].commands;
  const allCommands = [...Utils.commands];

  if (args.length === 0 ||!isNaN(args[0])) {
    const page = parseInt(args[0]) || 1;
    const perPage = 20;
    const start = (page - 1) * perPage;
    const end = start + perPage;

    let msg = `⊙─────『قائمة الأوامر』─────⊙\n\n`;
    for (let i = start; i < Math.min(end, commands.length); i++) {
      msg += `◉ ${prefix}${commands[i]}\n`;
}

    msg += `\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n`;
    msg += `▪ ❴ الصفحة ❵ ➨ ${page} من ${Math.ceil(commands.length / perPage)}\n`;
    msg += `▪ ❴ عدد الأوامر ❵ ➨ ${commands.length}\n`;
    msg += `▪ ❴ اسم البوت ❵ ➨ ${BOT_NAME}\n`;
    msg += `▪ ❴ المطور ❵ ➨ ${DEVELOPER_NAME}\n`;
    msg += `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n`;
    msg += `✦ اكتب '${prefix}اوامر اسم الأمر' لرؤية التفاصيل`;

    const imageStream = await getImageStream();
    return api.sendMessage({ body: msg, attachment: imageStream}, threadID, messageID);
}

  const input = args.join(" ").toLowerCase();
  const commandEntry = allCommands.find(([key]) => key.includes(input))?.[1];

  if (!commandEntry) {
    return api.sendMessage(`❌ الأمر "${input}" غير موجود.\nاكتب "${prefix}اوامر" لرؤية قائمة الأوامر.`, threadID, messageID);
}

  const {
    name,
    version,
    role,
    aliases = [],
    description,
    usage,
    credits,
    cooldown,
    commandCategory
} = commandEntry.config;

  const roleMap = {
    0: "عضو",
    1: "أدمن البوت",
    2: "أدمن المجموعة",
    3: "المطور الأعلى"
};

  let details = `⊙────『تفاصيل الأمر』────⊙\n\n`;
  details += `▪ ❴ الاسم ❵ ➨ ${name}\n`;
  details += `▪ ❴ الفئة ❵ ➨ ${commandCategory || "غير محددة"}\n`;
  details += `▪ ❴ الصلاحية ❵ ➨ ${roleMap[role] || "غير محددة"}\n`;
  details += `▪ ❴ الأسماء البديلة ❵ ➨ ${aliases.join(", ") || "لا يوجد"}\n`;
  details += `▪ ❴ الوصف ❵ ➨ ${description || "لا يوجد"}\n`;
  details += `▪ ❴ الاستخدام ❵ ➨ ${usage || "غير محدد"}\n`;
  details += `▪ ❴ المطور ❵ ➨ ${credits || DEVELOPER_NAME}\n`;
  details += `▪ ❴ الإصدار ❵ ➨ ${version || "غير محدد"}\n`;
  if (cooldown) details += `▪ ❴ التبريد ❵ ➨ ${cooldown} ثانية\n`;
  details += `\n⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻`;

  const imageStream = await getImageStream();
  return api.sendMessage({ body: details, attachment: imageStream}, threadID, messageID);
};

module.exports.handleEvent = async function({ api, event, prefix}) {
  const { threadID, messageID, body} = event;
  if (body?.toLowerCase().startsWith("prefix")) {
    const message = prefix
? `🙃 البادئة الحالية:\n😏 بادئة المحادثة: ${prefix}`
: "عذرًا، لا توجد بادئة محددة.";
api.sendMessage(message, threadID, messageID);
}
};
`