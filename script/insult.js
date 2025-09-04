const axios = require('axios');
module.exports.config = {
  name: "اهانة",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  description: "جلب إهانة عشوائية",
  usage: "اهانة",
  credits: "Rako San",
  cooldown: 0
};

module.exports.run = async ({ api, event}) => {
  const { threadID, messageID} = event;
  try {
    const response = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json');
    const insult = response.data.insult;
    api.sendMessage(`إليك إهانة عشوائية: ${insult}`, threadID);
} catch (error) {
    api.sendMessage("عذرًا، لم أتمكن من جلب الإهانة الآن. حاول لاحقًا.", threadID, messageID);
}
};
