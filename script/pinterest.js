module.exports.config = {
    name: "صور",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Rako San",
    description: "البحث عن الصور",
    commandCategory: "بحث",
    usePrefix: false,
    usages: "[الكلمة - عدد الصور]",
    cooldowns: 0,
};

module.exports.run = async function({ api, event, args}) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const request = require("request");
    const keySearch = args.join(" ");
    if (!keySearch.includes("-")) return api.sendMessage('يرجى إدخال التنسيق الصحيح، مثال: بحث-صور ورد - 5 (يعتمد على عدد الصور التي تريد عرضها)', event.threadID, event.messageID);

    const keySearchs = keySearch.substr(0, keySearch.indexOf('-')).trim();
    const numberSearch = keySearch.split("-").pop().trim() || 6;
    const res = await axios.get(`https://api-dien.kira1011.repl.co/pinterest?search=${encodeURIComponent(keySearchs)}`);
    const data = res.data.data;
    let num = 0;
    let imgData = [];

    for (let i = 0; i < parseInt(numberSearch); i++) {
        let path = __dirname + `/cache/${++num}.jpg`;
        let getDown = (await axios.get(`${data[i]}`, { responseType: 'arraybuffer'})).data;
        fs.writeFileSync(path, Buffer.from(getDown, 'utf-8'));
        imgData.push(fs.createReadStream(path));
}

    api.sendMessage({
        attachment: imgData,
        body: `${numberSearch} نتيجة بحث عن الكلمة: ${keySearchs}`
}, event.threadID, event.messageID);

    for (let ii = 1; ii <= parseInt(numberSearch); ii++) {
        fs.unlinkSync(__dirname + `/cache/${ii}.jpg`);
}
};