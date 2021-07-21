async function executeTemplate(vk, template){
	// dialogs: {DIALOGS_COUNT}
	let conversations = await vk.api.messages.getConversations({
		count : 0
	});

	let me = await vk.api.users.get({ fields : 'photo_id' });
	me = me[0];

	let ava_info = await vk.api.photos.getById({ photos : me.photo_id, extended : 1 });
	ava_info = ava_info[0]

	let variables = {
		'dialogs_count' : conversations.count,
		'dialogs_unread' : conversations.unread_count,
		'ava_likes' : ava_info.likes.count,
		'ava_reposts' : ava_info.reposts.count,
		'ava_comments' : ava_info.comments.count
	}

	template = template.replace(/\{(.+?)\}/ig, (_, varName) => {
		return variables[varName];
	});

	return template;
}

module.exports.getUserId = (text) => {
	return text.match(/\[(id(\d+))\|.+\]/)[2];
}

module.exports.executeTemplate = executeTemplate;