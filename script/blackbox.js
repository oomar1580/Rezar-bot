const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { DateTime} = require("luxon");

module.exports.config = {
  name: "صندوق",
  version: "2.0.0",
  role: 0,
  aliases: ['بوكس', 'بايثون'],
  credits: "Rako San"
};

module.exports.run = async function ({ api, event, args}) {
  let { messageID, threadID, senderID} = event;
  const query = args.join(" ");

  if (!query) {
    api.sendMessage("❔ | يرجى إدخال السؤال أو الكود المطلوب...", threadID, messageID);
    return;
}

  try {
    api.setMessageReaction("🕣", messageID, () => {}, true);
    api.sendMessage("🕣 | جاري المعالجة...", threadID, messageID);

    const boxUrl = 'https://useblackbox.io/chat-request-v4';
    const boxData = {
      textInput: query,
      allMessages: [{ user: query}],
      stream: '',
      clickedContinue: false,
};
    const boxResponse = await axios.post(boxUrl, boxData);
    const answer = boxResponse.data.response[0][0] || 'لم يتم العثور على إجابة.';
    const manilaTime = DateTime.now().setZone("Asia/Manila").toFormat("yyyy-MM-dd hh:mm:ss a");

    api.sendMessage(`${answer}`, threadID, messageID);

    const beastUrl = 'https://www.api.vyturex.com/beast';
    try {
      const beastResponse = await axios.get(`${beastUrl}?query=${encodeURIComponent(answer)}`);
      if (beastResponse.data && beastResponse.data.audio) {
        const audioURL = beastResponse.data.audio;
        const fileName = "mrbeast_voice.mp3";
        const filePath = path.resolve(__dirname, 'cache', fileName);

        const { data: audioData} = await axios.get(audioURL, { responseType: 'arraybuffer'});
        fs.writeFileSync(filePath, audioData);

        api.sendMessage({
          body: "💽 الصوت",
          attachment: fs.createReadStream(filePath)
}, threadID, async (voiceError) => {
          if (voiceError) {
            console.error('خطأ في إرسال الصوت:', voiceError);
}

          fs.unlinkSync(filePath);
});
} else {
        console.error("فشل في جلب الصوت من واجهة Beast.");
}
} catch (beastError) {
      console.error('خطأ أثناء طلب واجهة Beast:', beastError);
}
} catch (error) {
    api.sendMessage(error.message, threadID, messageID);
}
};