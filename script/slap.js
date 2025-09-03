module.exports.config = {
  name: "صفعة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rako San",
  description: "صفع الشخص الذي تم الإشارة إليه",
  commandCategory: "عام",
  usages: "صفعة [أشر إلى من تريد صفعه]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args}) => {
	const axios = require('axios');
	const request = require('request');
	const fs = require("fs");
    var out = (msg) => api.sendMessage(msg, event.threadID, event.messageID);
  if (!args.join("")) return out("يرجى الإشارة إلى شخص");
  else
  return axios.get('https://api.waifu.pics/sfw/slap').then(res => {
        let getURL = res.data.url;
        let ext = getURL.substring(getURL.lastIndexOf(".") + 1);
        var mention = Object.keys(event.mentions)[0];
                  let tag = event.mentions[mention].replace("@", "");

 let callback = function () {
            api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        api.sendMessage({
						        body: "تم صفع " + tag + "\n\n _آسف، ظننت أن هناك بعوضة_ ",
                                          mentions: [{
          tag: tag,
          id: Object.keys(event.mentions)[0]
}],
						attachment: fs.createReadStream(__dirname + `/cache/slap.${ext}`)
					}, event.threadID, () => fs.unlinkSync(__dirname + `/cache/slap.${ext}`), event.messageID)
				};
        request(getURL).pipe(fs.createWriteStream(__dirname + `/cache/slap.${ext}`)).on("close", callback);
			})
.catch(err => {
                     api.sendMessage("فشل في توليد الصورة المتحركة، تأكد أنك أشرت إلى شخص!", event.threadID, event.messageID);
    api.setMessageReaction("☹️", event.messageID, (err) => {}, true);
})
}