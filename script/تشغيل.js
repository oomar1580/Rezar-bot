module.exports = {
  name: 'تشغيل',
  aliases: ['start', 'on'],
  description: 'يشغّل خدمة أو يفعّل البوت (للمطور فقط)',
  permissions: ['61576232405796'],  // فرضًا لديك نظام صلاحيات
  async execute({ api, event, args }) {
    // منطق التشغيل الذي تريده
    api.sendMessage('✅ تم تفعيل البوت أو الخدمة.', event.threadID);
    // مثلاً: ضبط متغيّر داخلي "isActive = true"
  }
};
