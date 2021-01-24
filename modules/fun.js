const Config = require('../config');

const soveti = [
	'Запомни раз и навсегда - London is a capital of Great Britain',
	'Рассист рассиста определяет по цвету кожи',
	'Не заходи в Vim',
	'Работает - не трогай',
	'Не лови медведей на пельмени, лучше мне отдай',
	'Данный совет сломан, пожалуйста обратитесь к вашему лечащему врачу',
	'Не кричи "ниггеры!!" приходя на гроув-стрит',
	'Не работает - тем более не трогай'
];

module.exports = [
	{
		name : 'soveti',
		regexp : /совет/i,
		async handler(ctx){
			await ctx.edit(soveti[Math.floor(Math.random()*soveti.length)]);
		}
	}
]