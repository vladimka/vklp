const config = require('./config.json');
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