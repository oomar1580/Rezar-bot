module.exports.config = {
	name: "رياضيات",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Rako San",
	description: "",
	commandCategory: "تعليم ودراسة",
	cooldowns: 0
};

module.exports.run = ({ event, api}) => api.sendMessage(`📘 قوانين رياضية أساسية

1/ مربع مجموع: (a + b)² = a² + 2ab + b² = (a − b)² + 4ab

2/ مربع الفرق: (a − b)² = a² - 2ab + b² = (a + b)² − 4ab

3/ فرق مربعين: a² − b² = (a − b)(a + b)

4/ مكعب مجموع: (a + b)³ = a³ + 3a²b + 3ab² + b³

5/ مكعب الفرق: (a − b)³ = a³ − 3a²b + 3ab² − b³

6/ مجموع مكعبين: a³ + b³ = (a + b)(a² − ab + b²) = (a + b)³ − 3ab(a + b)

7/ فرق مكعبين: a³ − b³ = (a − b)(a² + ab + b²) = (a − b)³ + 3ab(a − b)

📗 علاقات إضافية

1/ (a + b + c)³ = a³ + b³ + c³ + 3(a + b)(b + c)(a + c)

2/ a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ac)

3/ (a − b − c)² = a² + b² + c² - 2ab + 2bc − 2ac

4/ (a + b + c)² = a² + b² + c² + 2ab + 2bc + 2ac

5/ (a + b − c)² = a² + b² + c² + 2ab − 2bc − 2ac`, event.threadID, event.messageID);