module.exports = {
config:{
  name: "تحميل",
  version: "1.0.0",
  permission: 0,
  prefix: true,
  credits: "Rako San",
  description: "تحميل فيديوهات من مواقع التواصل",
  category: "مستخدم",
  usages: [
    "/تحميل [رابط فيديو فيسبوك]",
    "/تحميل [رابط فيديو تيك توك]",
    "/تحميل [رابط فيديو يوتيوب]",
    "/تحميل [رابط فيديو انستغرام]",
  ],
  cooldowns: 5,
  dependencies: {}
},

languages: {
  "en": {
    "urlinvalid": 'المنصة غير مدعومة. يرجى إدخال رابط صحيح من فيسبوك، تيك توك، تويتر، انستغرام أو يوتيوب.',
    "waitfb": 'جاري تحميل فيديو فيسبوك، يرجى الانتظار...',
    "downfb": "تم تحميل فيديو فيسبوك بنجاح",
    "waittik": 'جاري تحميل فيديو تيك توك، يرجى الانتظار...',
    "waitinsta": 'جاري تحميل فيديو انستغرام، يرجى الانتظار...',
    "downinsta": 'تم تحميل فيديو انستغرام بنجاح',
    "waityt": 'جاري تحميل فيديو يوتيوب، يرجى الانتظار...',
    "waittw": 'جاري تحميل فيديو تويتر، يرجى الانتظار...',
    "downtw": 'تم تحميل فيديو تويتر بنجاح',
    "error": '❌ حدث خطأ'
}
},

start: async function ({ nayan, events, args, lang}) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const content = args.join(" ");
  const { ytdown, ndown, tikdown, twitterdown} = require("nayan-videos-downloader");
  let msg = "";

  const sendWaitingMessage = async (message) => {
    const vid = (
      await axios.get('https://i.imgur.com/rvreDPU.gif', { responseType: 'stream'})
).data;
    return await nayan.sendMessage({...message}, events.threadID);
};

  if (content.includes("https://fb.watch/") || content.includes("https://www.facebook.com")) {
    const fbnayanResponse = await ndown(content);
    const fbVideoUrl = fbnayanResponse.data[0].url;
    const waitingMessage = await sendWaitingMessage({ body: lang("waitfb")});

    const fbVideoData = (await axios.get(fbVideoUrl, { responseType: "arraybuffer"})).data;
    fs.writeFileSync(__dirname + "/cache/fbVideo.mp4", Buffer.from(fbVideoData, "utf-8"));

    msg = lang("downfb");

    nayan.reply({ body: msg, attachment: fs.createReadStream(__dirname + "/cache/fbVideo.mp4")}, events.threadID);
    setTimeout(() => nayan.unsendMessage(waitingMessage.messageID), 9000);

} else if (
    content.includes("https://vt.tiktok.com/") ||
    content.includes("https://tiktok.com/") ||
    content.includes("https://www.tiktok.com")
) {
    const tiktoknayanResponse = await tikdown(content);
    const tiktokVideoUrl = tiktoknayanResponse.data.video;
    const tiktokTitle = tiktoknayanResponse.data.title;
    const waitingMessage = await sendWaitingMessage({ body: lang("waittik")});

    const tiktokVideoData = (await axios.get(tiktokVideoUrl, { responseType: "arraybuffer"})).data;
    fs.writeFileSync(__dirname + "/cache/tiktokVideo.mp4", Buffer.from(tiktokVideoData, "utf-8"));

    msg = `《العنوان》${tiktokTitle}`;

    nayan.reply({ body: msg, attachment: fs.createReadStream(__dirname + "/cache/tiktokVideo.mp4")}, events.threadID);
    setTimeout(() => nayan.unsendMessage(waitingMessage.messageID), 9000);

} else if (content.includes("https://instagram.com") || content.includes("https://www.instagram.com")) {
    const instagramnayanResponse = await ndown(content);
    const instagramVideoUrl = instagramnayanResponse.data[0].url;
    const waitingMessage = await sendWaitingMessage({ body: lang("waitinsta")});

    const instagramVideoData = (await axios.get(instagramVideoUrl, { responseType: "arraybuffer"})).data;
    fs.writeFileSync(__dirname + "/cache/instagramVideo.mp4", Buffer.from(instagramVideoData, "utf-8"));

    msg = lang("downinsta");

    nayan.reply({ body: msg, attachment: fs.createReadStream(__dirname + "/cache/instagramVideo.mp4")}, events.threadID);
    setTimeout(() => nayan.unsendMessage(waitingMessage.messageID), 9000);

} else if (content.includes("https://youtube.com/shorts/") || content.includes("https://youtu.be/")) {
    const youtubenayanResponse = await ytdown(content);
    const youtubeVideoUrl = youtubenayanResponse.data.video;
    const title = youtubenayanResponse.data.title;
    const waitingMessage = await sendWaitingMessage({ body: lang("waityt")});

    const youtubeVideoData = (await axios.get(youtubeVideoUrl, { responseType: "arraybuffer"})).data;
    fs.writeFileSync(__dirname + "/cache/youtubeVideo.mp4", Buffer.from(youtubeVideoData, "utf-8"));

    msg = `${title}`;

    nayan.reply({ body: msg, attachment: fs.createReadStream(__dirname + "/cache/youtubeVideo.mp4")}, events.threadID);
    setTimeout(() => nayan.unsendMessage(waitingMessage.messageID), 9000);

} else if (content.includes("https://twitter.com/")) {
    const twitterResponse = await twitterdown(content);
    const twitterVideoUrl = twitterResponse.data.HD;
    const waitingMessage = await sendWaitingMessage({ body: lang("waittw")});

    const twitterVideoData = (await axios.get(twitterVideoUrl, { responseType: "arraybuffer"})).data;
    fs.writeFileSync(__dirname + "/cache/twitterVideo.mp4", Buffer.from(twitterVideoData, "utf-8"));

    msg = lang("downtw");

    nayan.reply({ body: msg, attachment: fs.createReadStream(__dirname + "/cache/twitterVideo.mp4")}, events.threadID);
    setTimeout(() => nayan.unsendMessage(waitingMessage.messageID), 9000);

} else {
    msg = lang("urlinvalid");
    nayan.reply({ body: msg}, events.threadID);
}
}
}