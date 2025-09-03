module.exports.config = {
	name: "غلاف",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Rako San",
	description: "إنشاء صورة غلاف فيسبوك",
	commandCategory: "صور",
	usages: "",
	cooldowns: 5
};

module.exports.run = async function({ api, args, event}) {
	const { threadID, messageID, senderID} = event;
	const request = require("request");
	const axios = require("axios");
	const fs = require("fs-extra");

	if(args[0] == "list") {
		const res = await axios.get("https://api.nguyenmanh.name.vn/taoanhdep/list");
		let page = parseInt(args[1]) || 1;
		if (page < 1) page = 1;
		const limit = 11;
		const total = res.data.listAnime.length;
		const totalPages = Math.ceil(total / limit);
		let msg = "";

		for (let i = limit * (page - 1); i < limit * page; i++) {
			if (i>= total) break;
			const name = res.data.listAnime[i].name;
			msg += `${i}. ${name}\n`;
		}

		msg += `» عدد الشخصيات: ${total}\n» الصفحة (${page}/${totalPages})\n» استخدم ${global.config.PREFIX}غلاف list <رقم الصفحة> لعرض المزيد`;
		return api.sendMessage(`●─● قائمة الشخصيات ●──●\n${msg}\n●──● النهاية ●──●`, threadID, messageID);

	} else if(args[0] == "find") {
		const char = args[1];
		const res = await axios.get(`https://api.nguyenmanh.name.vn/taoanhdep/search?key=${encodeURIComponent(char)}`);
		const id = res.data.ID;
		return api.sendMessage(`معرف الشخصية ${char} هو: ${id - 1}`, threadID, messageID);

	} else if(args[0] == "color") {
		const colorImage = "https://4.bp.blogspot.com/-_nVsmtO-a8o/VYfZIUJXydI/AAAAAAAACBQ/FHfioHYszpk/w1200-h630-p-k-no-nu/cac-mau-trong-tieng-anh.jpg";
		const callback = () => {
			api.sendMessage({
				body: "[ قائمة الألوان بالإنجليزية ]",
				attachment: fs.createReadStream(__dirname + `/cache/colors.jpg`)
			}, threadID, () => fs.unlinkSync(__dirname + `/cache/colors.jpg`));
		};
		request(encodeURI(colorImage)).pipe(fs.createWriteStream(__dirname + `/cache/colors.jpg`)).on("close", callback);

	} else {
		return api.sendMessage(`» قم بالرد على هذه الرسالة بمعرف الشخصية التي تريد اختيارها`, threadID, (error, info) => {
			global.client.handleReply.push({
				type: "characters",
				name: this.config.name,
				author: senderID,
				messageID: info.messageID
			});
		}, messageID);
	}
};

module.exports.handleReply = async function({ api, event, handleReply}) {
	const axios = require("axios");
	const fs = require("fs-extra");
	const request = require("request");

	if (handleReply.author!= event.senderID) return api.sendMessage('ليس لديك صلاحية للرد على هذه الرسالة', event.threadID);

	const { threadID, messageID} = event;

	switch (handleReply.type) {
		case "characters": {
			const id = parseInt(event.body);
			const res = await axios.get(`https://api.nguyenmanh.name.vn/taoanhdep/search/id?id=${id + 1}`);
			const name = res.data.name;

			api.unsendMessage(handleReply.messageID);
			return api.sendMessage(`» اخترت الشخصية: ${name}\n» قم بالرد على هذه الرسالة وأدخل اسمك`, threadID, (error, info) => {
				global.client.handleReply.push({
					type: 'subname',
					name: this.config.name,
					author: event.senderID,
					characters: event.body,
					messageID: info.messageID
				});
			}, messageID);
		}
		case "subname": {
			api.unsendMessage(handleReply.messageID);
			return api.sendMessage(`» قم بالرد على هذه الرسالة لإدخال اسمك الثانوي`, threadID, (error, info) => {
				global.client.handleReply.push({
					type: 'color',
					name: this.config.name,
					author: event.senderID,
					characters: handleReply.characters,
					name_s: event.body,
					messageID: info.messageID
				});
			}, messageID);
		}
		case "color": {
			api.unsendMessage(handleReply.messageID);
			return api.sendMessage(`» قم بالرد على هذه الرسالة لإدخال لون الخلفية\n» يمكنك استخدام الأمر "${global.config.PREFIX}غلاف color" لعرض قائمة الألوان`, threadID, (error, info) => {
				global.client.handleReply.push({
					type: 'create',
					name: this.config.name,
					author: event.senderID,
					characters: handleReply.characters,
					subname: event.body,
					name_s: handleReply.name_s,
					messageID: info.messageID
				});
			}, messageID);
		}
            case "create": {
			const idchar = handleReply.characters;
			const name_ = handleReply.name_s;
			const subname_ = handleReply.subname;
			const color_ = event.body;

			api.unsendMessage(handleReply.messageID);
			return api.sendMessage(`جاري إنشاء الصورة...`, threadID, async () => {
				await new Promise(resolve => setTimeout(resolve, 3000));
				const imageStream = (await axios.get(`https://api.nguyenmanh.name.vn/fbcover/v2?name=${encodeURIComponent(name_)}&id=${idchar}&subname=${encodeURIComponent(subname_)}&color=${encodeURIComponent(color_)}&apikey=KeyTest`, {
					responseType: "stream"
				})).data;

				const msg = {
					body: `هذه صورة الغلاف الخاصة بك`,
					attachment: imageStream
				};
				return api.sendMessage(msg, threadID, messageID);
			});
		}
	}
};