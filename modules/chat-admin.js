const utils = require('../utils');

module.exports = [
	{
		name : 'kick',
		regexp : /кик/i,
		async handler(ctx){
			if(ctx.peerType != 'chat')
				return await ctx.failure('Эта команда доступна только в чатах');
			if(!ctx.replyMessage)
				return await ctx.failure('Необходим реплай');

			await ctx.loadMessagePayload();
			
			try{
				await ctx.vk.api.messages.removeChatUser({
					chat_id : ctx.peerId - 2e9,
					user_id : ctx.replyMessage.senderId
				});
			}catch(e){
				return await ctx.failure('Не удалось удалить пользователя.\nКод ошибки: ' + e.code);
			}

			await ctx.success('Данный лохозверь был наказан. мухахахахах');
		}
	},
	{
		name : 'add chat user',
		regexp : /добавить\s+в\s+чат\s+(?<id>.+)/i,
		async handler(ctx){
			if(ctx.peerType != 'chat')
				return await ctx.failure('Эта команда доступна только в чатах');

			let { id } = ctx.$match.groups;
			id = utils.getUserId(id);

			try{
				await ctx.vk.api.messages.addChatUser({
					chat_id : ctx.peerId - 2e9,
					user_id : id
				});
			}catch(e){
				return await ctx.failure('Не удалось добавить пользователя.\nКод ошибки: ' + e.code);
			}

			await ctx.success('Пользователь добавлен');
		}
	}
]