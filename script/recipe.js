const axios = require('axios');
module.exports.config = {
  name: "وصفة",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  description: "احصل على وصفة عشوائية.",
  usage: "وصفة",
  credits: "Rako San",
  cooldown: 0
};
module.exports.run = async ({
  api,
  event
}) => {
  const {
    threadID,
    messageID
} = event;
  try {
    const response = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
    const recipe = response.data.meals[0];
    const {
      strMeal: title,
      strCategory: category,
      strArea: area,
      strInstructions: instructions,
      strMealThumb: thumbnail,
      strYoutube: youtubeLink
} = recipe;
    const recipeMessage = `
        🍽 الاسم: ${title}
        📂 الفئة: ${category}
        🌍 المنطقة: ${area}
        📋 التعليمات: ${instructions}
        ${youtubeLink? "🎥 رابط يوتيوب: " + youtubeLink: ""}
        `;
    api.sendMessage(recipeMessage, threadID, messageID);
} catch (error) {
    api.sendMessage("عذرًا، لم أتمكن من جلب وصفة الآن. حاول لاحقًا.", threadID);
}
};