module.exports.config = {
  name: 'اوامر',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['معلومات'],
  description: "دليل المبتدئين",
  usage: "مساعدة [رقم الصفحة] أو [اسم الأمر]",
  credits: 'Rako San',
};

module.exports.run = async function({
  api,
  event,
  enableCommands,
  args,
  Utils,
  prefix
}) {
  const input = args.join(' ');
  try {
    const eventCommands = enableCommands[1].handleEvent;
    const commands = enableCommands[0].commands;

    if (!input) {
      const pages = 20;
      let page = 1;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = `📜 قائمة أوامر البوت:\n\n`;
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `${i + 1}. ⟿ ${prefix}${commands[i]}\n`;
}
      helpMessage += `\n📌 قائمة الأحداث:\n\n`;
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += `${index + 1}. ⟿ ${prefix}${eventCommand}\n`;
});
      helpMessage += `\nصفحة ${page}/${Math.ceil(commands.length / pages)}. لعرض صفحة أخرى، اكتب '${prefix}اوامر رقم الصفحة'. لعرض معلومات أمر معين، اكتب '${prefix}اوامر اسم الأمر'.`;
      api.sendMessage(helpMessage, event.threadID, event.messageID);

} else if (!isNaN(input)) {
      const page = parseInt(input);
      const pages = 20;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = `📜 قائمة أوامر البوت:\n\n`;
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `${i + 1}. ⟿ ${prefix}${commands[i]}\n`;
}
      helpMessage += `\n📌 قائمة الأحداث:\n\n`;
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += `${index + 1}. ⟿ ${prefix}${eventCommand}\n`;
});
      helpMessage += `\nصفحة ${page} من ${Math.ceil(commands.length / pages)}`;
      api.sendMessage(helpMessage, event.threadID, event.messageID);

} else {
      const command = [...Utils.handleEvent,...Utils.commands].find(([key]) => key.includes(input?.toLowerCase()))?.[1];
      if (command) {
        const {
          name,
          version,
          role,
          aliases = [],
          description,
          usage,
          credits,
          cooldown,
          hasPrefix
} = command;

        const roleMessage = role!== undefined? (
          role === 0? '➛ الصلاحية: عضو':
          role === 1? '➛ الصلاحية: ادمن البوت':
          role === 2? '➛ الصلاحية: أدمن المجموعة':
          role === 3? '➛ الصلاحية: المطور الأعلى': ''
): '';

        const aliasesMessage = aliases.length? `➛ الأسماء البديلة: ${aliases.join(', ')}\n`: '';
        const descriptionMessage = description? `➛ الوصف: ${description}\n`: '';
        const usageMessage = usage? `➛ الاستخدام: ${usage}\n`: '';
        const creditsMessage = credits? `➛ المطور: ${credits}\n`: '';
        const versionMessage = version? `➛ الإصدار: ${version}\n`: '';
        const cooldownMessage = cooldown? `➛ التبريد: ${cooldown} ثانية\n`: '';

        const message = `「 معلومات الأمر 」\n\n➛ الاسم: ${name}\n${versionMessage}${roleMessage}\n${aliasesMessage}${descriptionMessage}${usageMessage}${creditsMessage}${cooldownMessage}`;
        api.sendMessage(message, event.threadID, event.messageID);
} else {
        api.sendMessage('❌ لم يتم العثور على الأمر المطلوب.', event.threadID, event.messageID);
}
}
} catch (error) {
    console.log(error);
}
};

module.exports.handleEvent = async function({
  api,
  event,
  prefix
}) {
  const { threadID, messageID, body} = event;
  const message = prefix? `🙃 البادئة الحالية للنظام:\n😏 بادئة المحادثة: ${prefix}`: "عذرًا، لا توجد بادئة محددة.";
  if (body?.toLowerCase().startsWith('prefix')) {
    api.sendMessage(message, threadID, messageID);
}
};