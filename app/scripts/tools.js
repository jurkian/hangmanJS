// Automatically add replaceAt method to strings
String.prototype.replaceAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index + character.length);
};

// Overwrite default settings with user's
// Even if the single setting doesn't exist in defaults
// create a new one basing on newSettings
var updateSettings = function(defaultSettings, newSettings) {
	for (var prop in newSettings) {
		if (newSettings.hasOwnProperty(prop)) {
			defaultSettings[prop] = newSettings[prop];
		}
	}
};

// Get all indexes of value in array
var getAllIndexes = function(arr, val) {
	var indexes = [], 
		i = -1;

	while ((i = arr.indexOf(val, i + 1)) != -1) {
		indexes.push(i);
	}

	return indexes;
};

module.exports = {
	updateSettings: updateSettings,
	getAllIndexes: getAllIndexes
};
