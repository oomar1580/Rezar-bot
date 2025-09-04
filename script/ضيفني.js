module.exports.config = {
 name: "ضيفني",
 version: "2.0",
 hasPermission: 0,
 credits: "Rako San ",
 description: "عرض المجموعات التي فيها البوت وإضافة المطور لأي منها",
 commandCategory: "الــمـطـور",
 usages: ".ضيفني",
 cooldowns: 5
};

const DEVELOPER_ID = "61579194721841";

module.exports.run = async function({ api, event}) {
 const { threadID, messageID, senderID} = event;
 if (senderID!== DEVELOPER_ID) {
 return api.sendMessage(" هذا الأمر مخصص للرجال فقط.", threadID, messageID);
}

 try {
 const allThreads = await api.getThreadList(100, null, ["INBOX"]);
 const groupThreads = allThreads.filter(t => t.isGroup);

 if (groupThreads.length === 0) {
 return api.sendMessage("❌ البوت غير موجود في أي مجموعة حالياً.", threadID, messageID);
}

 let msg = "📋 المجموعات التي فيها البوت:\n\n";
 groupThreads.forEach((group, index) => {
 msg += `${index + 1}. 🏷️ ${group.name || "بدون اسم"}\n🆔 ID: ${group.threadID}\n\n`;
});

 api.sendMessage(msg.trim(), threadID, (err, info) => {
 global.client.handleReply.push({
 name: module.exports.config.name,
 messageID: info.messageID,
 author: senderID,
 threadID,
 groups: groupThreads
});
}, messageID);
} catch (err) {
 console.error("❌ خطأ في جلب المجموعات:", err.message);
 api.sendMessage("⚠️ حصل خطأ أثناء جلب قائمة المجموعات.", threadID, messageID);
}
};

module.exports.handleReply = async function({ api, event, handleReply}) {
 const { threadID, messageID, senderID, body} = event;
 if (senderID!== handleReply.author) return;

 const choice = parseInt(body.trim());
 const selectedGroup = handleReply.groups[choice - 1];
 if (!selectedGroup) {
 return api.sendMessage("⚠️ رقم غير صالح، اختر رقم من القائمة.", threadID, messageID);
}

 try {
 await api.addUserToGroup(senderID, selectedGroup.threadID);
 api.sendMessage(`✅ تم إضافتك إلى المجموعة:\n🏷️ ${selectedGroup.name}\n🆔 ${selectedGroup.threadID}`, threadID, messageID);
} catch (err) {
 console.error("❌ فشل في الإضافة:", err.message);
 api.sendMessage("⚠️ فشل في إضافتك للمجموعة، تحقق من صلاحيات البوت أو إعدادات المجموعة.", threadID, messageID);
}
};