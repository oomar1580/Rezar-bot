const path = require('path');
const fs = require('fs');
const cacheDir = path.join(__dirname, 'cache');

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

module.exports.config = {
  name: "ترقية",
  version: "7.3.1",
  hasPermssion: 1,
  credits: "Rako San",
  description: "إشعار تلقائي عند ترقية مستوى المستخدم",
  usePrefix: true,
  commandCategory: "تحرير الصور",
  dependencies: {
    "fs-extra": ""
},
  cooldowns: 2,
};

module.exports.handleEvent = async function({ api, event, Currencies, Users}) {
  const { threadID, senderID} = event;
  const { loadImage, createCanvas} = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  const pathImg = __dirname + "/cache/rankup.png";
  const pathAvt = __dirname + "/cache/avatar.png";

  let exp = (await Currencies.getData(senderID)).exp + 1;
  if (isNaN(exp)) return;

  const threadData = global.data.threadData.get(threadID) || {};
  if (threadData.rankup === false) {
    await Currencies.setData(senderID, { exp});
    return;
}

  const currentLevel = Math.floor((Math.sqrt(1 + (4 * exp / 3) + 1) / 2));
  const newLevel = Math.floor((Math.sqrt(1 + (4 * (exp + 1) / 3) + 1) / 2));

  if (newLevel> currentLevel && newLevel!== 1) {
    const name = global.data.userName.get(senderID) || await Users.getNameUser(senderID);
    let message = threadData.customRankup || `🎉 تهانينا {name} لقد وصلت إلى المستوى {level} 🎉`;
    message = message.replace(/\{name}/g, name).replace(/\{level}/g, newLevel);

    const backgrounds = [
      "https://i.imgur.com/mXmaIFr.jpeg", "https://i.imgur.com/SeLdZua.jpeg",
      "https://i.imgur.com/HrHPulp.jpeg", "https://i.imgur.com/zZpub9k.jpeg",
      "https://i.imgur.com/EP7gdQy.jpeg", "https://i.imgur.com/pKOgCjs.jpeg",
      "https://i.imgur.com/1jPLnZX.jpeg", "https://i.imgur.com/QmtNkyQ.jpg",
      "https://i.imgur.com/qybgIRD.jpg", "https://i.imgur.com/RFRARpY.jpg",
      "https://i.imgur.com/B7i6dhL.jpg", "https://i.imgur.com/LkHUQMJ.jpeg"
    ];
    const bg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    const avatar = (await axios.get(`https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer"})).data;
    fs.writeFileSync(pathAvt, Buffer.from(avatar, "utf-8"));

    const background = (await axios.get(bg, { responseType: "arraybuffer"})).data;
    fs.writeFileSync(pathImg, Buffer.from(background, "utf-8"));

    const baseImage = await loadImage(pathImg);
    const baseAvatar = await loadImage(pathAvt);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.rotate(-25 * Math.PI / 180);
    ctx.drawImage(baseAvatar, 27.3, 103, 108, 108);

    const finalImage = canvas.toBuffer();
    fs.writeFileSync(pathImg, finalImage);
    fs.removeSync(pathAvt);

    api.sendMessage({
      body: message,
      mentions: [{ tag: name, id: senderID}],
      attachment: fs.createReadStream(pathImg)
}, threadID, () => fs.unlinkSync(pathImg));
}

  await Currencies.setData(senderID, { exp});
};

module.exports.languages = {
  "en": {
    "on": "تم التفعيل",
    "off": "تم الإيقاف",
    "successText": "تم تحديث إعدادات إشعار الترقية بنجاح!",
    "levelup": "{name} لقد وصلت إلى المستوى {level}"
}
};

module.exports.run = async function({ api, event, Threads, getText}) {
  const { threadID, messageID} = event;
  const data = (await Threads.getData(threadID)).data;

  data.rankup =!data.rankup;
  await Threads.setData(threadID, { data});
  global.data.threadData.set(threadID, data);

  return api.sendMessage(`${data.rankup? getText("on"): getText("off")} ${getText("successText")}`, threadID, messageID);
};
