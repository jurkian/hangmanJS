var Game = (function () {
	
	// Start = get random phrase
	var start = function(callback) {
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
			if (request.readyState === 4 && request.status === 200) {
				
				// Phrases loaded - get 1 random and start the game
				var json = JSON.parse(request.responseText),
						random = Math.floor(Math.random() * json.length),
						phrase = json[random].toUpperCase();

				callback(phrase);
			}
		};

		request.open('GET', 'words.json', true);
		request.send();
	};

	// Mask 85% of the given phrase
	var maskPhrase = function(phrase) {

		var howManyLettersToMask = Math.floor(phrase.length * 0.85),
				maskedPhrase = phrase;

		while (howManyLettersToMask > 0) {
			var random = Math.floor(Math.random() * phrase.length),
					letter = phrase.charAt(random);

			// Mask a letter if it's not: '_' and ' '
			if (letter !== '_' && letter !== ' ') {
				maskedPhrase = maskedPhrase.replaceAt(random, '_');
				howManyLettersToMask--;
			} else {
				continue;
			}
		}

		return maskedPhrase;
	};

	// Get visible letters of a masked phrase
	var getVisibleLetters = function(maskedPhrase) {
		var phrase = maskedPhrase.split(''),
				visibleLetters = [];

		for (var i = 0; i < phrase.length; i++) {
			
			// If you find '_' or ' ' or a duplicate letter - continue
			if (phrase[i] === '_' || phrase[i] === ' ' || visibleLetters.indexOf(phrase[i]) > -1) {
				continue;
			} else {
				visibleLetters.push(phrase[i]);
			}

		}

		return visibleLetters;
	};
	
	return {
	  start: start,
	  maskPhrase: maskPhrase,
	  getVisibleLetters: getVisibleLetters
	};

})();