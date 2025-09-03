module.exports.config = {
	name: "منشور",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "Rako San",
	description: "إنشاء منشور جديد في حساب البوت",
	commandCategory: "أدوات",
	cooldowns: 5
};

module.exports.run = async ({ event, api}) => {
  const { threadID, messageID, senderID} = event;
  const uuid = getGUID();
  const formData = {
    input: {
      composer_entry_point: "inline_composer",
      composer_source_surface: "timeline",
      idempotence_token: uuid + "_FEED",
      source: "WWW",
      attachments: [],
      audience: {
        privacy: {
          allow: [],
          base_state: "FRIENDS",
          deny: [],
          tag_expansion_state: "UNSPECIFIED"
}
},
      message: {
        ranges: [],
        text: ""
},
      with_tags_ids: [],
      inline_activities: [],
      explicit_place_id: "0",
      text_format_preset_id: "0",
      logging: {
        composer_session_id: uuid
},
      tracking: [null],
      actor_id: api.getCurrentUserID(),
      client_mutation_id: Math.floor(Math.random() * 17)
},
    feedLocation: "TIMELINE",
    renderLocation: "timeline",
    isTimeline: true
};

  return api.sendMessage(`اختر من يمكنه رؤية هذا المنشور:\n1. الجميع\n2. الأصدقاء\n3. أنا فقط`, threadID, (e, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      formData,
      type: "whoSee"
});
}, messageID);
};

module.exports.handleReply = async ({ event, api, handleReply}) => {
  const { type, author, formData} = handleReply;
  if (event.senderID!= author) return;
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID, senderID, attachments, body} = event;
  const botID = api.getCurrentUserID();

  async function uploadAttachments(attachments) {
    let uploads = [];
    for (const attachment of attachments) {
      const form = { file: attachment};
      uploads.push(api.httpPostFormData(`https://www.facebook.com/profile/picture/upload/?profile_id=${botID}&photo_source=57&av=${botID}`, form));
}
    return await Promise.all(uploads);
}

  if (type == "whoSee") {
    if (!["1", "2", "3"].includes(body)) return api.sendMessage('يرجى اختيار رقم من الخيارات الثلاثة أعلاه', threadID, messageID);
    formData.input.audience.privacy.base_state = body == "1"? "EVERYONE": body == "2"? "FRIENDS": "SELF";
    api.unsendMessage(handleReply.messageID, () => {
      api.sendMessage(`رد على هذه الرسالة بمحتوى المنشور، وإذا أردت تركه فارغًا، أرسل 0`, threadID, (e, info) => {
        global.client.handleReply.push({
          name: handleReply.name,
          messageID: info.messageID,
          author: senderID,
          formData,
          type: "content"
});
}, messageID);
});
} else if (type == "content") {
    if (body!== "0") formData.input.message.text = body;
    api.unsendMessage(handleReply.messageID, () => {
      api.sendMessage(`رد على هذه الرسالة بصورة (يمكنك إرسال عدة صور، وإذا لا تريد إضافة صور، أرسل 0)`, threadID, (e, info) => {
        global.client.handleReply.push({
          name: handleReply.name,
          messageID: info.messageID,
          author: senderID,
          formData,
          type: "image"
});
}, messageID);
});
} else if (type == "image") {
    if (body!== "0") {
      const allStreamFile = [];
      const pathImage = __dirname + `/cache/imagePost.png`;
      for (const attach of attachments) {
        if (attach.type!== "photo") continue;
        const getFile = (await axios.get(attach.url, { responseType: "arraybuffer"})).data;
        fs.writeFileSync(pathImage, Buffer.from(getFile));
        allStreamFile.push(fs.createReadStream(pathImage));
}
      const uploadFiles = await uploadAttachments(allStreamFile);
      for (let result of uploadFiles) {
        if (typeof result === "string") result = JSON.parse(result.replace("for (;;);", ""));
        formData.input.attachments.push({ photo: { id: result.payload.fbid.toString()}});
}
}
const form = {
      av: botID,
      fb_api_req_friendly_name: "ComposerStoryCreateMutation",
      fb_api_caller_class: "RelayModern",
      doc_id: "7711610262190099",
      variables: JSON.stringify(formData)
};

    api.httpPost('https://www.facebook.com/api/graphql/', form, (e, info) => {
      api.unsendMessage(handleReply.messageID);
      try {
        if (e) throw e;
        if (typeof info === "string") info = JSON.parse(info.replace("for (;;);", ""));
        const postID = info.data.story_create.story.legacy_story_hideable_id;
        const urlPost = info.data.story_create.story.url;
        if (!postID) throw info.errors;
        try {
          fs.unlinkSync(__dirname + "/cache/imagePost.png");
} catch (e) {}
        return api.sendMessage(`✅ تم إنشاء المنشور بنجاح\n🆔 معرف المنشور: ${postID}\n🔗 الرابط: ${urlPost}`, threadID, messageID);
} catch (e) {
        return api.sendMessage(`❌ فشل إنشاء المنشور، يرجى المحاولة لاحقًا`, threadID, messageID);
}
});
}
};

function getGUID() {
  let sectionLength = Date.now();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.floor((sectionLength + Math.random() * 16) % 16);
    sectionLength = Math.floor(sectionLength / 16);
    return (c === "x"? r: (r & 7) | 8).toString(16);
});
}