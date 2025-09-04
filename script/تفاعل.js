module.exports = {
  config: {
    name: "تفاعل",
    version: "1.0",
    hasPermssion: 2,
    credits: "مطور البوت",
    description: "تفعيل أو تعطيل تفاعل البوت",
    commandCategory: "الــمـطـور",
    usages: "تفاعل تشغيل/ايقاف",
    cooldowns: 5
  },
  run: async function({ api, event, args }) {
    if (args[0] === "تشغيل") {
      global.client.reactionEnabled = true;
      return api.sendMessage("تم تفعيل تفاعل البوت", event.threadID);
    } else if (args[0] === "ايقاف") {
      global.client.reactionEnabled = false;
      return api.sendMessage("تم تعطيل تفاعل البوت", event.threadID);
    }
  },
  handleEvent: async function({ api, event }) {
    if (!global.client.reactionEnabled) return;
    const msg = event.body.toLowerCase();
    if (msg.includes("بوت")) {
      return api.setMessageReaction("🙃", event.messageID, (err) => {
        if (err) console.log(err);
      }, true);
    } else if (msg.includes("نازي")) {
      return api.setMessageReaction("😇", event.messageID, (err) => {
        if (err) console.log(err);
      }, true);
    } else if (msg.includes("صلاح") || msg.includes("راكو") || msg.includes("مطور")) {
      const responses = ['هاد مطوري', 'هاد عمك', 'هاد شخص ودود'];
      const response = responses[Math.floor(Math.random() * responses.length)];
      api.setMessageReaction("💖", event.messageID, (err) => {
        if (err) console.log(err);
      }, true);
      return api.sendMessage(`${response} 💖`, event.threadID);
    }
  }
};