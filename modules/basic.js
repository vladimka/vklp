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
	}
]