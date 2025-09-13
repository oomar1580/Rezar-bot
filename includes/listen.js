module.exports = function({
  api,
  models
}) {
  const fs = require('fs');
  const Users = require("./controllers/users")({ models, api });
  const Threads = require("./controllers/threads")({ models, api });
  const Currencies = require("./controllers/currencies")({ models });
  const logger = require("../utils/log.js");

  (async () => {
    try {
      logger.loader("Loading user and group data");
      const [threads, users, currencies] = await Promise.all([
        Threads.getAll(),
        Users.getAll(['userID', 'name', 'data']),
        Currencies.getAll(['userID'])
      ]);

      for (const thread of threads) {
        const idThread = String(thread.threadID);
        global.data.allThreadID.push(idThread);
        global.data.threadData.set(idThread, thread.data || {});
        global.data.threadInfo.set(idThread, thread.threadInfo || {});
      }

      for (const user of users) {
        const idUsers = String(user.userID);
        global.data.allUserID.push(idUsers);
        if (user.name && user.name.length > 0) global.data.userName.set(idUsers, user.name);
      }

      for (const currency of currencies) {
        global.data.allCurrenciesID.push(String(currency.userID));
      }

      logger.loader(`Loaded ${global.data.allThreadID.length} groups`);
      logger.loader(`Loaded ${global.data.allUserID.length} users`);
    } catch (error) {
      logger.loader(`Loading environment failed: ${error}`, "error");
    }
  })();

  const handleCommand = require("./handle/handleCommand")({ api, models, Users, Threads, Currencies });
  const handleCommandEvent = require("./handle/handleCommandEvent")({ api, models, Users, Threads, Currencies });
  const handleReply = require("./handle/handleReply")({ api, models, Users, Threads, Currencies });
  const handleReaction = require("./handle/handleReaction")({ api, models, Users, Threads, Currencies });
  const handleEvent = require("./handle/handleEvent")({ api, models, Users, Threads, Currencies });
  const handleRefresh = require("./handle/handleRefresh")({ api, models, Users, Threads, Currencies });
  const handleCreateDatabase = require("./handle/handleCreateDatabase")({ api, Threads, Users, Currencies, models });

  return async function(event) {
    await handleCreateDatabase({ event });

    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        await Promise.all([
          handleCommand({ event }),
          handleReply({ event }),
          handleCommandEvent({ event })
        ]);
        break;
      case "event":
        await Promise.all([
          handleEvent({ event }),
          handleRefresh({ event })
        ]);
        break;
      case "message_reaction":
        await handleReaction({ event });
        break;
      default:
        break;
    }
  };
};