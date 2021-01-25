const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('config.json');
const db = low(adapter);

db.defaults({
	token : '',
	modules : ['basic'],
	success_symbol : "😜",
	error_symbol : "😡",
	prefix : "\\.лп",
	settings: [
		{
			name: "send_message_on_start",
			display_name: "Приветственное сообщение",
			value: true,
			value_type: "boolean"
		},
		{
			name: "delete_answers",
			display_name: "Удалять ответы бота",
			value: false,
			value_type: "boolean"
		},
		{
			name: "delete_answers_delay",
			display_name: "Интервал удаления",
			value: "1",
			value_type: "time"
		}
	],
	scripts : []
}).write();

module.exports = db;