const version = require('../package').version;
const db = require('../config');

function parse_setting_value(value, value_type){
	if(value_type == 'boolean')
		value = value == true ? 'да' : value == false ? 'нет' : value;
	else if(value_type == 'time')
		value = value + 'c';

	return value;
}

module.exports = [
	{
		regexp : /^тест$/im,
		name : 'test',
		async handler(ctx){
			await ctx.success('тест');
		}
	},
	{
		regexp : /пинг/i,
		name : 'ping',
		async handler(ctx){
			let ping = new Date(ctx.createdAt).getMilliseconds();
			await ctx.success(`Понг ${ping}мc`);
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
			await ctx.edit(`-- VKLP v${version} --\nСоздатель: @my_name_is_tom_riddle (Том-Марволло Рэдл)`);
		}
	},
	{
		name : 'settings',
		regexp : /н(айстройки)?$/im,
		async handler(ctx){
			let settings = db.get('settings').value();
			let answer = ['-- Настройки VKLP --',''];

			for(let i = 0; i < settings.length; i++){
				let name = settings[i].display_name;
				let value = settings[i].value;
				let value_type = settings[i].value_type;
				value = parse_setting_value(value, value_type);

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
			let setting = db.get('settings').value().find((el, i) => i == id - 1);

			if(setting == undefined)
				return await ctx.failure(`Настройка с номером ${id} не существует!`);

			value = value == "+" ? true : value == "-" ? false : value;

			await db.get('settings').find({ name : setting.name }).assign({ value }).write();
			await ctx.success(`${setting.display_name}: ${parse_setting_value(value, setting.value_type)}`);
		}
	},
	{
		name : 'delete messages',
		regexp : /дд(\s+(?<count>\d+))?/i,
		async handler(ctx){
			let { count } = ctx.$match.groups || 25;

			let messages = await ctx.api.messages.getHistory({
				peer_id : ctx.peerId, 
				count
			});

			messages = messages.items.filter(msg => msg.from_id == ctx.user.id);
			messages.forEach(async msg => {
				try{
					await ctx.delete(msg.id);
				}catch(e){}
			});
		}
	}
]