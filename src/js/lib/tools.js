let Tools = {};

// Automatically add replaceAt method to strings
String.prototype.replaceAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index + character.length);
};

// Overwrite default settings with user's
// Even if the single setting doesn't exist in defaults
// create a new one basing on newSettings
Tools.updateSettings = (defaultSettings, newSettings) => {
	for (let prop in newSettings) {
		if (newSettings.hasOwnProperty(prop)) {
			defaultSettings[prop] = newSettings[prop];
		}
	}
};

// Get all indexes of value in array
Tools.getAllIndexes = (arr, val) => {
	let indexes = [],
		i = -1;

	while ((i = arr.indexOf(val, i + 1)) !== -1) {
		indexes.push(i);
	}

	return indexes;
};

export default Tools;