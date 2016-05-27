var Tools = require('./tools.js'),
	Phrase = require('./phrase.js'),
	Alphabet = require('./alphabet.js'),
	StatusBar = require('./status-bar.js'),
	Popup = require('./popup.js');

// Default settings
var s = {
	phraseEl: document.getElementById('phrase'),
	alphabetEl: document.getElementById('alphabet'),
	hangmanEl: document.getElementById('hangman'),
	totalLives: 5
};

// Local variables
var alphabet = 'abcdefghijklmnopqrstuwvxyz'.toUpperCase(),
	phrase = '',
	singleLettersEls = '',
	livesLeft = 0,
	isNewGame = false;

// Start = get random phrase
var start = function(config, callback) {

	// Get user's defined options
	Tools.updateSettings(s, config);

	// When settings are ready, set local variables
	livesLeft = s.totalLives;

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
	handleGameStart();

	if (typeof callback === 'function') {
		callback();
	}
};

var handleSingleClick = function(e) {
	var letter = e.target.textContent;
	checkLetter(letter);
};

var handleGameStart = function() {
	// When you have a phrase...
	Phrase.fetch(function(gotPhrase) {

		// Set local variables
		phrase = gotPhrase;

		Alphabet.init({
			alphabet: alphabet,
			alphabetContainer: s.alphabetEl,
			phrase: phrase,
			phraseContainer: s.phraseEl
		});

		// Draw the alphabet only once
		if (isNewGame === false) {
			Alphabet.draw(function() {
				singleLettersEls = Alphabet.getLettersEls();
			});
		}

		// Handle the click on each letter
		Alphabet.handleClicks(handleSingleClick);

		// Draw masked new phrase
		Phrase.draw(s.phraseEl);

		// Show every uncovered letter on the alphabet board
		Alphabet.uncoverPhraseParts();
	});
};

// Check if letter is correct - on click
var checkLetter = function(letter) {

	// Whether the user guessed or not, make sure the letter can't be clicked again
	Alphabet.revealLetter(letter);

	// Check if user has won
	var isPhraseRevealed = (Phrase.get('maskedPhrase').indexOf('_') === -1) ? true : false;

	if (isPhraseRevealed) {
		finishGame(true);
	}

	// Check if the clicked letter is one of these hidden in the phrase
	if (phrase.indexOf(letter.toUpperCase()) > -1) {
		
		// Letter found

	} else {

		// Letter not found
		incorrectGuess();
	}
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
		finishGame(false);
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
	for (var i = 0, len = singleLettersEls.length; i < len; i++) {
		singleLettersEls[i].classList.remove('letter-active');
	}

	// Mark it as new game
	isNewGame = true;

	handleGameStart();
};

var finishGame = function(status) {
	
	// Change status to bool
	status = !!status;

	// Show message
	switch (status) {
	case true:
		Popup.showWin();
		StatusBar.updatePoints(1);
		break;

	case false:
		Popup.showLose();
		StatusBar.updatePoints(-1);
		break;

	default:
		alert('Please refresh and try again!');
		break;
	}

	// Start a new game
	resetGame();
};

module.exports = {
	start: start
};