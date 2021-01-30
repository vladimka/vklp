const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('config.json');
const db = low(adapter);

db.defaults({
	token : '',
	modules : [
		{
			name : 'basic',
			connected : true
		}
	],
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
		},
		{
	      "name": "prefix",
	      "display_name": "Префикс",
	      "value": ".лп",
	      "value_type": ""
	    },
	    {
	      "name": "success_symbol",
	      "display_name": "Символ удачи",
	      "value": "😜",
	      "value_type": ""
	    },
	    {
	      "name": "error_symbol",
	      "display_name": "Символ ошибки",
	      "value": "⚠",
	      "value_type": ""
	    }
	],
	scripts : [],
	audio_templates : []
}).write();

module.exports = db;