var Game = (function () {
	
	// Settings
	var _alphabet = 'abcdefghijklmnopqrstuwvxyz'.toUpperCase();

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
	
	// Draw alphabet on the chosen element
	var drawAlphabet = function(whereToDraw) {

		for (var i = 0, len = _alphabet.length; i < len; i++) {
			var singleLetterLi = document.createElement('li');

			singleLetterLi.innerHTML = _alphabet.charAt(i);
			whereToDraw.appendChild(singleLetterLi);
		}

	};

	// Check letter on click
	var checkLetter = function(letter, phrase, callback) {

		// Check if the clicked letter is one of these hidden in the phrase
		for (var i = 0, len = phrase.length; i < len; i++) {

			// Convert both characters to upper case, to compare it as case insensitive
			if (phrase.charAt(i).toUpperCase() === letter.toUpperCase()) {
				// Letter found
				callback();
				return;
			}
		}

		// Letter not found
		incorrectGuess();
	};

	// Reveal letter
	var revealLetter = function(letterToReveal, maskedPhrase, correctPhrase, phraseEl) {

		// Reveal the letter (can be multiple letters)
		for (var i = 0, len = maskedPhrase.length; i < len; i++) {

			if (correctPhrase.charAt(i).toUpperCase() === letterToReveal.toUpperCase()) {
				maskedPhrase = maskedPhrase.replaceAt(i, correctPhrase.charAt(i));
			}
		}

		phraseEl.innerHTML = maskedPhrase;

		// Check if user has won
		var isPhraseRevealed = (maskedPhrase.indexOf('_') === -1) ? true : false;

		if (isPhraseRevealed) {
			finishGame('won');
		}
	};

	// Mark letter as active and deactivate click listener
	var deactivateLetter = function(letter, singleLettersEl, listenerToRemove) {
		var index = _alphabet.indexOf(letter);

		singleLettersEl[index].classList.add('letter-active');
		singleLettersEl[index].removeEventListener('click', listenerToRemove);
	};

	return {
	  start: start,
	  maskPhrase: maskPhrase,
	  getVisibleLetters: getVisibleLetters,
	  drawAlphabet: drawAlphabet,
	  checkLetter: checkLetter,
	  revealLetter: revealLetter,
	  deactivateLetter: deactivateLetter
	};

})();