const Config = require('./config');
const { VK } = require('vk-io');
const { HearManager } = require('@vk-io/hear');

const vk = new VK({
	token : Config.get('token')
});

const hearManager = new HearManager();

let user = {};
let delete_query = [];

vk.api.users.get({})
	.then(res => user = res[0])
	.catch(err => console.error(err));

vk.updates.on('message', async (ctx, next) => {
	if(ctx.peerType != 'user')
		if(ctx.senderId != user.id)
			return;

	ctx.edit = async text => {
		await vk.api.messages.edit({
			message : text,
			keep_forward_messages : true,
			keep_snippets : true,
			dont_parse_links : false,
			peer_id : ctx.peerId,
			message_id : ctx.id
		});
	}

	ctx.answer = async (symbol, text) => {
		if(Config.getSettingByName('delete_answers')[0].value == true)
			delete_query.push(ctx.id);

		await ctx.edit(`${symbol}| ${text}`);
	}

	ctx.success = async text => {
		await ctx.answer(Config.get('success_symbol'), text);
	}

	ctx.failure = async text => {
		await ctx.answer(Config.get('error_symbol'), text);
	}

	ctx.delete = async (message_ids, delete_for_all=true) => {
		await vk.api.messages.delete({ message_ids, delete_for_all });
	}

	return await next();
});

vk.updates.on('message', async (ctx, next) => {
	let regexp = new RegExp(`${Config.get('prefix')}\\s+(?<command>.+)`);

	if(!regexp.test(ctx.text))
		return

	let match = regexp.exec(ctx.text);
	ctx.text = match.groups.command;

	return await next();
});

vk.updates.on('message', async (ctx, next) => {
	console.log('Received message');
	console.log(`Text: ${ctx.text}`);
	console.log(`Time: ${new Date(ctx.createdAt)}`);
	console.log(`Peer ID: ${ctx.peerId}`);
	return await next();
});

vk.updates.on('message', hearManager.middleware);

Config.get('modules').forEach(module => {
	try{
		let commands = require('./modules/' + module);
		console.log('Загружаю модуль: ' + module);

		commands.forEach(command => {
			hearManager.hear(command.regexp, command.handler);
			console.log('Загружена команда: ' + command.name);
		});
	}catch(e){
		console.log('Произошла ошибка при попытке загрузить модуль "' + module + '"');
	}
});

setInterval(async () => {
	if(delete_query.length < 1)
		return;

	let id = delete_query.shift();

	if(Config.getSettingByName('delete_answers')[0].value == true)
		try{
			return await vk.api.messages.delete({ message_ids : id, delete_for_all : true });
		}catch(e){}

}, parseFloat(Config.getSettingByName('delete_answers_delay')[0].value) * 1000);

Config.saveConfig();
vk.updates.startPolling()
	.then(async () => {
		console.log('Polling started');
		if(Config.getSettingByName('send_message_on_start')[0].value == true){
			await vk.api.messages.send({
				message : 'VKLP запущен',
				random_id : 2000000000*Math.random(),
				peer_id : user.id
			});
		}
	})
	.catch(console.log);