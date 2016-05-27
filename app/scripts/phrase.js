var s = {
	phrase: '',
	maskedPhrase: '',
	visibleLetters: ''
};

// Get random phrase
var fetch = function(callback) {
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status === 200) {

			// Get 1 random phrase
			var json = JSON.parse(request.responseText),
				random = Math.floor(Math.random() * json.length);

			s.phrase = json[random].toUpperCase();
			s.maskedPhrase = mask(s.phrase, 85);
			s.visibleLetters = getVisibleLetters(s.maskedPhrase);

			if (typeof callback === 'function') {
				callback(s.phrase, s.maskedPhrase, s.visibleLetters);
			}
		}
	};

	request.open('GET', 'words.json', true);
	request.send();
};

// Getter and setter
var get = function(value) {
	return s[value];
};

var set = function(setting, value) {
	s[setting] = value;
};

// Mask chosen % of the given phrase
var mask = function(phrase, percentage) {

	percentage /= 100;
	
	var howManyLettersToMask = Math.floor(phrase.length * percentage),
		maskedPhrase = phrase;

	// Randomly mask letters
	while (howManyLettersToMask > 0) {
		var random = Math.floor(Math.random() * phrase.length),
			letter = phrase.charAt(random);

		// Mask only letters
		// Exclude: '_' and ' '
		if (letter !== '_' && letter !== ' ') {
			maskedPhrase = maskedPhrase.replaceAt(random, '_');
			howManyLettersToMask--;
		} else {
			continue;
		}
	}

	return maskedPhrase;
};

// Draw masked phrase
var draw = function(phraseContainer) {
	phraseContainer.innerHTML = s.maskedPhrase;
};

// Get visible letters of a masked phrase
var getVisibleLetters = function(maskedPhrase) {
	var phrase = maskedPhrase.split(''),
		visibleLetters = [];

	for (var i = 0, len = phrase.length; i < len; i++) {
		// If you find '_' or ' ' or a duplicate letter - continue
		if (phrase[i] === '_' || phrase[i] === ' ' || visibleLetters.indexOf(phrase[i]) > -1) {
			continue;
		} else {
			visibleLetters.push(phrase[i]);
		}
	}

	return visibleLetters;
};

module.exports = {
	get: get,
	set: set,
	fetch: fetch,
	draw: draw
};