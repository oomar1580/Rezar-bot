module.exports.config = {
  name: "نشر",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
  description: "انشاء منشور",
  commandCategory: "آۆآمـر آلُـمطُـۆر",
  cooldowns: 5
};

module.exports.run = async ({ event, api }) => {
  const { threadID, messageID, senderID } = event;
  const { senderID } = event;
  if (senderID !== "61553754531086") {
    return api.sendMessage("❌ هذا الأمر مخصص فقط للرجال.", event.threadID);
  }
  const uuid = getGUID();
  const formData = {
    "input": {
      "composer_entry_point": "inline_composer",
      "composer_source_surface": "timeline",
      "idempotence_token": uuid + "_FEED",
      "source": "WWW",
      "attachments": [],
      "audience": {
        "privacy": {
          "allow": [],
          "base_state": "FRIENDS",
          "deny": [],
          "tag_expansion_state": "UNSPECIFIED"
        }
      },
      "message": {
        "ranges": [],
        "text": ""
      },
      "with_tags_ids": [],
      "inline_activities": [],
      "explicit_place_id": "0",
      "text_format_preset_id": "0",
      "logging": {
        "composer_session_id": uuid
      },
      "tracking": [null],
      "actor_id": api.getCurrentUserID(),
      "client_mutation_id": Math.floor(Math.random() * 17)
    },
    "displayCommentsFeedbackContext": null,
    "displayCommentsContextEnableComment": null,
    "displayCommentsContextIsAdPreview": null,
    "displayCommentsContextIsAggregatedShare": null,
    "displayCommentsContextIsStorySet": null,
    "feedLocation": "TIMELINE",
    "feedbackSource": 0,
    "focusCommentID": null,
    "gridMediaWidth": 230,
    "groupID": null,
    "scale": 3,
    "privacySelectorRenderLocation": "COMET_STREAM",
    "renderLocation": "timeline",
    "useDefaultActor": false,
    "inviteShortLinkKey": null,
    "isFeed": false,
    "isFundraiser": false,
    "isFunFactPost": false,
    "isGroup": false,
    "isTimeline": true,
    "isSocialLearning": false,
    "isPageNewsFeed": false,
    "isProfileReviews": false,
    "isWorkSharedDraft": false,
    "UFI2CommentsProvider_commentsKey": "ProfileCometTimelineRoute",
    "hashtag": null,
    "canUserManageOffers": false
  };
  
  return api.sendMessage(`اختر الجمهور الذي يمكنه رؤية هذا المنشور الخاص بك:\n1. الجميع\n2. الأصدقاء\n3. أنا فقط`, threadID, (e, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      formData,
      type: "whoSee"
    });
  }, messageID);
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
  const { type, author, formData } = handleReply;
  if (event.senderID != author) return;
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID, senderID, attachments, body } = event;
  const botID = api.getCurrentUserID();
  
  async function uploadAttachments(attachments) {
    let uploads = [];
    for (const attachment of attachments) {
      const form = { file: attachment };
      uploads.push(api.httpPostFormData(`https://www.facebook.com/profile/picture/upload/?profile_id=${botID}&photo_source=57&av=${botID}`, form));
    }
    uploads = await Promise.all(uploads);
    return uploads;
  }
  
  if (type == "whoSee") {
    if (!["1", "2", "3"].includes(body)) return api.sendMessage('يرجى اختيار واحد من الخيارات اعلاه', threadID, messageID);
    formData.input.audience.privacy.base_state = body == 1 ? "EVERYONE" : body == 2 ? "FRIENDS" : "SELF";
    api.unsendMessage(handleReply.messageID, () => {
      api.sendMessage(`قم بالرد على هذه الرسالة بمحتوى المقال، إذا كنت ترغب في تركها فارغة، يرجى الرد بـ 0`, threadID, (e, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          formData,
          type: "content"
        });
      }, messageID);
    });
  } else if (type == "content") {
    if (event.body != "0") formData.input.message.text = event.body;
    api.unsendMessage(handleReply.messageID, () => {
      api.sendMessage(`قم بالرد على هذه الرسالة بصورة (يمكنك إرسال صور متعددة، إذا لم تكن ترغب في نشر صور، يرجى الرد بـ 0`, threadID, (e, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          formData,
          type: "image"
        });
      }, messageID);
    });
  } else if (type == "image") {
    if (event.body != "0") {
      const allStreamFile = [];
      const pathImage = __dirname + `/cache/imagePost.png`;
      for (const attach of attachments) {
        if (attach.type != "photo") continue;
        const getFile = (await axios.get(attach.url, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(pathImage, Buffer.from(getFile));
        allStreamFile.push(fs.createReadStream(pathImage));
      }
      const uploadFiles = await uploadAttachments(allStreamFile);
      for (let result of uploadFiles) {
        if (typeof result == "string") result = JSON.parse(result.replace("for (;;);", ""));
        formData.input.attachments.push({ "photo": { "id": result.payload.fbid.toString() } });
      }
    }
    api.unsendMessage(handleReply.messageID, () => {
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
          if (typeof info == "string") info = JSON.parse(info.replace("for (;;);", ""));
          const postID = info.data.story_create.story.legacy_story_hideable_id;
          const urlPost = info.data.story_create.story.url;
          if (!postID) throw info.errors;
          try {
            fs.unlinkSync(__dirname + "/cache/imagePost.png");
          } catch (e) {}
          return api.sendMessage(`تم إنشاء المنشور بنجاح\n» معرف المنشور: ${postID}\n» رابط المنشور: ${urlPost}`, threadID, messageID);
        } catch (e) {
          return api.sendMessage(`فشل إنشاء المنشور، يرجى المحاولة مرة أخرى لاحقًا`, threadID, messageID);
        }
      });
    });
  }
};

function getGUID() {
  var sectionLength = Date.now();
  var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.floor((sectionLength + Math.random() * 16) % 16);
    sectionLength = Math.floor(sectionLength / 16);
    var _guid = (c == "x" ? r : (r & 7) | 8).toString(16);
    return _guid;
  });
  return id;
}
