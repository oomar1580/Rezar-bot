module.exports.config = {
  name: "antiout",
  version: "1.0.0"
};

module.exports.handleEvent = async ({ event, api}) => {
  if (event.logMessageData?.leftParticipantFbId === api.getCurrentUserID()) return;

  if (event.logMessageData?.leftParticipantFbId) {
    const info = await api.getUserInfo(event.logMessageData.leftParticipantFbId);
    const { name} = info[event.logMessageData.leftParticipantFbId];

    api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error) => {
      if (error) {
        api.sendMessage(`يا ${name} انت ما بتستاهل تكون هنا امشي يا رقاصة 🐸💔☝`, event.threadID);
} else {
        api.sendMessage(`يا ${name} \n ماشي وين بي كرامتك تعال ارجع هنا خلي كرامتك دي نوزعها بليلة 🐸☝`, event.threadID);
}
});
}
};