const version = require('../package').version;
const Config = require('../config');

function parse_setting_value(value, value_type){
	if(value_type == 'boolean')
		value = value == true ? 'да' : value == false ? 'нет' : value;
	else if(value_type == 'time')
		value = value + 'c';

	return value;
}

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
			let settings = Config.get('settings');
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
			let setting = Config.getSettingById(id - 1);

			if(setting == undefined)
				return await ctx.failure(`Настройка с номером ${id} не существует!`);

			value = value == "+" ? true : value == "-" ? false : value;

			Config.setSettingById(id - 1, value);

			await ctx.success(`${setting.display_name}: ${parse_setting_value(value, setting.value_type)}`);
		}
	},
	{
		name : 'modules',
		regexp : /модули/i,
		async handler(ctx){
			let modules = Config.get('modules');
			let answer = ['Список подключенных модулей', '']

			for(let i = 0; i < modules.length; i++){
				answer.push(`${i+1}. ${modules[i]}`);
			}

			await ctx.success(answer.join('\n'));
		}
	}
]