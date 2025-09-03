module.exports.config = {
  name: "اقتباس",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  description: "جلب اقتباس تحفيزي عشوائي.",
  usage: "اقتباس",
  credits: "Rako San",
  cooldown: 0
};

module.exports.run = async ({ api, event}) => {
  const { threadID, messageID} = event;
  try {
    const response = await require('axios').get('https://api.quotable.io/random');
    const { content, author} = response.data;
    api.sendMessage(`"${content}"\n— ${author}`, threadID, messageID);
} catch (error) {
    api.sendMessage("عذرًا، لم أتمكن من جلب اقتباس الآن. حاول لاحقًا.", threadID, messageID);
}
};