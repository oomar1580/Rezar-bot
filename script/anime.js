const axios = require('axios');
const fs = require('fs');
module.exports.config = {
  name: 'انمي',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['هانمي'],
  description: 'جلب صورة أنمي عشوائية',
  usage: "انمي [الفئة - النوع]",
  credits: 'Rako San',
  cooldown: 5,
};
module.exports.run = async function({
  api,
  event,
  args
}) {
  try {
    const input = args.join(' ');
    if (!input) {
      const message = `إليك قائمة فئات صور الأنمي:\n\nالفئة: nsfw\nالأنواع:\n• waifu\n• neko\n• trap\n• blowjob\n\nالفئة: sfw\nالأنواع:\n• waifu\n• neko\n• shinobu\n• megumin\n• bully\n• cuddle\n• cry\n• hug\n• awoo\n• kiss\n• lick\n• pat\n• smug\n• bonk\n• yeet\n• blush\n• smile\n• wave\n• highfive\n• handhold\n• nom\n• bite\n• glomp\n• slap\n• kill\n• kick\n• happy\n• wink\n• poke\n• dance\n• cringe\n\nالاستخدام: انمي الفئة - النوع`;
      api.sendMessage(message, event.threadID, event.messageID);
} else {
      const split = input.split('-').map(item => item.trim());
      const choice = split[0];
      const category = split[1];
      const time = new Date();
      const timestamp = time.toISOString().replace(/[:.]/g, "-");
      const pathPic = __dirname + '/cache/' + `${timestamp}_waifu.png`;
      const {
        data
} = await axios.get(`https://api.waifu.pics/${choice}/${category}`);
      const picture = data.url;
      const getPicture = (await axios.get(picture, {
        responseType: 'arraybuffer'
})).data;
      fs.writeFileSync(pathPic, Buffer.from(getPicture, 'utf-8'));
      api.sendMessage({
        body: '',
        attachment: fs.createReadStream(pathPic)
}, event.threadID, () => fs.unlinkSync(pathPic), event.messageID);
}
} catch (error) {
    api.sendMessage(`حدث خطأ في أمر الانمي: ${error.message}`);
}
};