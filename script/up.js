const os = require('os');
const pidusage = require('pidusage');

module.exports.config = {
		name: "up",
		version: "1.0.2",
		role: 0,
		credits: "Rako San",
		description: "عرض مدة تشغيل البوت والمعلومات التقنية",
		hasPrefix: true,
		cooldowns: 5,
		aliases: ["تشغيل"]
};

function byte2mb(bytes) {
		const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		let l = 0, n = parseInt(bytes, 10) || 0;
		while (n>= 1024 && ++l) n = n / 1024;
		return `${n.toFixed(n < 10 && l> 0? 1: 0)} ${units[l]}`;
}

module.exports.run = async ({ api, event}) => {
		const time = process.uptime();
		const hours = Math.floor(time / (60 * 60));
		const minutes = Math.floor((time % (60 * 60)) / 60);
		const seconds = Math.floor(time % 60);

		const usage = await pidusage(process.pid);

		const osInfo = {
				platform: os.platform(),
				architecture: os.arch()
		};

		const timeStart = Date.now();
		const returnResult = `⌚ ◈『مدة تشغيل البوت』◈: ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية\n\n❖ استخدام المعالج: ${usage.cpu.toFixed(1)}%\n❖ استخدام الذاكرة: ${byte2mb(usage.memory)}\n❖ عدد الأنوية: ${os.cpus().length}\n❖ سرعة الاستجابة: ${Date.now() - timeStart}ms\n❖ نظام التشغيل: ${osInfo.platform}\n❖ بنية المعالج: ${osInfo.architecture}`;

		return api.sendMessage(returnResult, event.threadID, event.messageID);
};
