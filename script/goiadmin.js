module.exports.config = {
	name: "نداء",
	version: "1.0.0",
	role: 0,
	credits: "Rako San",
	description: "يرد البوت عند منشن المطور أو منشن البوت",
	usages: "",
	hasPrefix: true,
	cooldown: 5
};

module.exports.handleEvent = function({ api, event, admin}) {
	if (event.senderID!== admin && event.mentions) {
		const aid = [admin];
		for (const id of aid) {
			if (event.mentions[id]) {
				const msg = [
					"كفاية منشن، المطور مشغول حاليًا 😗",
					"المطور حالياً غير متصل، حاول لاحقًا 😢",
					"منشن ثاني للمطور؟ شكلك بتتلكم 😠",
					"المطور في وقت راحة، لا تزعجه 🙄",
					"هل تحب المطور؟ ليه كل هالمنشن؟ 😏",
					"لو منشنته مرة ثانية، البوت حيوقفك 🙂",
					"المطور مشغول، اصبر شوي",
					"رابط المطور لو حاب تضيفه: https://www.facebook.com/Rako.San.r.s"
				];
				api.setMessageReaction("😍", event.messageID, (err) => {}, true);
				return api.sendMessage({ body: msg[Math.floor(Math.random() * msg.length)]}, event.threadID, event.messageID);
			}
		}
	}
};

module.exports.run = async function({ admin}) {};