const db = require('../config');

module.exports = [
	{
		name : 'add audio template',
		regexp : /\+гшаб\s+(?<name>.+)/i,
		async handler(ctx){
			if(!ctx.replyMessage)
				return await ctx.failure('Небходим реплай');

			await ctx.loadMessagePayload();

			let reply = ctx.replyMessage;

			if(!reply.attachments[0] || reply.attachments[0].type != 'audio_message')
				return await ctx.failure('Небходимо прикрепление с голосовым сообщением');

			let { name } = ctx.$match.groups;

			if(db.get('audio_templates').find({ name }).value() != undefined)
				return await ctx.failure(`Голосовой шаблон "${name}" уже существует`);

			db
				.get('audio_templates')
				.push({
					attachment : `audio_message${reply.attachments[0].ownerId}_${reply.attachments[0].id}_${reply.attachments[0].accessKey}`,
					name
				})
				.write();

			await ctx.success('Голосовой шаблон сохранен');
		}
	},
	{
		name : 'send audio template',
		regexp : /^гшаб\s+(?<name>.+)/im,
		async handler(ctx){
			let { name } = ctx.$match.groups;
			let attachment;

			if((attachment = db.get('audio_templates').find({ name }).value()) == undefined)
				return await ctx.failure(`Голосовой шаблон "${name}" не существует`);

			attachment = attachment.attachment;

			await ctx.delete();
			await ctx.send({ attachment });
		}
	},
	{
		name : 'delete audio template',
		regexp : /-гшаб\s+(?<name>.+)/i,
		async handler(ctx){
			let { name } = ctx.$match.groups;

			if(db.get('audio_templates').find({ name }).value() == undefined)
				return await ctx.failure(`Голосовой шаблон "${name}" не существует`);

			db
				.get('audio_templates')
				.remove({ name })
				.write();

			await ctx.success('Голосовой шаблон удален');
		}
	},
	{
		name : 'audio temmplates list',
		regexp : /^гшабы/im,
		async handler(ctx){
			let answer = ['Ваши голосовые шаблоны', ''];

			db.get('audio_templates').value().forEach((audio_template, idx) => {
				answer.push(`${idx + 1}. ${audio_template.name}`);
			})

			await ctx.edit(answer.join('\n'));
		}
	}
]