module.exports.config = {
  name: 'قائمة-المجموعات',
  version: '1.0.0',
  credits: 'Rako San',
  role: 2,
  description: 'عرض قائمة المجموعات التي يشارك فيها البوت',
  commandCategory: 'النظام',
  usages: 'قائمة-المجموعات',
  cooldowns: 15
};

module.exports.handleReply = async function({ api, event, args, Threads, handleReply}) {
  if (parseInt(event.senderID)!== parseInt(handleReply.author)) return;

  var arg = event.body.split(" ");
  var idgr = handleReply.groupid[arg[1] - 1];

  switch (handleReply.type) {
    case "reply":
      {
        if (arg[0] == "حظر" || arg[0] == "بان") {
          const data = (await Threads.getData(idgr)).data || {};
          data.banned = 1;
          await Threads.setData(idgr, { data});
          global.data.threadBanned.set(parseInt(idgr), 1);
          api.sendMessage(`[${idgr}] تم الحظر بنجاح!`, event.threadID, event.messageID);
          break;
}

        if (arg[0] == "غادر" || arg[0] == "اخرج") {
          api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
          api.sendMessage("تم الخروج من المجموعة ذات المعرف: " + idgr + "\n" + (await Threads.getData(idgr)).name, event.threadID, event.messageID);
          break;
}
}
}
};

module.exports.run = async function({ api, event, client}) {
  var inbox = await api.getThreadList(100, null, ['INBOX']);
  let list = [...inbox].filter(group => group.isSubscribed && group.isGroup);

  var listthread = [];

  for (var groupInfo of list) {
    let data = (await api.getThreadInfo(groupInfo.threadID));
    listthread.push({
      id: groupInfo.threadID,
      name: groupInfo.name,
      sotv: data.userInfo.length,
});
}

  var listbox = listthread.sort((a, b) => {
    if (a.sotv> b.sotv) return -1;
    if (a.sotv < b.sotv) return 1;
});

  let msg = '', i = 1;
  var groupid = [];
  for (var group of listbox) {
    msg += `${i++}. ${group.name}\n🧩المعرف: ${group.id}\n🐸عدد الأعضاء: ${group.sotv}\n\n`;
    groupid.push(group.id);
}

  api.sendMessage(msg + 'قم بالرد بـ "out" أو "ban" ورقم الترتيب للخروج أو حظر تلك المجموعة!', event.threadID, (e, data) =>
    global.client.handleReply.push({
      name: this.config.name,
      author: event.senderID,
      messageID: data.messageID,
      groupid,
      type: 'reply'
})
);
};