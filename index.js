const db = require('./config');
const { VK } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const { executeTemplate } = require('./utils');

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

	ctx.success_symbol = db.get('settings').find({ name : 'success_symbol' }).value().value;
	ctx.error_symbol = db.get('settings').find({ name : 'error_symbol' }).value().value;
	ctx.prefix = db.get('settings').find({ name : 'prefix' }).value().value;
	ctx.delete_answers = db.get('settings').find({ name : 'delete_answers' }).value().value;

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
		if(ctx.delete_answers == true)
			delete_query.push(ctx.id);

		await ctx.edit(`${symbol}| ${text}`);
	}

	ctx.success = async text => {
		await ctx.answer(ctx.success_symbol, text);
	}

	ctx.failure = async text => {
		await ctx.answer(ctx.error_symbol, text);
	}

	ctx.delete = async (message_ids=ctx.id, delete_for_all=true) => {
		try{
			await vk.api.messages.delete({ message_ids, delete_for_all });
		}catch(e){}
	}

	ctx.vk = vk;
	ctx.user = user;

	return await next();
});

vk.updates.on('message', async (ctx, next) => {
	let regexp = new RegExp(`^${ctx.prefix}\\s+(?<command>.+)$`, 'igm');

	if(!regexp.test(ctx.text))
		return

	let match = regexp.exec(ctx.text);
	ctx.text = ctx.text.replace(new RegExp(ctx.prefix, 'i'), '').trim();

	return await next();
});

vk.updates.on('message', async (ctx, next) => {
	let start = Date.now();
	await next();
	let end = Date.now() - start;
	console.log(`[${new Date(Date.now())}]) ${ctx.text} - ${end}ms`);
});

vk.updates.on('message', hearManager.middleware);

db.get('modules').value().forEach(_m => {
	try{
		let m = require('./modules/' + _m.name);
		console.log('Загружаю модуль: ' + _m.name);

		m.forEach(command => {
			hearManager.hear(command.regexp, async ctx => {
				if(!_m.connected) return;

				await command.handler(ctx);
			});
			console.log('	Загружена команда: ' + command.name);
		});
	}catch(e){
		console.log('Произошла ошибка при попытке загрузить модуль "' + _m.name + '"');
		console.log(e);
	}
});

setInterval(async () => {
	if(db.get('settings').find({ name : 'delete_answers' }).value().value == false)
		return;

	if(delete_query.length < 1)
		return;

	let id = delete_query.shift();

	try{
		await vk.api.messages.delete({ message_ids : id, delete_for_all : true });
	}catch(e){}
}, parseFloat(db.get('settings').find({ name : 'delete_answers_delay' }).value().value) * 1000);

setInterval(async () => {
	if(db.get('settings').find({ name : 'auto_status' }).value().value == false)
		return;

	let auto_status_template = db.get('settings').find({ name : 'auto_status_template' }).value().value;
	auto_status_template = await executeTemplate(vk, auto_status_template);

	await vk.api.status.set({
		text : auto_status_template
	})
}, 6e4);

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