module.exports.config = {
  name: 'اوامر',
  version: '1.0.1',
  role: 0,
  hasPrefix: true,
  aliases: ['معلومات'],
  description: "دليل الأوامر",
  usage: "اوامر [رقم الصفحة] أو [اسم الأمر]",
  credits: 'Rako San - معدل بواسطة ماهر',
};

module.exports.run = async function({ api, event, enableCommands, args, Utils, prefix, adminName, botName }) {
  const input = args.join(' ').trim().toLowerCase();
  const commands = enableCommands[0].commands;

  try {
    const perPage = 20;
    const totalPages = Math.ceil(commands.length / perPage);

    if (!input) {
      const page = 1;
      const start = (page - 1) * perPage;
      const end = start + perPage;

      let helpMessage = 
`⨳┉┅━━━━┉━━━┅┅━┅━⨳
⌯↢  『 قــائــمــة الاوامـــر 』
⨳┉┅━━━━┉━━━┅┅━┅━⨳

`;
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `〖${i + 1}〗│←› ${prefix}${commands[i]}\n`;
      }

      helpMessage += `
⨳┉┅━━━━┉━━━┅┅━┅━⨳
⌯↢ صفحة ${page}/${totalPages}
⌯↢ لعرض صفحة أخرى: ${prefix}اوامر رقم_الصفحة
⌯↢ لعرض تفاصيل أمر: ${prefix}اوامر اسم_الأمر

⌯↢ المطور : ${adminName}
⌯↢ اسم البوت : ${botName}
⨳┉┅━━━━┉━━━┅┅━┅━⨳`;

      return api.sendMessage(helpMessage, event.threadID, event.messageID);
    }

    if (!isNaN(input)) {
      const page = parseInt(input);
      if (page < 1 || page > totalPages) {
        return api.sendMessage(`❌ رقم الصفحة غير صالح. اختر بين 1 و ${totalPages}.`, event.threadID, event.messageID);
      }

      const start = (page - 1) * perPage;
      const end = start + perPage;

      let helpMessage = 
`⨳┉┅━━━━┉━━━┅┅━┅━⨳
⌯↢  『 قــائــمــة الاوامـــر 』
⨳┉┅━━━━┉━━━┅┅━┅━⨳

`;
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `〖${i + 1}〗│←› ${prefix}${commands[i]}\n`;
      }

      helpMessage += `
⨳┉┅━━━━┉━━━┅┅━┅━⨳
⌯↢ صفحة ❴${page}/${totalPages}❵
⨳┉┅━━━━┉━━━┅┅━┅━⨳`;

      return api.sendMessage(helpMessage, event.threadID, event.messageID);
    }

    const command = [...Utils.commands].find(([key]) => key.includes(input))?.[1];
    if (command) {
      const {
        name, version, role, aliases = [], description,
        usage, credits, cooldown, hasPrefix
      } = command;

      const roleMessage = role !== undefined ? (
        role === 0 ? 'عضو' :
        role === 1 ? 'أدمن البوت' :
        role === 2 ? 'أدمن المجموعة' :
        role === 3 ? 'المطور الأعلى' : ''
      ) : '';

      const message = 
`⨳┉┅━━━━┉━━━┅┅━┅━⨳
⌯↢  『 مــعــلــومــات الأمـــر 』
⨳┉┅━━━━┉━━━┅┅━┅━⨳

➛ الاسم: ${name}
➛ الإصدار: ${version || 'غير محدد'}
➛ الصلاحية: ${roleMessage}
➛ الأسماء البديلة: ${aliases.length ? aliases.join(', ') : 'لا يوجد'}
➛ الوصف: ${description || 'لا يوجد'}
➛ الاستخدام: ${usage || 'لا يوجد'}
➛ المطور: ${credits || 'غير معروف'}
➛ مدة التبريد: ${cooldown ? cooldown + ' ثانية' : 'لا يوجد'}

⨳┉┅━━━━┉━━━┅┅━┅━⨳`;

      return api.sendMessage(message, event.threadID, event.messageID);
    } else {
      return api.sendMessage('❌ لم يتم العثور على الأمر المطلوب.', event.threadID, event.messageID);
    }
  } catch (error) {
    console.error(error);
    return api.sendMessage('❌ حدث خطأ أثناء معالجة الأمر.', event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function({ api, event, prefix }) {
  const { threadID, messageID, body } = event;
  if (body?.toLowerCase().startsWith('prefix')) {
    const message = prefix
      ? ` ⌯↢ البادئة الحالية للنظام:\n⌯↢ ${prefix}`
      : "⌯↢ لا توجد بادئة محددة.";
    api.sendMessage(message, threadID, messageID);
  }
};
