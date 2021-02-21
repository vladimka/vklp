async function executeTemplate(vk, template){
	// dialogs: {DIALOGS_COUNT}
	let conversations = await vk.api.messages.getConversations({
		count : 0
	});

	let variables = {
		'dialogs_count' : conversations.count,
		'dialogs_unread' : conversations.unread_count
	}

	template = template.replace(/\{(.+)\}/ig, (_, varName) => {
		return variables[varName];
	});

	return template;
}

module.exports.getUserId = (text) => {
	return text.match(/\[(id(\d+))\|.+\]/)[2];
}

module.exports.executeTemplate = executeTemplate;