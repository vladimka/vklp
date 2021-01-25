const db = require('../config');

module.exports = [
	{
		name : 'scripts',
		regexp : /скрипты/i,
		async handler(ctx){
			let scripts = db.get('scripts').value();
			let answer = ['Ваши скрипты', ''];

			for(let i = 0; i < scripts.length; i++){
				answer.push(`${i+1}. ${scripts[i].name}`);
			}

			await ctx.success(answer.join('\n'));
		}
	},
	{
		name : 'see script',
		regexp : /^скрипт\s+(?<name>.+)/im,
		async handler(ctx){
			let { name } = ctx.$match.groups;
			let script = db.get('scripts').find({ name }).value();

			if(script == undefined)
				return await ctx.failure(`Скрипт с именем "${name}" не существует`);

			await ctx.success(`${script.name}\n${script.script}`);
		}
	},
	{
		name : 'add script',
		regexp : /\+скрипт\s+(?<name>.+)\s+(?<body>.+)/im,
		async handler(ctx){
			let { name, body } = ctx.$match.groups;

			if(db.get('scripts').find({ name }).value() != undefined)
				return await ctx.failure(`Скрипт с именем "${name}" уже существует`);

			db.get('scripts').push({ name, script : body }).write();

			await ctx.success(`Done!`);
		}
	},
	{
		name : 'change script',
		regexp : /\~скрипт\s+(?<name>.+)\s*\/\s*(?<body>.+)/im,
		async handler(ctx){
			let { name, body } = ctx.$match.groups;

			if(db.get('scripts').find({ name }).value() == undefined)
				return await ctx.failure(`Скрипт с именем "${name}" не существует`);

			db.get('scripts').find({ name }).assign({ script : body }).write();

			await ctx.success(`Done!`);
		}
	},
	{
		name : 'remove script',
		regexp : /\-скрипт\s+(?<name>.+)/im,
		async handler(ctx){
			let { name } = ctx.$match.groups;

			if(db.get('scripts').find({ name }).value() == undefined)
				return await ctx.failure(`Скрипт с именем "${name}" не существует`);

			db.get('scripts').remove({ name }).write();

			await ctx.success(`Done!`);
		}
	},
	{
		name : 'run script',
		regexp : /\@скрипт\s+(?<name>.+)/im,
		async handler(ctx){
			let { name } = ctx.$match.groups;
			let script = db.get('scripts').find({ name }).value();

			if(script == undefined)
				return await ctx.failure(`Скрипт с именем "${name}" не существует`);

			let res;

			try{
				res = await ctx.api.execute({
					code : script.script
				});
			}catch(e){
				return await ctx.failure(e.message);
			}

			await ctx.success(JSON.stringify(res));
		}
	}
]