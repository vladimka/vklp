const version = require('../package').version;
const Config = require('../config');

module.exports = [
	{
		regexp : /тест/i,
		name : 'test',
		async handler(ctx){
			await ctx.success('тест');
		}
	},
	{
		regexp : /пинг/i,
		name : 'ping',
		async handler(ctx){
			let ping = new Date(ctx.createdAt).getMilliseconds() / 1000;
			await ctx.success(`Понг ${ping} c`);
		}
	},
	{
		regexp : /жс\s+(?<code>.+)/i,
		name : 'js',
		async handler(ctx){
			let { code } = ctx.$match.groups;

			try{
				let result = eval(code);

				if(result == undefined)
					return await ctx.success('Выполнено');

				return await ctx.success(`${typeof result} : ${JSON.stringify(result, null, '\t')}`);
			}catch(e){
				return await ctx.failure(`${e.name} : ${e.message}`);
			}
		}
	},
	{
		name : 'info',
		regexp : /инфо/i,
		async handler(ctx){
			await ctx.edit(`-- VKLP v${version} --\nСоздатель: @hex10f2c (Великий и неповторимый)`);
		}
	},
	{
		name : 'settings',
		regexp : /н(айстройки)?$/im,
		async handler(ctx){
			let settings = Config.get('settings');
			let answer = ['-- Настройки VKLP --',''];

			for(let i = 0; i < settings.length; i++){
				let name = settings[i].display_name;
				let value = settings[i].value;

				value = value == true ? 'да' : value == false ? 'нет' : value;

				answer.push(`${i+1} ${name}: ${value}`);
			}

			await ctx.edit(answer.join('\n'));
		}
	},
	{
		name : 'settings change',
		regexp : /н(айстройки)?\s+(?<id>\d+)\s+(?<value>.+)$/im,
		async handler(ctx){
			let { id, value } = ctx.$match.groups;
			value = value == "+" ? true : value == "-" ? false : value;
			Config.setSettingById(id - 1, value);
			await ctx.success('OK');
		}
	}
]