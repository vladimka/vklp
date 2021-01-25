const db = require('./config');
const { VK } = require('vk-io');
const { HearManager } = require('@vk-io/hear');

const vk = new VK({
	token : db.get('token').value()
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
		if(db.get('settings').find({ name : 'delete_answers' }).value().value == true)
			delete_query.push(ctx.id);

		await ctx.edit(`${symbol}| ${text}`);
	}

	ctx.success = async text => {
		await ctx.answer(db.get('success_symbol').value(), text);
	}

	ctx.failure = async text => {
		await ctx.answer(db.get('error_symbol').value(), text);
	}

	ctx.delete = async (message_ids, delete_for_all=true) => {
		await vk.api.messages.delete({ message_ids, delete_for_all });
	}

	ctx.api = vk.api;
	ctx.user = user;

	return await next();
});

vk.updates.on('message', async (ctx, next) => {
	let regexp = new RegExp(`${db.get('prefix').value()}\\s+(?<command>.+)`, 'i');

	if(!regexp.test(ctx.text))
		return

	let match = regexp.exec(ctx.text);
	ctx.text = ctx.text.replace(new RegExp(db.get('prefix').value(), 'i'), '').trim();

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

db.get('modules').value().forEach(module => {
	try{
		let commands = require('./modules/' + module);
		console.log('Загружаю модуль: ' + module);

		commands.forEach(command => {
			hearManager.hear(command.regexp, command.handler);
			console.log('Загружена команда: ' + command.name);
		});
	}catch(e){
		console.log('Произошла ошибка при попытке загрузить модуль "' + module + '"');
		console.log(e);
	}
});

setInterval(async () => {
	if(delete_query.length < 1)
		return;

	let id = delete_query.shift();

	if(db.get('settings').find({ name : 'delete_answers' }).value().value == true)
		try{
			return await vk.api.messages.delete({ message_ids : id, delete_for_all : true });
		}catch(e){}

}, parseFloat(db.get('settings').find({ name : 'delete_answers_delay' }).value().value) * 1000);

vk.updates.startPolling()
	.then(async () => {
		console.log('Polling started');
		if(db.get('settings').find({ name : 'send_message_on_start' }).value().value == true){
			await vk.api.messages.send({
				message : 'VKLP запущен',
				random_id : 2000000000*Math.random(),
				peer_id : user.id
			});
		}
	})
	.catch(console.log);