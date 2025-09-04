import axios from 'axios';
import fs from 'fs';
import { join} from 'path';
import { createCanvas, loadImage} from 'canvas';

const backgrounds = [
  "https://i.postimg.cc/wjJ29HRB/background1.png",
  "https://i.postimg.cc/zf4Pnshv/background2.png",
  "https://i.postimg.cc/5tXRQ46D/background3.png"
];

export const config = {
  name: "زوجني",
  version: "1.0.1-xaviabot-canvas",
  description: "زواج عشوائي بينك وبين أحد أعضاء المجموعة",
  cooldown: 15
};

async function getAvatarUrl(userID) {
  if (isNaN(userID)) throw new Error(`❌ userID غير صالح: ${userID}`);
  try {
    const user = await axios.post(`https://www.facebook.com/api/graphql/`, null, {
      params: {
        doc_id: "5341536295888250",
        variables: JSON.stringify({ height: 500, scale: 1, userID, width: 500})
}
});
    return user.data.data.profile.profile_picture.uri;
} catch {
    return "https://i.ibb.co/bBSpr5v/143086968-2856368904622192-1959732218791162458-n.png";
}
}

export async function onCall({ message}) {
  try {
    const { participantIDs, senderID} = message;
    const botID = api.getCurrentUserID();
    const listUserID = participantIDs.filter(ID => ID!== botID && ID!== senderID);

    if (listUserID.length === 0) return message.reply("ما في حد تتزوجه يا زاحف 😅");

    const matchID = listUserID[Math.floor(Math.random() * listUserID.length)];
    const matchRate = Math.floor(Math.random() * 101);

    const senderName = await global.controllers.Users.getName(senderID);
    const matchName = await global.controllers.Users.getName(matchID);

    const mentions = [
      { id: senderID, tag: senderName},
      { id: matchID, tag: matchName}
    ];

    const senderAvatarUrl = await getAvatarUrl(senderID);
    const matchAvatarUrl = await getAvatarUrl(matchID);

    const senderAvatarPath = join(global.cachePath, `marry_${senderID}_${Date.now()}.png`);
    const matchAvatarPath = join(global.cachePath, `marry_${matchID}_${Date.now()}.png`);

    await global.downloadFile(senderAvatarPath, senderAvatarUrl);
    await global.downloadFile(matchAvatarPath, matchAvatarUrl);

    const backgroundURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const backgroundPath = join(global.cachePath, `marry_bg_${Date.now()}.png`);
    await global.downloadFile(backgroundPath, backgroundURL);

    const bg = await loadImage(backgroundPath);
    const avatar1 = await loadImage(senderAvatarPath);
    const avatar2 = await loadImage(matchAvatarPath);

    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    const avatarSize = 250;
    const margin = 60;
    const centerY = canvas.height / 2 - avatarSize / 2;

    ctx.drawImage(avatar1, canvas.width / 2 - avatarSize - margin, centerY, avatarSize, avatarSize);
    ctx.drawImage(avatar2, canvas.width / 2 + margin, centerY, avatarSize, avatarSize);

    const finalPath = join(global.cachePath, `marry_final_${Date.now()}.png`);
    fs.writeFileSync(finalPath, canvas.toBuffer("image/png"));

    const messageBody = `💍 تم عقد قران الزاحفين (๑°3°๑)!\nنتمنى لكم حياة سعيدة مليئة بالحب والهموم ヽ(*´з｀*)ﾉ\n\n❤️ نسبة التوافق: ${matchRate}%\n👫 ${senderName} + ${matchName}`;

    await message.reply({
      body: messageBody,
      mentions,
      attachment: fs.createReadStream(finalPath)
});

    global.deleteFile(senderAvatarPath);
    global.deleteFile(matchAvatarPath);
    global.deleteFile(backgroundPath);
    global.deleteFile(finalPath);
} catch (error) {
    console.error(error);
    message.reply("حدث خطأ أثناء تنفيذ الزواج 💔");
}
}
