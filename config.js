function genConfig(config){
	return Object.assign(config, {
		"token": "TOKEN",
		"success_symbol": "😜",
		"error_symbol": "😡",
		"prefix": "\\.лп",
		"modules": [
			"basic"
		],
		"settings": [
			{
				"name": "send_message_on_start",
				"display_name": "Приветственное сообщение",
				"value": true,
				"value_type": "boolean"
			},
			{
				"name": "delete_answers",
				"display_name": "Удалять ответы бота",
				"value": true,
				"value_type": "boolean"
			},
			{
				"name": "delete_answers_delay",
				"display_name": "Интервал удаления",
				"value": "5",
				"value_type": "time"
			}
		]
	});
}

let config = {};

try{
	config = require('./config.json');
}catch(e){
	config = genConfig(config);
}

const fs = require('fs');

class Config{
	static getSettingByName(name){
		return config.settings.filter(setting => setting.name == name);
	}

	static setSettingByName(name, value){
		let setting = Config.getSettingByName(name);
		setting.value = value;
		Config.saveConfig();
	}

	static getSettingById(id){
		return config.settings[id];
	}

	static setSettingById(id, value){
		let setting = Config.getSettingById(id);
		setting.value = value;
		Config.saveConfig();
	}

	static get(name){
		return config[name];
	}

	static set(name, value){
		config[name] = value;
	}

	static saveConfig(){
		fs.writeFileSync('./config.json', JSON.stringify(config, null, '\t'), 'utf8');
	}
}

module.exports = Config;
module.exports.genConfig = genConfig;