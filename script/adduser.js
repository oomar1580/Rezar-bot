module.exports.config = {
	name: "اضف",
	version: "1.0.1",
	role: 0,
	aliases: ["add", "اضافة"],
	credits: "Rako San",
	description: "إضافة عضو للمجموعة عبر المعرف",
	cooldown: 0,
};

module.exports.run = async function ({ api, event, args}) {
	const { threadID, messageID} = event;
	const botID = api.getCurrentUserID();
	const out = msg => api.sendMessage(msg, threadID, messageID);
	var { participantIDs, approvalMode, adminIDs} = await api.getThreadInfo(threadID);
	var participantIDs = participantIDs.map(e => parseInt(e));
	if (!args[0]) return out("يرجى إدخال معرف أو رابط حساب العضو لإضافته.");
	if (!isNaN(args[0])) return adduser(args[0], undefined);
	else {
		try {
			var [id, name, fail] = await getUID(args[0], api);
			if (fail == true && id!= null) return out(id);
			else if (fail == true && id == null) return out("لم يتم العثور على معرف المستخدم.");
			else {
				await adduser(id, name || "مستخدم فيسبوك");
			}
		} catch (e) {
			return out(`${e.name}: ${e.message}.`);
		}
	}

	async function adduser(id, name) {
		id = parseInt(id);
		if (participantIDs.includes(id)) return out(`${name? name: "العضو"} موجود بالفعل في المجموعة.`);
		else {
			var admins = adminIDs.map(e => parseInt(e.id));
			try {
				await api.addUserToGroup(id, threadID);
			}
			catch {
				return out(`لا يمكن إضافة ${name? name: "المستخدم"} إلى المجموعة.`);
			}
			if (approvalMode === true &&!admins.includes(botID)) return out(`تمت إضافة ${name? name: "العضو"} إلى قائمة الموافقة!`);
			else return out(`تمت إضافة ${name? name: "العضو"} إلى المجموعة!`);
		}
	}
}