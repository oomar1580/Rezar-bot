const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports.config = {
  name: "اوامر",
  version: "1.0.2",
  hasPermission: 0,
  credits: "راكو سان ",
  description: "عرض قائمة الأوامر أو تفاصيل أمر معين",
  commandCategory: "نــصـوص",
  usages: "مساعدة [اسم الأمر]",
  cooldowns: 5
};

const IMAGE_URL = "https://i.postimg.cc/qRyRRbLx/Messenger-creation-EC4-D26-A9-6-D6-A-4-D84-9-F29-A6-CE7-B80-B2-FC.jpg";
const LOCAL_IMG_PATH = path.join(__dirname, "img", "menu.png");
const FALLBACK_IMG_PATH = path.join(__dirname, "cache", "menu.jpg");
const BOT_NAME = "ظفو";
const DEVELOPER_NAME = " مظفر";

async function getImageStream() {
  // لو الصورة موجودة في img نستخدمها
  if (fs.existsSync(LOCAL_IMG_PATH)) {
    return fs.createReadStream(LOCAL_IMG_PATH);
}

  // لو ما موجودة نستخدم الصورة الاحتياطية
  fs.ensureDirSync(path.dirname(FALLBACK_IMG_PATH));
  if (!fs.existsSync(FALLBACK_IMG_PATH)) {
    const res = await axios.get(IMAGE_URL, { responseType: "arraybuffer"});
    fs.writeFileSync(FALLBACK_IMG_PATH, res.data);
}

  return fs.createReadStream(FALLBACK_IMG_PATH);
}

module.exports.run = async function({ api, event, args}) {
  const { threadID} = event;
  const commandsMap = global.client.commands;
  const commands = typeof commandsMap?.entries === "function"
? Array.from(commandsMap.entries())
: Object.entries(commandsMap || {});

  if (args.length === 0) {
    // عرض قائمة الأوامر
    const grouped = {};
    for (const [name, cmd] of commands) {
      const cat = cmd.config.commandCategory || "أخرى";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(name);
}

    let msg = "⊙─────『قائمة الاوامر』─────⊙\n";
    for (const [cat, list] of Object.entries(grouped)) {
      msg += `\n ▣  ❴ ${cat} ❵ ➨ \n\n`;
      for (let i = 0; i < list.length; i += 4) {
        msg += list.slice(i, i + 4).map(c => ` ◉ ${c}`).join(" ") + "\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n";
}
}

    msg += `\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n`;
    msg += `    ▪ ❴ الاوامر ❵  ➨  ${commands.length}\n`;
    msg += `    ▪ ❴ الاسم  ❵  ➨  ${BOT_NAME}\n`;
    msg += `    ▪ ❴ المطور ❵  ➨  ${DEVELOPER_NAME}\n`;
    msg += `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n`;
    msg += `▣ مساعدة + اسم الامر لرئية تفاصيل الامر `;

    const imageStream = await getImageStream();
    return api.sendMessage({ body: msg, attachment: imageStream}, threadID);
}

  // عرض تفاصيل أمر معين
  const name = args.join(" ").trim().toLowerCase();
  const commandEntry = commands.find(([cmdName]) => cmdName.toLowerCase() === name);

  if (!commandEntry) {
    return api.sendMessage(`❌ الأمر "${name}" غير موجود.\nاكتب "اوامر " لرؤية قائمة الأوامر.`, threadID);
}

  const [cmdName, cmd] = commandEntry;
  const permMap = {
    0: "عام",
    1: "ادارة المجموعه",
    2: "مطور"
};

  const details = `⊙────『تفاصيل الاوامر』────⊙\n
▪ ❴  الاسم  ❵ ➨ ${cmd.config.name}
▪ ❴ صلاحية ❵ ➨ ${permMap[cmd.config.hasPermission] || "غير محددة"}
▪ ❴  الفـئة  ❵ ➨ ${cmd.config.commandCategory || "غير محددة"}
▪ ❴  مطور  ❵ ➨ ${DEVELOPER_NAME}
▪ ❴  اصـدار ❵ ➨ ${cmd.config.version || "غير محدد"}
\n ⸻⸻⸻⸻⸻⸻\n `;

  const imageStream = await getImageStream();
  return api.sendMessage({ body: details, attachment: imageStream}, threadID);
};
