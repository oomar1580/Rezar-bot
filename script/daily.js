const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "يومي",
		version: "1.2",
		author: "Rako San",
		countDown: 5,
		role: 0,
		description: {
			en: "استلام هدية يومية"
		},
		category: "لعبة",
		guide: {
			en: "   {pn}: استلام هدية يومية"
				+ "\n   {pn} info: عرض معلومات الهدية اليومية"
		},
		envConfig: {
			rewardFirstDay: {
				coin: 100,
				exp: 10
			}
		}
	},

	langs: {
		en: {
			monday: "الاثنين",
			tuesday: "الثلاثاء",
			wednesday: "الأربعاء",
			thursday: "الخميس",
			friday: "الجمعة",
			saturday: "السبت",
			sunday: "الأحد",
			alreadyReceived: "لقد استلمت هديتك بالفعل اليوم.",
			received: "لقد حصلت على %1 عملة و %2 خبرة"
		}
	},

	onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang}) {
		const reward = envCommands[commandName].rewardFirstDay;
		if (args[0] == "info") {
			let msg = "";
			for (let i = 1; i < 8; i++) {
				const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((i == 0? 7: i) - 1));
				const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((i == 0? 7: i) - 1));
				const day = i == 7? getLang("sunday"):
					i == 6? getLang("saturday"):
						i == 5? getLang("friday"):
							i == 4? getLang("thursday"):
								i == 3? getLang("wednesday"):
									i == 2? getLang("tuesday"):
										getLang("monday");
				msg += `${day}: ${getCoin} عملة، ${getExp} خبرة\n`;
			}
			return message.reply(msg);
		}

		const dateTime = moment.tz("Africa/Cairo").format("DD/MM/YYYY");
		const date = new Date();
		const currentDay = date.getDay(); // 0: الأحد، 1: الاثنين،...
		const { senderID} = event;

		const userData = await usersData.get(senderID);
		if (userData.data.lastTimeGetReward === dateTime)
			return message.reply(getLang("alreadyReceived"));

		const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((currentDay == 0? 7: currentDay) - 1));
		const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((currentDay == 0? 7: currentDay) - 1));
		userData.data.lastTimeGetReward = dateTime;
		await usersData.set(senderID, {
			money: userData.money + getCoin,
			exp: userData.exp + getExp,
			data: userData.data
		});
		message.reply(getLang("received", getCoin, getExp));
	}
};