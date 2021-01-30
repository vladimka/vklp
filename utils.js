module.exports.getUserId = (text) => {
	return text.match(/\[(id(\d+))\|.+\]/)[2];
}