var Game = (function () {

	// Default settings
	var s = {
		phraseEl: document.getElementById('phrase'),
		alphabetEl: document.getElementById('alphabet'),
		hangmanEl: document.getElementById('hangman'),
		totalLives: 5,
		singleLettersEl: '',
	};

	// Local variables
	var alphabet = 'abcdefghijklmnopqrstuwvxyz'.toUpperCase(),
		phrase = '',
		maskedPhrase = '',
		visibleLetters = '',
		livesLeft = 0,
		isNewGame = false;

	// Start = get random phrase
	var start = function(config, callback) {

		// Get user's defined options
		for (var prop in config) {
			if (config.hasOwnProperty(prop)) {
				s[prop] = config[prop];
			}
		}

		// When settings are ready, set local variables
		livesLeft = s.totalLives;

		handleGameStart();

		if (typeof callback === 'function') {
			callback();
		}
	};

	var getPhrase = function(callback) {
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
			if (request.readyState === 4 && request.status === 200) {
				
				// Phrases loaded - get 1 random phrase
				var json = JSON.parse(request.responseText),
					random = Math.floor(Math.random() * json.length);

				phrase = json[random].toUpperCase();
				maskedPhrase = maskPhrase(phrase);
				visibleLetters = getVisibleLetters(maskedPhrase);

				if (typeof callback === 'function') {
					callback();
				}
			}
		};

		request.open('GET', 'words.json', true);
		request.send();
	};

	var handleGameStart = function() {
		
		// Initialize status bar
		StatusBar.init({
			lives: s.totalLives,
			statusBarEl: s.statusBarEl,
			pointsElName: s.pointsElName,
			livesElName: s.livesElName,
			resetPointsName: s.resetPointsName
		});

		// Initialize popup
		Popup.init({
			popupOverlayEl: s.popupOverlayEl,
			popupEl: s.popupEl,
			gameWonText: s.gameWonText,
			gameLostText: s.gameLostText,
			openedClass: s.openedClass
		});

		// When you have a phrase...
		getPhrase(function() {

			// Draw the alphabet only once
			if (isNewGame === false) {
				// Draw alphabet
				drawAlphabet();
			}

			// Handle the click on each letter
			handleLetterClicks();

			// Draw masked new phrase
			drawMaskedPhrase();
		
			// Show every uncovered letter on the alphabet board
			uncoverPhraseParts();
		});

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
	var drawMaskedPhrase = function() {
		s.phraseEl.innerHTML = maskedPhrase;
	};
	
	// Draw alphabet on the chosen element
	var drawAlphabet = function() {

		for (var i = 0, len = alphabet.length; i < len; i++) {
			var singleLetterLi = document.createElement('li');

			singleLetterLi.innerHTML = alphabet.charAt(i);
			s.alphabetEl.appendChild(singleLetterLi);
		}

		s.singleLettersEl = s.alphabetEl.getElementsByTagName('li');

	};

	// Handle letter clicks
	var handleSingleClick = function(e) {
		var letter = e.target.textContent;
		checkLetter(letter);
	};

	var handleLetterClicks = function() {
		for (var i = 0, len = s.singleLettersEl.length; i < len; i++) {
			s.singleLettersEl[i].addEventListener('click', handleSingleClick, false);
		}
	};

	// Uncover phrase parts on game start
	var uncoverPhraseParts = function() {
		for (var i = 0, len = visibleLetters.length; i < len; i++) {
			revealLetter(visibleLetters[i]);
		}
	};

	// Check if letter is correct - on click
	var checkLetter = function(letter) {

		// Whether the user guessed or not, make sure the letter can't be clicked again
		revealLetter(letter);

		// Check if the clicked letter is one of these hidden in the phrase
		if (phrase.indexOf(letter.toUpperCase()) > -1) {
			// Letter found
			return;
		}

		// Letter not found
		incorrectGuess();
	};

	// Reveal the letter (can be multiple letters)
	var revealLetter = function(letterToReveal) {

		for (var i = 0, len = maskedPhrase.length; i < len; i++) {
			if (phrase.charAt(i).toUpperCase() === letterToReveal.toUpperCase()) {
				maskedPhrase = maskedPhrase.replaceAt(i, phrase.charAt(i));
			}
		}

		s.phraseEl.innerHTML = maskedPhrase;
		deactivateLetter(letterToReveal);

		// Check if user has won
		var isPhraseRevealed = (maskedPhrase.indexOf('_') === -1) ? true : false;

		if (isPhraseRevealed) {
			finishGame('won');
		}
	};

	// Mark letter as active and deactivate click listener
	var deactivateLetter = function(letter) {
		var index = alphabet.indexOf(letter);

		s.singleLettersEl[index].classList.add('letter-active');
		s.singleLettersEl[index].removeEventListener('click', handleSingleClick);
	};

	var incorrectGuess = function() {
		// Reduce lives and start showing the hangman
		livesLeft--;
		StatusBar.drawLives(livesLeft);

		var opacityToAdd = 1 / s.totalLives,
			hangmanOpacity = s.hangmanEl.style.opacity || 0;

		s.hangmanEl.style.opacity = parseFloat(hangmanOpacity) + parseFloat(opacityToAdd);

		// If no more lives left -> game over
		if (livesLeft === 0) {
			finishGame('lost');
		}
	};

	// Reset game so it can be played once again
	var resetGame = function() {
		// Reset lives
		livesLeft = s.totalLives;
		StatusBar.drawLives(livesLeft);

		// Restore hangman's original opacity
		s.hangmanEl.style.opacity = 0;
		
		// Reset alphabet letters
		for (var i = 0, len = s.singleLettersEl.length; i < len; i++) {
			s.singleLettersEl[i].classList.remove('letter-active');
		}

		// Mark it as new game
		isNewGame = true;
	};

	var finishGame = function(status) {
		
		// Show message
		switch (status) {
		case 'won':
			Popup.showWin();
			StatusBar.updatePoints(1);
			break;

		case 'lost':
			Popup.showLose();
			StatusBar.updatePoints(-1);
			break;

		default:
			alert('Please refresh and try again!');
			break;
		}

		// Start a new game
		resetGame();
		handleGameStart();
	};

	// Public returns
	return {
		start: start
	};

})();