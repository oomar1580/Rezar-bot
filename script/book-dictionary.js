module.exports.config = {
  name: "قاموس",
  version: "1.0.0",
  role: 0,
  aliases: ['بحث', 'معنى', 'تعريف'],
  credits: "Rako San"
};
module.exports.run = async function({
  api,
  event,
  args
}) {
  const input = args.join(" ");
  if (!input) {
    return api.sendMessage("يرجى إدخال كلمة للبحث عن معناها.", event.threadID, event.messageID);
}
  try {
    const response = await require("axios").get(encodeURI(`https://api.dictionaryapi.dev/api/v2/entries/en/${input}`));
    const data = response.data[0];
    const phonetics = data.phonetics;
    const meanings = data.meanings;
    let msg_meanings = "";
    meanings.forEach((item) => {
      const definition = item.definitions[0].definition;
      const example = item.definitions[0].example? `\n*مثال:\n \"${item.definitions[0].example[0].toUpperCase() + item.definitions[0].example.slice(1)}\"`: "";
      msg_meanings += `\n• ${item.partOfSpeech}\n ${definition[0].toUpperCase() + definition.slice(1) + example}`;
});
    let msg_phonetics = "";
    phonetics.forEach((item) => {
      const text = item.text? `\n    /${item.text}/`: "";
      msg_phonetics += text;
});
    const msg = `❰ ❝ ${data.word} ❞ ❱` + msg_phonetics + msg_meanings;
    api.sendMessage(msg, event.threadID, event.messageID);
} catch (error) {
    if (error.response?.status === 404) {
      api.sendMessage(`لم يتم العثور على تعريف لكلمة '${input}'.`, event.threadID, event.messageID);
} else {
      api.sendMessage("حدث خطأ أثناء جلب التعريف. يرجى المحاولة لاحقًا.", event.threadID, event.messageID);
}
}
};