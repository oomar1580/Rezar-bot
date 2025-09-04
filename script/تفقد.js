const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "تفقد",
  version: "1.1",
  hasPermssion: 2,
  credits: "مطور البوت + دنقل",
  description: "تفقد التعديلات الأخيرة في ملفات البوت مع تحديد النطاق",
  commandCategory: "الــمـطـور",
  usages: ".تفقد [من | إلى]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args}) {
  if (event.senderID!== "61553754531086") return api.sendMessage("❌ الأمر مخصص للمطور فقط", event.threadID);

  const commandsDir = __dirname;
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith(".js"));

  const fileStats = files.map(file => {
    const filePath = path.join(commandsDir, file);
    const stats = fs.statSync(filePath);
    return {
      name: file,
      modified: stats.mtime.toLocaleString(),
      size: `${(stats.size / 1024).toFixed(2)} KB`
};
});

  const sorted = fileStats.sort((a, b) => new Date(b.modified) - new Date(a.modified));

  // ✅ تحديد النطاق
  let start = 0;
  let end = 10;

  if (args.length>= 3 && args[1] === "|" &&!isNaN(args[0]) &&!isNaN(args[2])) {
    start = parseInt(args[0]);
    end = parseInt(args[2]);
}

  const recent = sorted.slice(start, end).map((f, i) =>
    `${start + i + 1}. 📄 ${f.name}\n🕒 آخر تعديل: ${f.modified}\n📦 الحجم: ${f.size}`
).join("\n\n");

  if (!recent) return api.sendMessage("❌ لا توجد ملفات في هذا النطاق", event.threadID);

  api.sendMessage(`📁 الملفات المعدلة من ${start} إلى ${end}:\n\n${recent}`, event.threadID);
};
