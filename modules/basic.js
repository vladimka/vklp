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
			console.log(ctx);

			if(ctx.attachments[0]){
				await ctx.vk.upload.messagePhoto({
					peer_id : ctx.peer_id,
					source : {
						value : ctx.attachments[0]
					}
				});
			}

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
			let answer = [
				`-- VKLP v${version} --`,
				`Создатель: @my_name_is_tom_riddle (Том-Марволло Рэдл)`,
				'',
				`Префикс: ${db.get('prefix').value()}`
			]

			await ctx.edit(answer.join('\n').trim());
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

			let messages = await ctx.vk.api.messages.getHistory({
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
	},
	{
		name : 'change_prefix',
		regexp : /~префикс\s+(?<prefix>.+)/i,
		async handler(ctx){
			let { prefix } = ctx.$match.groups;

			await db.set('prefix', prefix).write();

			await ctx.success(`Префикс успешно изменён`);
		}
	},
	{
		name : 'modules',
		regexp : /модули/i,
		async handler(ctx){
			const answer = ['Модули', ''];

			db.get('modules').value().forEach((module, idx) => {
				answer.push(`${idx + 1}. ${module.name} ${module.connected == false ? '(отключён)' : ''}`);
			});

			await ctx.edit(answer.join('\n'));
		}
	},
	{
		name : 'disconnect module',
		regexp : /-модуль\s+(?<moduleName>.+)/i,
		async handler(ctx){
			let { moduleName } = ctx.$match.groups;

			if(moduleName == 'basic')
				return await ctx.failure('Нельзя отключить базовый модуль');

			db.get('modules')
				.find({ name : moduleName })
				.assign({ connected : false })
				.write();

			await ctx.success(`Модуль ${moduleName} отключён`);
		}
	},
	{
		name : 'disconnect module',
		regexp : /\+модуль\s+(?<moduleName>.+)/i,
		async handler(ctx){
			let { moduleName } = ctx.$match.groups;

			db.get('modules')
				.find({ name : moduleName })
				.assign({ connected : true })
				.write();

			await ctx.success(`Модуль ${moduleName} подключён`);
		}
	}
]