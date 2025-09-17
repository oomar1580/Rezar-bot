const fs = require("fs");
const config = require("../config.json");

module.exports = {
  name: "حظرالجموعات",
  description: "حظر جميع المجموعات دفعة واحدة",
  execute({ api, event }) {
    const senderID = event.senderID;
    if (!config.adminIDs.includes(senderID)) return api.sendMessage("🚫 هذا الأمر مخصص للأدمن فقط.", event.threadID);

    api.getThreadList(100, null, ["INBOX"]).then(threadList => {
      threadList.forEach(thread => {
        if (thread.isGroup) {
          api.sendMessage("⛔️ تم حظر المجموعة: " + thread.threadID, thread.threadID);
          api.setChatPermissions(thread.threadID, { "ban": true }).catch(err => {
            console.error("خطأ في حظر المجموعة:", err);
          });
        }
      });
    });
    
    api.sendMessage("✅ جاري حظر جميع المجموعات...", event.threadID);
  }
};
