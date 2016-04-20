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
			_livesLeft = _totalLives,
			_isNewGame = false;

	// Start = get random phrase
	var start = function(callback) {
		
		_handleGameStart();

		if (typeof callback === 'function') {
			callback();
		}
	};

	var _getPhrase = function(callback) {
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
			if (request.readyState === 4 && request.status === 200) {
				
				// Phrases loaded - get 1 random phrase
				var json = JSON.parse(request.responseText),
						random = Math.floor(Math.random() * json.length);

				_phrase = json[random].toUpperCase();
				_maskedPhrase = _maskPhrase(_phrase);
				_visibleLetters = _getVisibleLetters(_maskedPhrase);

				if (typeof callback === 'function') {
					callback();
				}
			}
		};

		request.open('GET', 'words.json', true);
		request.send();
	};

	var _handleGameStart = function() {
		
		// When you have a phrase...
		_getPhrase(function() {

			// Draw the alphabet only once
			if (_isNewGame === false) {
				// Draw alphabet
				_drawAlphabet();
			}

			// Handle the click on each letter
			_handleLetterClicks();

			// Draw masked new phrase
			_drawMaskedPhrase();
		
			// Show every uncovered letter on the alphabet board
			_uncoverPhraseParts();
		});

	};

	// Mask 85% of the given phrase
	var _maskPhrase = function(phrase) {

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
	var _getVisibleLetters = function(maskedPhrase) {
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
	
	// Draw masked phrase
	var _drawMaskedPhrase = function() {
		_phraseEl.innerHTML = _maskedPhrase;
	};
	
	// Draw alphabet on the chosen element
	var _drawAlphabet = function() {

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

	var _handleLetterClicks = function() {
		for (var i = 0, len = _singleLettersEl.length; i < len; i++) {
			_singleLettersEl[i].addEventListener('click', _handleSingleClick, false);
		}
	};

	// Uncover phrase parts on game start
	var _uncoverPhraseParts = function() {
		for (var i = 0, len = _visibleLetters.length; i < len; i++) {
			_revealLetter(_visibleLetters[i]);
		}
	};

	// Check if letter is correct - on click
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

	// Reveal the letter (can be multiple letters)
	var _revealLetter = function(letterToReveal) {

		for (var i = 0, len = _maskedPhrase.length; i < len; i++) {
			if (_phrase.charAt(i).toUpperCase() === letterToReveal.toUpperCase()) {
				_maskedPhrase = _maskedPhrase.replaceAt(i, _phrase.charAt(i));
			}
		}

		_phraseEl.innerHTML = _maskedPhrase;
		_deactivateLetter(letterToReveal);

		// Check if user has won
		var isPhraseRevealed = (_maskedPhrase.indexOf('_') === -1) ? true : false;

		if (isPhraseRevealed) {
			_finishGame('won');
		}
	};

	// Mark letter as active and deactivate click listener
	var _deactivateLetter = function(letter) {
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

	// Reset game so it can be played once again
	var _resetGame = function() {
		// Reset lives
		_livesLeft = _totalLives;

		// Restore hangman's original opacity
		var hangman = document.getElementById('hangman');
		hangman.style.opacity = 0;
		
		// Reset alphabet letters
		for (var i = 0, len = _singleLettersEl.length; i < len; i++) {
			_singleLettersEl[i].classList.remove('letter-active');
		}

		// Mark it as new game
		_isNewGame = true;
	};

	var _finishGame = function(status) {
		
		// Show message
		switch (status) {
		case 'won':
			alert('Congratulations, you won! Now you can play again.');
			break;

		case 'lost':
			alert('Ooops... You\'ve just lost a game. Please try again :)');
			break;

		default:
			alert('Please refresh and try again!');
			break;
		}

		// Start a new game
		_resetGame();
		_handleGameStart();
	};

	// Public returns
	return {
	  start: start
	};

})();