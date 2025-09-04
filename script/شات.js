const axios = require("axios");

module.exports.config = {
  name: 'رايزر',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['رد', 'سؤال'],
  description: "رد ذكي من قاعدة بيانات Jan API بدون مفتاح أمان",
  usage: "شات [سؤال]",
  credits: 'Rako San'
};

const API_URL = "https://apimagggg.onrender.com";

// دالة لتطبيع النص
function normalize(text) {
  return text
.toLowerCase()
.replace(/[؟?]/g, "")
.replace(/[ءًٌٍَُِّْ]/g, "") // إزالة التشكيل
.replace(/[^ءاأإآبتثجحخدذرزسشصضطظعغفقكلمنهوي ]/g, "") // إزالة الرموز
.trim();
}

module.exports.run = async function({ api, event, args}) {
  const { threadID, messageID} = event;
  const questionRaw = args.join(" ").trim();
  if (!questionRaw) return;

  const question = normalize(questionRaw);

  try {
    const res = await axios.get(`${API_URL}/answer/${encodeURIComponent(question)}`);
    const answer = res.data.answer;

    if (answer) {
      return api.sendMessage(`🐸 ${answer}`, threadID, messageID);
} else {
      return; // تجاهل بصمت لو ما في رد
}
} catch (err) {
    console.error("❌ فشل الاتصال بـ Jan API:", err.message);
    return;
}
};
