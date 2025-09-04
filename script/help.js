const ITEMS_PER_PAGE = 15;

module.exports.config = {
  name: "مساعدة",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Aminul Sordar",
  description: "📚 Show all commands with pagination and details",
  commandCategory: "عـــامـة",
  usages: "[page | command name]",
  cooldowns: 5
};

module.exports.languages = {
  en: { 
  helpList: `◈ قائمة الاوامر (صفحة %1/%2)\n━━━━━━━━━━━━━━━\n%3\n━━━━━━━━━━━━━━━
 ◆ إجمالي الأوامر: %4
 ◆ إجمالي الأحداث: %5
 ◆ تم تطويره بواسطة: راكو سان
 `,
  moduleInfo: "🔹 الأمر: %1\n📖 الوصف: %2\n\n🛠 الاستخدام: %3\n📁 الفئة: %4\n⏱ وقت الانتظار: %5 ثانية\n🔐 الصلاحية: %6\n👨‍💻 تم تطويره بواسطة: راكو سان",
  user: "فلاح",
  adminGroup: "ادمن المجموعه ",
  adminBot: "المطور "
}
};

const tips = [
  "جرب: اوامر زواج لترى كيفية عمله!",
  "استخدم اسم الأمر مثل 'اوامر اضافة'.",
  "تريد البوت؟ تواصل مع مطور البوت",
  "يمكنك تغيير البادئة لكل مجموعة.",
  "استخدم الأوامر بحكمة ولا ترسل سبام.",
  "تحتاج إلى مساعدة في الصور؟ اكتب اوامر صور"
];

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;
  const { commands, events } = global.client;
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : global.config.PREFIX;

  // If user requested specific command help
  if (args[0] && commands.has(args[0].toLowerCase())) {
    const cmd = commands.get(args[0].toLowerCase());
    const perm =
      cmd.config.hasPermssion === 0
        ? getText("user")
        : cmd.config.hasPermssion === 1
        ? getText("adminGroup")
        : getText("adminBot");

    return api.sendMessage(
      getText(
        "moduleInfo",
        cmd.config.name,
        cmd.config.description,
        `${prefix}${cmd.config.name} ${cmd.config.usages || ""}`,
        cmd.config.commandCategory,
        cmd.config.cooldowns,
        perm,
        cmd.config.credits
      ),
      threadID,
      messageID
    );
  }

  // Paginated list of commands
  const allCmds = Array.from(commands.values()).map(
    (cmd, i) => `🔹 ${i + 1}. ${cmd.config.name}`
  );
  const totalCmds = allCmds.length;
  const totalEvts = global.client.events.size;
  const totalPages = Math.ceil(totalCmds / ITEMS_PER_PAGE);
  const page = Math.max(1, parseInt(args[0]) || 1);

  if (page > totalPages)
    return api.sendMessage(
      `الصفخة ${page} مافي عدد الصفحات الكلي : ${totalPages}`,
      threadID,
      messageID
    );

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageCmds = allCmds.slice(start, end).join("\n");
  const tip = tips[Math.floor(Math.random() * tips.length)];

  const msg = getText(
    "helpList",
    page,
    totalPages,
    pageCmds,
    totalCmds,
    totalEvts,
    tip
  );

  return api.sendMessage(msg, threadID, messageID);
};
