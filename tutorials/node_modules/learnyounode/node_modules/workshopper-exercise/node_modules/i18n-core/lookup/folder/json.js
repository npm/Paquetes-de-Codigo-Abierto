module.exports = {
	getFile: function (partPath) {
		return partPath + ".json";
	},
	load: JSON.parse
};