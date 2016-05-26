(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Helpers = require('./helpers.js'),
	StatusBar = require('./status-bar.js'),
	Popup = require('./popup.js');

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

module.exports = {
	start: start
};
},{"./helpers.js":2,"./popup.js":4,"./status-bar.js":5}],2:[function(require,module,exports){
module.exports = (function() {
	String.prototype.replaceAt = function(index, character) {
		return this.substr(0, index) + character + this.substr(index + character.length);
	};
})();
},{}],3:[function(require,module,exports){
var Game = require('./game.js');

// Run the game if all assets are loaded
var init = function() {

	var settings = {
		phraseEl: document.getElementById('phrase'),
		alphabetEl: document.getElementById('alphabet'),
		hangmanEl: document.getElementById('hangman'),
		totalLives: 5,

		statusBarEl: document.getElementById('game-info-bar'),
		pointsElName: '.game-info-points',
		livesElName: '.game-info-lives',
		resetPointsName: '.reset-points',

		popupOverlayEl: document.querySelector('.popup-overlay'),
		popupEl: document.querySelector('.popup'),
		gameWonText: "Congratulations, you've won!",
		gameLostText: "Oops... You've just lost a game",
		openedClass: 'opened'
	};

	Game.start(settings);

};
window.addEventListener('load', init, false);
},{"./game.js":1}],4:[function(require,module,exports){
// Default settings
var s = {
	popupOverlayEl: document.querySelector('.popup-overlay'),
	popupEl: document.querySelector('.popup'),
	gameWonText: "Congratulations, you've won!",
	gameLostText: "Oops... You've just lost a game",
	openedClass: 'opened'
};

// Local variables
var popupBtn = '';

var show = function() {
	s.popupOverlayEl.classList.add(s.openedClass);
	s.popupEl.classList.add(s.openedClass);
};

var close = function() {
	s.popupOverlayEl.classList.remove(s.openedClass);
	s.popupEl.classList.remove(s.openedClass);
};

// Open popup and set proper text
var showWin = function() {
	s.popupEl.querySelector('h3').textContent = s.gameWonText;
	show();
};

var showLose = function() {
	s.popupEl.querySelector('h3').textContent = s.gameLostText;
	show();
};

// Initialize popup
var init = function(config) {
	
	// Get user's defined options
	for (var prop in config) {
		if (config.hasOwnProperty(prop)) {
			s[prop] = config[prop];
		}
	}

	// When settings are ready, set local variables
	popupBtn = s.popupEl.querySelector('button');

	// Handle popup close events
	// On button click
	popupBtn.addEventListener('click', close, false);

	// On outside popup click
	s.popupOverlayEl.addEventListener('click', close, false);

	// But do nothing when clicked inside popup
	s.popupEl.addEventListener('click', function(e) {
		e.stopPropagation();
	}, false);
};

module.exports = {
	init: init,
	showWin: showWin,
	showLose: showLose,
	close: close
};
},{}],5:[function(require,module,exports){
// Default settings
var s = {
	lives: 5,
	statusBarEl: document.getElementById('game-info-bar'),
	pointsElName: '.game-info-points',
	livesElName: '.game-info-lives',
	resetPointsName: '.reset-points',
};

// Local variables
var	pointsEl = '',
	livesEl = '',
	resetPointsEl = '';

// Add x points to current score
// Minimum score is 0, we don't need negative values
var updatePoints = function(points) {
	var currentScore = getCurrentScore(),
		newScore = currentScore + parseInt(points, 10);

	if (newScore >= 0) {
		localStorage.setItem('hm_score', newScore);
		pointsEl.textContent = newScore;
	}
};

// Reset points to 0
var resetPoints = function() {
	localStorage.setItem('hm_score', 0);
};

var getCurrentScore = function() {
	var currentScore = parseInt(localStorage.getItem('hm_score'), 10);

	if (isNaN(currentScore) || currentScore === null) {
		resetPoints();
		return 0;
	} else {
		return currentScore;
	}
};

var drawLives = function(lives) {
	livesEl.textContent = lives;
};

var drawCurrentScore = function() {
	pointsEl.textContent = getCurrentScore();
};

var init = function(config) {
	
	// Get user's defined options
	for (var prop in config) {
		if (config.hasOwnProperty(prop)) {
			s[prop] = config[prop];
		}
	}

	// When settings are ready, set local variables
	pointsEl = s.statusBarEl.querySelector(s.pointsElName);
	livesEl = s.statusBarEl.querySelector(s.livesElName);
	resetPointsEl = s.statusBarEl.querySelector(s.resetPointsName);

	drawCurrentScore();
	drawLives(s.lives);

	resetPointsEl.addEventListener('click', function() {
		resetPoints();
		drawCurrentScore();
	}, false);
};

module.exports = {
	init: init,
	updatePoints: updatePoints,
	getCurrentScore: getCurrentScore,
	drawCurrentScore: drawCurrentScore,
	resetPoints: resetPoints,
	drawLives: drawLives
};
},{}]},{},[3]);
