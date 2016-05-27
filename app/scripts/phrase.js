// Get random phrase
var get = function(callback) {
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status === 200) {

			// Get 1 random phrase
			var json = JSON.parse(request.responseText),
				random = Math.floor(Math.random() * json.length),
				phrase = '',
				maskedPhrase = '',
				visibleLetters = '';

			phrase = json[random].toUpperCase();
			maskedPhrase = mask(phrase, 85);
			visibleLetters = getVisibleLetters(maskedPhrase);

			if (typeof callback === 'function') {
				callback(phrase, maskedPhrase, visibleLetters);
			}
		}
	};

	request.open('GET', 'words.json', true);
	request.send();
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
var draw = function(phraseContainer, maskedPhrase) {
	phraseContainer.innerHTML = maskedPhrase;
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
	draw: draw
};