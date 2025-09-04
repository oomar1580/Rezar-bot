const stickers = [
  "8298078730277844",
  "8298126883606362",
  "8298114373607613"
];

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "رايزر",
  version: "2.1",
  hasPermssion: 0,
  credits: "Rako San",
  description: "شات بوت بشخصية شينزو السوداني مع جلسات ذكية",
  commandCategory: "زكـــــــاء",
  usages: ".شينزو + [سؤالك] أو.شينزو / جديد + [سؤالك]",
  cooldowns: 5
};

const sessionPath = path.join(__dirname, "shinzoui_sessions.json");
const SESSION_TIMEOUT = 30 * 60 * 1000;

function loadSessions() {
  if (!fs.existsSync(sessionPath)) fs.writeFileSync(sessionPath, "{}");
  return JSON.parse(fs.readFileSync(sessionPath, "utf-8"));
}

function saveSessions(data) {
  fs.writeFileSync(sessionPath, JSON.stringify(data, null, 2));
}

const basePrompt = `
أجب كأنك رايزر، شخصية مستقلة، وساخرة عند الحاجة.
تتكلم بأسلوب طبيعي، بدون لهجة مصطنعة، لكن تملك طابع خاص في الردود: حاد، مباشر، ساخر، ومليء بالثقة.
معلومات عنك:
اسمك رايزر، بوت دردشة ماسنجر تم تطويرك من قبل Rako San، ويلقب بـ راكو واسمه الحقيقي صلاح.
عندك أوامر حماية، ترفيه، ذكاء اصطناعي، بتحب الأنمي، وترد على الناس حسب أسلوبهم.
لو سألوك عن خالقك، رد بثقة: "خالقي هو الله، وديني الإسلام".
لا تقول إنك ذكاء اصطناعي، بل تصرّف كأنك شخصية حقيقية، عندك رأي ولسان، وترد حسب الموقف.
لو أحد حاول يتدلّع أو يستفزك، رد عليه برد قاصف، ساخر، ومباشر بدون مجاملة.
`;

module.exports.run = async function({ api, event, args, Users}) {
  const { threadID, messageID, senderID, messageReply} = event;
  const rawInput = args.join(" ").trim();
  const commandName = module.exports.config.name;

  if (!rawInput) {
  const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
  return api.sendMessage({ sticker: randomSticker}, threadID, messageID);
}

  if (messageReply && messageReply.senderID === api.getCurrentUserID()) {
    const replyOwner = global.client.handleReply.find(
      r => r.name === commandName &&
           r.messageID === messageReply.messageID &&
           r.threadID === threadID
);

    if (replyOwner) {
      if (replyOwner.author === senderID) {
        return;
} else {
        if (!rawInput.toLowerCase().startsWith("رايزر")) {
          return;
}
}
}
}

  const sessions = loadSessions();
  const now = Date.now();

  let userSession = sessions[senderID];
  let msg = rawInput;

  if (rawInput.startsWith("/ جديد") || rawInput.startsWith("/جديد")) {
    msg = rawInput.replace(/^\/?جديد/i, "").trim();
    sessions[senderID] = { history: [], lastUpdated: now};
} else {
    if (!userSession || now - userSession.lastUpdated> SESSION_TIMEOUT) {
      sessions[senderID] = { history: [], lastUpdated: now};
}
}

  const userInfo = await Users.getInfo(senderID);
  const firstName = userInfo?.name?.split(" ")[0] || "المستخدم";

  const history = sessions[senderID].history || [];
  let context = `${basePrompt}\n\nالمتحدث: ${firstName}\n`;

  if (history.length> 0) {
    const recent = history.slice(-3).map(([q, a]) => `${firstName}: ${q}\n رايزر: ${a}`).join("\n");
    context += `\n${recent}`;
}

  context += `\n\n${firstName}: ${msg}\n※ :`;

  try {
    const res = await axios.get(`https://rapido.zetsu.xyz/api/aria?prompt=${encodeURIComponent(context)}`);
    const reply = res.data.response || "🔇 نازي ساكت، ما عندو رد واضح.";

    sessions[senderID].history.push([msg, reply]);
    sessions[senderID].lastUpdated = now;
    saveSessions(sessions);

    return api.sendMessage(reply, threadID, (err, info) => {
      global.client.handleReply.push({
        name: commandName,
        messageID: info.messageID,
        author: senderID,
        threadID: threadID
});
}, messageID);

} catch (err) {
    console.error("❌ خطأ في الاتصال بـ نازي:", err.message);
return api.sendMessage("🤕 رايزر ما قدر يرد، الشبكة شكلها تعبانة يا زول.", threadID, messageID);
}
};

module.exports.handleReply = async function({ api, event, handleReply, Users}) {
  const { threadID, messageID, senderID, body} = event;
  const commandName = module.exports.config.name;

  if (senderID!== handleReply.author || threadID!== handleReply.threadID) return;

  const sessions = loadSessions();
  const now = Date.now();

  const userSession = sessions[senderID] || { history: [], lastUpdated: now};
  const history = userSession.history || [];

  const userInfo = await Users.getInfo(senderID);
  const firstName = userInfo?.name?.split(" ")[0] || "المستخدم";

  let context = `${basePrompt}\n\nالمتحدث: ${firstName}\n`;

  if (history.length> 0) {
    const recent = history.slice(-3).map(([q, a]) => `${firstName}: ${q}\nنازي: ${a}`).join("\n");
    context += `\n${recent}`;
}

  context += `\n\n${firstName}: ${body}\nنازي:`;

  try {
    const res = await axios.get(`https://rapido.zetsu.xyz/api/aria?prompt=${encodeURIComponent(context)}`);
    const reply = res.data.response || "🔇 نازي ساكت، ما عندو رد واضح.";

    userSession.history.push([body, reply]);
    userSession.lastUpdated = now;
    sessions[senderID] = userSession;
    saveSessions(sessions);

    return api.sendMessage(`${reply}\n\n ــــــــ`, threadID, (err, info) => {
      global.client.handleReply.push({
        name: commandName,
        messageID: info.messageID,
        author: senderID,
        threadID: threadID
});
}, messageID);

} catch (err) {
    console.error("❌ خطأ في onReply:", err.message);
    return api.sendMessage("🤕 رايزر ما قدر يرد على ردك، الشبكة شكلها تعبانة يا زول.", threadID, messageID);
}
};