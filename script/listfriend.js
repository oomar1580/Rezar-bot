module.exports.config = {
  name: "الأصدقاء",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Rako San",
  description: "عرض معلومات الأصدقاء / حذف الأصدقاء عبر الرد",
  commandCategory: "النظام",
  usages: "",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, args, Users, handleReply, event, Threads}) {
  const { threadID, messageID} = event;
  if (parseInt(event.senderID)!== parseInt(handleReply.author)) return;

  switch (handleReply.type) {
    case "reply":
      {
        var msg = "", name, urlUser, uidUser;
        var arrnum = event.body.split(" ");
        var nums = arrnum.map(n => parseInt(n));
        for (let num of nums) {
          name = handleReply.nameUser[num - 1];
          urlUser = handleReply.urlUser[num - 1];
          uidUser = handleReply.uidUser[num - 1];

          api.unfriend(uidUser);
          msg += '- ' + name + '\n🌐رابط الحساب: ' + urlUser + "\n";
}

        api.sendMessage(`💢تم حذف الأصدقاء التالية أسماؤهم💢\n\n${msg}`, threadID, () =>
          api.unsendMessage(handleReply.messageID));
}
      break;
}
};

module.exports.run = async function ({ event, api, args}) {
  const { threadID, messageID, senderID} = event;
  try {
    var listFriend = [];
    var dataFriend = await api.getFriendsList();
    var countFr = dataFriend.length;

    for (var friends of dataFriend) {
      listFriend.push({
        name: friends.fullName || "لم يتم تحديد اسم",
        uid: friends.userID,
        gender: friends.gender,
        vanity: friends.vanity,
        profileUrl: friends.profileUrl
});
}

    var nameUser = [], urlUser = [], uidUser = [];
    var page = parseInt(args[0]) || 1;
    if (page < 1) page = 1;
    var limit = 10;
    var msg = `🎭القائمة تحتوي على ${countFr} صديق🎭\n\n`;
    var numPage = Math.ceil(listFriend.length / limit);

    for (var i = limit * (page - 1); i < limit * page; i++) {
      if (i>= listFriend.length) break;
      let infoFriend = listFriend[i];
      msg += `${i + 1}. ${infoFriend.name}\n🆔المعرف: ${infoFriend.uid}\n👤النوع: ${infoFriend.gender}\n❄️الاسم المختصر: ${infoFriend.vanity}\n🌐الرابط: ${infoFriend.profileUrl}\n\n`;
      nameUser.push(infoFriend.name);
      urlUser.push(infoFriend.profileUrl);
      uidUser.push(infoFriend.uid);
}

    msg += `✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏\n--> الصفحة ${page}/${numPage} <--\nاستخدم.friend رقم الصفحة أو all\n\n`;

    return api.sendMessage(msg + '🎭قم بالرد برقم (من 1 إلى 10)، ويمكنك الرد بأكثر من رقم مفصول بمسافة لحذف الأصدقاء المحددين!', threadID, (e, data) =>
      global.client.handleReply.push({
        name: this.config.name,
        author: senderID,
        messageID: data.messageID,
        nameUser,
        urlUser,
        uidUser,
        type: 'reply'
})
);
} catch (e) {
    return console.log(e);
}
};