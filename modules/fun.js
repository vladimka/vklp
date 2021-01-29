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

const random = (min, max) => min+Math.floor(Math.random()*(max-min));

module.exports = [
	{
		name : 'soveti',
		regexp : /совет/i,
		async handler(ctx){
			await ctx.edit(soveti[Math.floor(Math.random()*soveti.length)]);
		}
	},
	{
		name : 'random_number',
		regexp : /рнд\s+(?<from>\d+)(\s+(?<to>\d+))?/i,
		async handler(ctx){
			let { from, to } = ctx.$match.groups;
			let rnd_num;

			if(to == undefined){
				to = from;
				from = 0;
			}

			from = parseInt(from);
			to = parseInt(to);

			await ctx.success(`Случайное число от ${from} до ${to}: ${random(from, to)}`);
		}
	}
]