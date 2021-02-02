const axios = require('axios').default;
const db = require('../config');

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
		handler : async (ctx) => await ctx.edit(soveti[Math.floor(Math.random()*soveti.length)])
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
	},
	{
		name : 'weather',
		regexp : /^погода\s+(?<city>.+)$/im,
		async handler(ctx){
			let { city } = ctx.$match.groups;
			let owm_token = db.get('owm_token').value();

			if(owm_token == undefined)
				return await ctx.failure('Необходим токен Open Weather Map API');

			let url = encodeURI(`https://api.openweathermap.org/data/2.5/weather?appid=${owm_token}&q=${city}&lang=ru&units=metric`);

			let res;

			try{
				res = await axios(url);
			}catch(e){
				await ctx.failure(res.data);
			}

			res = res.data;
			
			await ctx.edit([
				`Погода в городе ${res.name}: ${res.weather[0].description}`,
				'',
				`Температура сейчас: ${res.main.temp}&#176;С`,
				`Минимальная температура: ${res.main.temp_min}&#176;С`,
				`Максимальная температура: ${res.main.temp_max}&#176;С`,
				`Ощущается как: ${res.main.feels_like}&#176;С`,
				`Давление: ${res.main.pressure}hPa`,
				`Влажность: ${res.main.humidity}%`
			].join('\n'));
		}
	}
]