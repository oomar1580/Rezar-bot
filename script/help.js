module.exports.config = {
  name: 'اوامر',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['معلومات'],
  description: "دليل المبتدئين",
  usage: "اوامر [رقم الصفحة] أو [اسم الأمر]",
  credits: 'Rako San',
};

module.exports.run = async function({
  api,
  event,
  enableCommands,
  args,
  Utils,
  prefix, 
adminName, 
botName, 
}) {
  const input = args.join(' ').trim().toLowerCase();
  const commands = enableCommands[0].commands;

  try {
    const perPage = 20;
    const totalPages = Math.ceil(commands.length / perPage);

    if (!input) {
      const page = 1;
      const start = (page - 1) * perPage;
      const end = start + perPage;

      let helpMessage = `◈ ───『قائمة الاوامر』─── ◈\n\n`;
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `〖${i + 1}〗│←› ${prefix}${commands[i]}\n`;
}

      helpMessage += `◈ ─────────────── ◈\nصفحة ${page}/${totalPages}. لعرض صفحة أخرى، اكتب '${prefix}اوامر رقم الصفحة'. لعرض معلومات أمر معين، اكتب '${prefix}اوامر اسم الأمر\n اسم المشرف : ${adminName} \n اسم البوت  :  ${botName} '. \n◈ ─────────────── ◈`;
      return api.sendMessage(helpMessage, event.threadID, event.messageID);
}

    if (!isNaN(input)) {
      const page = parseInt(input);
      if (page < 1 || page> totalPages) {
        return api.sendMessage(`❌ رقم الصفحة غير صالح. اختر بين 1 و ${totalPages}.`, event.threadID, event.messageID);
}

      const start = (page - 1) * perPage;
      const end = start + perPage;

      let helpMessage = `◈ ─────────────── ◈\n\n`;
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `〖${i + 1}〗│←›${prefix}${commands[i]}\n`;
}

      helpMessage += `\n◈ ─────────────── ◈│←›\n │←›  صفحة ❴${page}/${totalPages}❵\n◈ ─────────────── ◈`;
      return api.sendMessage(helpMessage, event.threadID, event.messageID);
}

    const command = [...Utils.commands].find(([key]) => key.includes(input))?.[1];
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
        role ===  '':
        role ===  '':
        role === '':
        role ===  Ξ ᎷᎪᎻᎬᎡ. ぐ愛. ぐ愛'المطور': ''
): '';

      const aliasesMessage = aliases.length? `➛ الأسماء البديلة: ${aliases.join(', ')}\n`: '';
      const descriptionMessage = description? `➛ الوصف: ${description}\n`: '';
      const usageMessage = usage? `➛ الاستخدام: ${usage}\n`: '';
      const creditsMessage = credits? `Ξ ᎷᎪᎻᎬᎡ. ぐ愛: ${credits}\n`: '';
      const versionMessage = version? `➛ الإصدار: ${version}\n`: '';
      const cooldownMessage = cooldown? `➛ التبريد: ${cooldown} ثانية\n`: '';

      const message = `「 معلومات الأمر 」\n\n➛ الاسم: ${name}\n${versionMessage}${roleMessage}\n${aliasesMessage}${descriptionMessage}${usageMessage}${creditsMessage}${cooldownMessage}`;
      return api.sendMessage(message, event.threadID, event.messageID);
} else {
      return api.sendMessage('❌ لم يتم العثور على الأمر المطلوب.', event.threadID, event.messageID);
}
} catch (error) {
    console.error(error);
    return api.sendMessage('❌ حدث خطأ أثناء معالجة الأمر.', event.threadID, event.messageID);
}
};

module.exports.handleEvent = async function({
  api,
  event,
  prefix
}) {
  const { threadID, messageID, body} = event;
  if (body?.toLowerCase().startsWith('prefix')) {
    const message = prefix
? ` البادئة الحالية للنظام:\n بادئة المحادثة: ${prefix}`
: "عذرًا، لا توجد بادئة محددة.";
    api.sendMessage(message, threadID, messageID);
}
};
