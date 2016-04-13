var Game = (function () {
	
	// Settings
	var _alphabet = 'abcdefghijklmnopqrstuwvxyz'.toUpperCase(),
			_phrase = '',
			_phraseEl = document.getElementById('phrase'),
			_maskedPhrase = '',
			_visibleLetters = '',
			_lettersEl = document.getElementById('alphabet'),
			_singleLettersEl = _lettersEl.getElementsByTagName('li'),
			_totalLives = 5,
			_livesLeft = _totalLives;

	// Start = get random phrase
	var start = function(callback) {
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
			if (request.readyState === 4 && request.status === 200) {
				
				// Phrases loaded - get 1 random and start the game
				var json = JSON.parse(request.responseText),
						random = Math.floor(Math.random() * json.length);

				_phrase = json[random].toUpperCase();
				_maskedPhrase = maskPhrase(_phrase);
				_visibleLetters = getVisibleLetters(_maskedPhrase);

				callback(_phrase);
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
	
	// Draw masked phrase
	var drawMaskedPhrase = function() {
		_phraseEl.innerHTML = _maskedPhrase;
	};
	
	// Draw alphabet on the chosen element
	var drawAlphabet = function() {

		for (var i = 0, len = _alphabet.length; i < len; i++) {
			var singleLetterLi = document.createElement('li');

			singleLetterLi.innerHTML = _alphabet.charAt(i);
			_lettersEl.appendChild(singleLetterLi);
		}

	};

	// Handle letter clicks
	var _handleSingleClick = function(event) {
		var letter = event.target.textContent;
		_checkLetter(letter);
	};

	var handleLetterClicks = function() {
		for (i = 0; i < _singleLettersEl.length; i++) {
			_singleLettersEl[i].addEventListener('click', _handleSingleClick, false);
		}
	};

	// Uncover phrase parts on game start
	var uncoverPhraseParts = function() {
		for (i = 0; i < _visibleLetters.length; i++) {
			_revealLetter(_visibleLetters[i], _phrase, _maskedPhrase);
		}
	};

	// Check letter on click
	var _checkLetter = function(letter) {

		// Check if the clicked letter is one of these hidden in the phrase
		for (var i = 0, len = _phrase.length; i < len; i++) {

			// Convert both characters to upper case, to compare it as case insensitive
			if (_phrase.charAt(i).toUpperCase() === letter.toUpperCase()) {
				// Letter found
				_revealLetter(letter);
				return;
			}
		}

		// Letter not found
		_incorrectGuess();
	};

	// Reveal letter
	var _revealLetter = function(letterToReveal) {
		// Reveal the letter (can be multiple letters)
		for (var i = 0, len = _maskedPhrase.length; i < len; i++) {

			if (_phrase.charAt(i).toUpperCase() === letterToReveal.toUpperCase()) {
				_maskedPhrase = _maskedPhrase.replaceAt(i, _phrase.charAt(i));
			}
		}

		_phraseEl.innerHTML = _maskedPhrase;
		deactivateLetter(letterToReveal);

		// Check if user has won
		var isPhraseRevealed = (_maskedPhrase.indexOf('_') === -1) ? true : false;

		if (isPhraseRevealed) {
			_finishGame('won');
		}
	};

	// Mark letter as active and deactivate click listener
	var deactivateLetter = function(letter) {
		var index = _alphabet.indexOf(letter);

		_singleLettersEl[index].classList.add('letter-active');
		_singleLettersEl[index].removeEventListener('click', _handleSingleClick);
	};

	var _incorrectGuess = function() {
		// Reduce lives and start showing the hangman
		_livesLeft--;

		var hangman = document.getElementById('hangman'),
		opacityToAdd = 1 / _totalLives,
		hangmanOpacity = hangman.style.opacity || 0;

		hangman.style.opacity = parseFloat(hangmanOpacity) + parseFloat(opacityToAdd);

		// If no more lives left -> game over
		if (_livesLeft === 0) {
			_finishGame('lost');
		}
	};

	var _finishGame = function(status) {
		// Disable click on letters and show message
		for (var i = 0; i < _singleLettersEl.length; i++) {
			_singleLettersEl[i].removeEventListener('click', _handleSingleClick);
		}

		switch (status) {
		case 'won':
			alert('Congratulations, you won! Now you can refresh and try again.');
			break;

		case 'lost':
			alert('Ooops... You\'ve just lost a game. Please refresh and try again!');
			break;

		default:
			alert('Please refresh and try again!');
			break;
		}
	};

	// Public returns
	return {
	  start: start,
	  drawMaskedPhrase: drawMaskedPhrase,
	  drawAlphabet: drawAlphabet,
	  handleLetterClicks: handleLetterClicks,
	  uncoverPhraseParts: uncoverPhraseParts
	};

})();