(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Tools = require('./tools.js'),
	Phrase = require('./phrase.js');

// Settings
var s = {
	alphabet: '',
	alphabetContainer: {},
	phrase: '',
	phraseContainer: {}
};

// Local variables
var singleLettersEls = {},
	handleClicksFn = {};

// Get user's defined options
var init = function(config) {
	Tools.updateSettings(s, config);
};

// Get single letters as DOM elements
var getLettersEls = function() {
	return singleLettersEls;
};

// Draw alphabet
var draw = function(callback) {

	for (var i = 0, len = s.alphabet.length; i < len; i++) {
		var singleLetterLi = document.createElement('li');

		singleLetterLi.innerHTML = s.alphabet.charAt(i);
		s.alphabetContainer.appendChild(singleLetterLi);
	}

	singleLettersEls = s.alphabetContainer.getElementsByTagName('li');

	if (typeof callback === 'function') {
		callback();
	}

};

// Handle letter clicks
var handleClicks = function(handleSingleClick) {
	if (typeof handleSingleClick === 'function') {
		handleClicksFn = handleSingleClick;

		for (var i = 0, len = singleLettersEls.length; i < len; i++) {
			singleLettersEls[i].addEventListener('click', handleClicksFn, false);
		}
	}
};

// Uncover phrase parts
var uncoverPhraseParts = function(visibleLetters, maskedPhrase, callback) {

	var updateMaskedPhrase = function(newMaskedPhrase) {
		maskedPhrase = newMaskedPhrase;
		callback(newMaskedPhrase);
	};

	for (var i = 0, len = visibleLetters.length; i < len; i++) {
		revealLetter(visibleLetters[i], maskedPhrase, updateMaskedPhrase);
	}
};

// Mark letter as active and deactivate click listener
var deactivateLetter = function(letter) {
	var index = s.alphabet.indexOf(letter);

	singleLettersEls[index].classList.add('letter-active');
	singleLettersEls[index].removeEventListener('click', handleClicksFn);
};

// Reveal the letter (can be multiple letters)
var revealLetter = function(letterToReveal, maskedPhrase, callback) {

	var indexes = Tools.getAllIndexes(s.phrase, letterToReveal);

	letterToReveal = letterToReveal.toUpperCase();
	maskedPhrase = maskedPhrase.toUpperCase();

	for (var j = 0, len = indexes.length; j < len; j++) {
		maskedPhrase = maskedPhrase.replaceAt(indexes[j], letterToReveal);
	}

	Phrase.draw(s.phraseContainer, maskedPhrase);

	deactivateLetter(letterToReveal);

	if (typeof callback === 'function') {
		callback(maskedPhrase);
	}
};

module.exports = {
	init: init,
	draw: draw,
	handleClicks: handleClicks,
	getLettersEls: getLettersEls,
	uncoverPhraseParts: uncoverPhraseParts,
	revealLetter: revealLetter
};
},{"./phrase.js":4,"./tools.js":7}],2:[function(require,module,exports){
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
	maskedPhrase = '',
	visibleLetters = '',
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
	Phrase.get(function(gotPhrase, gotMaskedPhrase, gotVisibleLetters) {

		// Set local variables
		phrase = gotPhrase;
		maskedPhrase = gotMaskedPhrase;
		visibleLetters = gotVisibleLetters;

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
		Phrase.draw(s.phraseEl, maskedPhrase);

		// Show every uncovered letter on the alphabet board
		Alphabet.uncoverPhraseParts(visibleLetters, maskedPhrase, function(newMaskedPhrase) {
			maskedPhrase = newMaskedPhrase;
		});
	});
};

// Check if letter is correct - on click
var checkLetter = function(letter) {

	// Whether the user guessed or not, make sure the letter can't be clicked again
	Alphabet.revealLetter(letter, maskedPhrase, function(newMaskedPhrase) {
		maskedPhrase = newMaskedPhrase;
	});

	// Check if user has won
	var isPhraseRevealed = (maskedPhrase.indexOf('_') === -1) ? true : false;

	if (isPhraseRevealed) {
		finishGame('won');
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
	for (var i = 0, len = singleLettersEls.length; i < len; i++) {
		singleLettersEls[i].classList.remove('letter-active');
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
},{"./alphabet.js":1,"./phrase.js":4,"./popup.js":5,"./status-bar.js":6,"./tools.js":7}],3:[function(require,module,exports){
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
},{"./game.js":2}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
var Tools = require('./tools.js');

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
	Tools.updateSettings(s, config);

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
	showLose: showLose
};
},{"./tools.js":7}],6:[function(require,module,exports){
var Tools = require('./tools.js');

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
	Tools.updateSettings(s, config);

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
	drawLives: drawLives
};
},{"./tools.js":7}],7:[function(require,module,exports){
// Automatically add replaceAt method to strings
String.prototype.replaceAt = function(index, character) {
	return this.substr(0, index) + character + this.substr(index + character.length);
};

// Overwrite default settings with user's
// Even if the single setting doesn't exist in defaults
// create a new one basing on newSettings
var updateSettings = function(defaultSettings, newSettings) {
	for (var prop in newSettings) {
		if (newSettings.hasOwnProperty(prop)) {
			defaultSettings[prop] = newSettings[prop];
		}
	}
};

// Get all indexes of value in array
var getAllIndexes = function(arr, val) {
	var indexes = [], 
		i = -1;

	while ((i = arr.indexOf(val, i + 1)) != -1) {
		indexes.push(i);
	}

	return indexes;
};

module.exports = {
	updateSettings: updateSettings,
	getAllIndexes: getAllIndexes
};

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9hbHBoYWJldC5qcyIsImFwcC9zY3JpcHRzL2dhbWUuanMiLCJhcHAvc2NyaXB0cy9tYWluLmpzIiwiYXBwL3NjcmlwdHMvcGhyYXNlLmpzIiwiYXBwL3NjcmlwdHMvcG9wdXAuanMiLCJhcHAvc2NyaXB0cy9zdGF0dXMtYmFyLmpzIiwiYXBwL3NjcmlwdHMvdG9vbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBUb29scyA9IHJlcXVpcmUoJy4vdG9vbHMuanMnKSxcclxuXHRQaHJhc2UgPSByZXF1aXJlKCcuL3BocmFzZS5qcycpO1xyXG5cclxuLy8gU2V0dGluZ3NcclxudmFyIHMgPSB7XHJcblx0YWxwaGFiZXQ6ICcnLFxyXG5cdGFscGhhYmV0Q29udGFpbmVyOiB7fSxcclxuXHRwaHJhc2U6ICcnLFxyXG5cdHBocmFzZUNvbnRhaW5lcjoge31cclxufTtcclxuXHJcbi8vIExvY2FsIHZhcmlhYmxlc1xyXG52YXIgc2luZ2xlTGV0dGVyc0VscyA9IHt9LFxyXG5cdGhhbmRsZUNsaWNrc0ZuID0ge307XHJcblxyXG4vLyBHZXQgdXNlcidzIGRlZmluZWQgb3B0aW9uc1xyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG5cdFRvb2xzLnVwZGF0ZVNldHRpbmdzKHMsIGNvbmZpZyk7XHJcbn07XHJcblxyXG4vLyBHZXQgc2luZ2xlIGxldHRlcnMgYXMgRE9NIGVsZW1lbnRzXHJcbnZhciBnZXRMZXR0ZXJzRWxzID0gZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHNpbmdsZUxldHRlcnNFbHM7XHJcbn07XHJcblxyXG4vLyBEcmF3IGFscGhhYmV0XHJcbnZhciBkcmF3ID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHJcblx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHMuYWxwaGFiZXQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdHZhciBzaW5nbGVMZXR0ZXJMaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XHJcblxyXG5cdFx0c2luZ2xlTGV0dGVyTGkuaW5uZXJIVE1MID0gcy5hbHBoYWJldC5jaGFyQXQoaSk7XHJcblx0XHRzLmFscGhhYmV0Q29udGFpbmVyLmFwcGVuZENoaWxkKHNpbmdsZUxldHRlckxpKTtcclxuXHR9XHJcblxyXG5cdHNpbmdsZUxldHRlcnNFbHMgPSBzLmFscGhhYmV0Q29udGFpbmVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaScpO1xyXG5cclxuXHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRjYWxsYmFjaygpO1xyXG5cdH1cclxuXHJcbn07XHJcblxyXG4vLyBIYW5kbGUgbGV0dGVyIGNsaWNrc1xyXG52YXIgaGFuZGxlQ2xpY2tzID0gZnVuY3Rpb24oaGFuZGxlU2luZ2xlQ2xpY2spIHtcclxuXHRpZiAodHlwZW9mIGhhbmRsZVNpbmdsZUNsaWNrID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRoYW5kbGVDbGlja3NGbiA9IGhhbmRsZVNpbmdsZUNsaWNrO1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSBzaW5nbGVMZXR0ZXJzRWxzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHRcdHNpbmdsZUxldHRlcnNFbHNbaV0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDbGlja3NGbiwgZmFsc2UpO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbi8vIFVuY292ZXIgcGhyYXNlIHBhcnRzXHJcbnZhciB1bmNvdmVyUGhyYXNlUGFydHMgPSBmdW5jdGlvbih2aXNpYmxlTGV0dGVycywgbWFza2VkUGhyYXNlLCBjYWxsYmFjaykge1xyXG5cclxuXHR2YXIgdXBkYXRlTWFza2VkUGhyYXNlID0gZnVuY3Rpb24obmV3TWFza2VkUGhyYXNlKSB7XHJcblx0XHRtYXNrZWRQaHJhc2UgPSBuZXdNYXNrZWRQaHJhc2U7XHJcblx0XHRjYWxsYmFjayhuZXdNYXNrZWRQaHJhc2UpO1xyXG5cdH07XHJcblxyXG5cdGZvciAodmFyIGkgPSAwLCBsZW4gPSB2aXNpYmxlTGV0dGVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cdFx0cmV2ZWFsTGV0dGVyKHZpc2libGVMZXR0ZXJzW2ldLCBtYXNrZWRQaHJhc2UsIHVwZGF0ZU1hc2tlZFBocmFzZSk7XHJcblx0fVxyXG59O1xyXG5cclxuLy8gTWFyayBsZXR0ZXIgYXMgYWN0aXZlIGFuZCBkZWFjdGl2YXRlIGNsaWNrIGxpc3RlbmVyXHJcbnZhciBkZWFjdGl2YXRlTGV0dGVyID0gZnVuY3Rpb24obGV0dGVyKSB7XHJcblx0dmFyIGluZGV4ID0gcy5hbHBoYWJldC5pbmRleE9mKGxldHRlcik7XHJcblxyXG5cdHNpbmdsZUxldHRlcnNFbHNbaW5kZXhdLmNsYXNzTGlzdC5hZGQoJ2xldHRlci1hY3RpdmUnKTtcclxuXHRzaW5nbGVMZXR0ZXJzRWxzW2luZGV4XS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNsaWNrc0ZuKTtcclxufTtcclxuXHJcbi8vIFJldmVhbCB0aGUgbGV0dGVyIChjYW4gYmUgbXVsdGlwbGUgbGV0dGVycylcclxudmFyIHJldmVhbExldHRlciA9IGZ1bmN0aW9uKGxldHRlclRvUmV2ZWFsLCBtYXNrZWRQaHJhc2UsIGNhbGxiYWNrKSB7XHJcblxyXG5cdHZhciBpbmRleGVzID0gVG9vbHMuZ2V0QWxsSW5kZXhlcyhzLnBocmFzZSwgbGV0dGVyVG9SZXZlYWwpO1xyXG5cclxuXHRsZXR0ZXJUb1JldmVhbCA9IGxldHRlclRvUmV2ZWFsLnRvVXBwZXJDYXNlKCk7XHJcblx0bWFza2VkUGhyYXNlID0gbWFza2VkUGhyYXNlLnRvVXBwZXJDYXNlKCk7XHJcblxyXG5cdGZvciAodmFyIGogPSAwLCBsZW4gPSBpbmRleGVzLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XHJcblx0XHRtYXNrZWRQaHJhc2UgPSBtYXNrZWRQaHJhc2UucmVwbGFjZUF0KGluZGV4ZXNbal0sIGxldHRlclRvUmV2ZWFsKTtcclxuXHR9XHJcblxyXG5cdFBocmFzZS5kcmF3KHMucGhyYXNlQ29udGFpbmVyLCBtYXNrZWRQaHJhc2UpO1xyXG5cclxuXHRkZWFjdGl2YXRlTGV0dGVyKGxldHRlclRvUmV2ZWFsKTtcclxuXHJcblx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0Y2FsbGJhY2sobWFza2VkUGhyYXNlKTtcclxuXHR9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRpbml0OiBpbml0LFxyXG5cdGRyYXc6IGRyYXcsXHJcblx0aGFuZGxlQ2xpY2tzOiBoYW5kbGVDbGlja3MsXHJcblx0Z2V0TGV0dGVyc0VsczogZ2V0TGV0dGVyc0VscyxcclxuXHR1bmNvdmVyUGhyYXNlUGFydHM6IHVuY292ZXJQaHJhc2VQYXJ0cyxcclxuXHRyZXZlYWxMZXR0ZXI6IHJldmVhbExldHRlclxyXG59OyIsInZhciBUb29scyA9IHJlcXVpcmUoJy4vdG9vbHMuanMnKSxcclxuXHRQaHJhc2UgPSByZXF1aXJlKCcuL3BocmFzZS5qcycpLFxyXG5cdEFscGhhYmV0ID0gcmVxdWlyZSgnLi9hbHBoYWJldC5qcycpLFxyXG5cdFN0YXR1c0JhciA9IHJlcXVpcmUoJy4vc3RhdHVzLWJhci5qcycpLFxyXG5cdFBvcHVwID0gcmVxdWlyZSgnLi9wb3B1cC5qcycpO1xyXG5cclxuLy8gRGVmYXVsdCBzZXR0aW5nc1xyXG52YXIgcyA9IHtcclxuXHRwaHJhc2VFbDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BocmFzZScpLFxyXG5cdGFscGhhYmV0RWw6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbHBoYWJldCcpLFxyXG5cdGhhbmdtYW5FbDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hhbmdtYW4nKSxcclxuXHR0b3RhbExpdmVzOiA1XHJcbn07XHJcblxyXG4vLyBMb2NhbCB2YXJpYWJsZXNcclxudmFyIGFscGhhYmV0ID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXd2eHl6Jy50b1VwcGVyQ2FzZSgpLFxyXG5cdHBocmFzZSA9ICcnLFxyXG5cdG1hc2tlZFBocmFzZSA9ICcnLFxyXG5cdHZpc2libGVMZXR0ZXJzID0gJycsXHJcblx0c2luZ2xlTGV0dGVyc0VscyA9ICcnLFxyXG5cdGxpdmVzTGVmdCA9IDAsXHJcblx0aXNOZXdHYW1lID0gZmFsc2U7XHJcblxyXG4vLyBTdGFydCA9IGdldCByYW5kb20gcGhyYXNlXHJcbnZhciBzdGFydCA9IGZ1bmN0aW9uKGNvbmZpZywgY2FsbGJhY2spIHtcclxuXHJcblx0Ly8gR2V0IHVzZXIncyBkZWZpbmVkIG9wdGlvbnNcclxuXHRUb29scy51cGRhdGVTZXR0aW5ncyhzLCBjb25maWcpO1xyXG5cclxuXHQvLyBXaGVuIHNldHRpbmdzIGFyZSByZWFkeSwgc2V0IGxvY2FsIHZhcmlhYmxlc1xyXG5cdGxpdmVzTGVmdCA9IHMudG90YWxMaXZlcztcclxuXHJcblx0Ly8gSW5pdGlhbGl6ZSBzdGF0dXMgYmFyXHJcblx0U3RhdHVzQmFyLmluaXQoe1xyXG5cdFx0bGl2ZXM6IHMudG90YWxMaXZlcyxcclxuXHRcdHN0YXR1c0JhckVsOiBzLnN0YXR1c0JhckVsLFxyXG5cdFx0cG9pbnRzRWxOYW1lOiBzLnBvaW50c0VsTmFtZSxcclxuXHRcdGxpdmVzRWxOYW1lOiBzLmxpdmVzRWxOYW1lLFxyXG5cdFx0cmVzZXRQb2ludHNOYW1lOiBzLnJlc2V0UG9pbnRzTmFtZVxyXG5cdH0pO1xyXG5cclxuXHQvLyBJbml0aWFsaXplIHBvcHVwXHJcblx0UG9wdXAuaW5pdCh7XHJcblx0XHRwb3B1cE92ZXJsYXlFbDogcy5wb3B1cE92ZXJsYXlFbCxcclxuXHRcdHBvcHVwRWw6IHMucG9wdXBFbCxcclxuXHRcdGdhbWVXb25UZXh0OiBzLmdhbWVXb25UZXh0LFxyXG5cdFx0Z2FtZUxvc3RUZXh0OiBzLmdhbWVMb3N0VGV4dCxcclxuXHRcdG9wZW5lZENsYXNzOiBzLm9wZW5lZENsYXNzXHJcblx0fSk7XHJcblxyXG5cdC8vIFdoZW4geW91IGhhdmUgYSBwaHJhc2UuLi5cclxuXHRoYW5kbGVHYW1lU3RhcnQoKTtcclxuXHJcblx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0Y2FsbGJhY2soKTtcclxuXHR9XHJcbn07XHJcblxyXG52YXIgaGFuZGxlU2luZ2xlQ2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcblx0dmFyIGxldHRlciA9IGUudGFyZ2V0LnRleHRDb250ZW50O1xyXG5cdGNoZWNrTGV0dGVyKGxldHRlcik7XHJcbn07XHJcblxyXG52YXIgaGFuZGxlR2FtZVN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcblx0Ly8gV2hlbiB5b3UgaGF2ZSBhIHBocmFzZS4uLlxyXG5cdFBocmFzZS5nZXQoZnVuY3Rpb24oZ290UGhyYXNlLCBnb3RNYXNrZWRQaHJhc2UsIGdvdFZpc2libGVMZXR0ZXJzKSB7XHJcblxyXG5cdFx0Ly8gU2V0IGxvY2FsIHZhcmlhYmxlc1xyXG5cdFx0cGhyYXNlID0gZ290UGhyYXNlO1xyXG5cdFx0bWFza2VkUGhyYXNlID0gZ290TWFza2VkUGhyYXNlO1xyXG5cdFx0dmlzaWJsZUxldHRlcnMgPSBnb3RWaXNpYmxlTGV0dGVycztcclxuXHJcblx0XHRBbHBoYWJldC5pbml0KHtcclxuXHRcdFx0YWxwaGFiZXQ6IGFscGhhYmV0LFxyXG5cdFx0XHRhbHBoYWJldENvbnRhaW5lcjogcy5hbHBoYWJldEVsLFxyXG5cdFx0XHRwaHJhc2U6IHBocmFzZSxcclxuXHRcdFx0cGhyYXNlQ29udGFpbmVyOiBzLnBocmFzZUVsXHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBEcmF3IHRoZSBhbHBoYWJldCBvbmx5IG9uY2VcclxuXHRcdGlmIChpc05ld0dhbWUgPT09IGZhbHNlKSB7XHJcblx0XHRcdEFscGhhYmV0LmRyYXcoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c2luZ2xlTGV0dGVyc0VscyA9IEFscGhhYmV0LmdldExldHRlcnNFbHMoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gSGFuZGxlIHRoZSBjbGljayBvbiBlYWNoIGxldHRlclxyXG5cdFx0QWxwaGFiZXQuaGFuZGxlQ2xpY2tzKGhhbmRsZVNpbmdsZUNsaWNrKTtcclxuXHJcblx0XHQvLyBEcmF3IG1hc2tlZCBuZXcgcGhyYXNlXHJcblx0XHRQaHJhc2UuZHJhdyhzLnBocmFzZUVsLCBtYXNrZWRQaHJhc2UpO1xyXG5cclxuXHRcdC8vIFNob3cgZXZlcnkgdW5jb3ZlcmVkIGxldHRlciBvbiB0aGUgYWxwaGFiZXQgYm9hcmRcclxuXHRcdEFscGhhYmV0LnVuY292ZXJQaHJhc2VQYXJ0cyh2aXNpYmxlTGV0dGVycywgbWFza2VkUGhyYXNlLCBmdW5jdGlvbihuZXdNYXNrZWRQaHJhc2UpIHtcclxuXHRcdFx0bWFza2VkUGhyYXNlID0gbmV3TWFza2VkUGhyYXNlO1xyXG5cdFx0fSk7XHJcblx0fSk7XHJcbn07XHJcblxyXG4vLyBDaGVjayBpZiBsZXR0ZXIgaXMgY29ycmVjdCAtIG9uIGNsaWNrXHJcbnZhciBjaGVja0xldHRlciA9IGZ1bmN0aW9uKGxldHRlcikge1xyXG5cclxuXHQvLyBXaGV0aGVyIHRoZSB1c2VyIGd1ZXNzZWQgb3Igbm90LCBtYWtlIHN1cmUgdGhlIGxldHRlciBjYW4ndCBiZSBjbGlja2VkIGFnYWluXHJcblx0QWxwaGFiZXQucmV2ZWFsTGV0dGVyKGxldHRlciwgbWFza2VkUGhyYXNlLCBmdW5jdGlvbihuZXdNYXNrZWRQaHJhc2UpIHtcclxuXHRcdG1hc2tlZFBocmFzZSA9IG5ld01hc2tlZFBocmFzZTtcclxuXHR9KTtcclxuXHJcblx0Ly8gQ2hlY2sgaWYgdXNlciBoYXMgd29uXHJcblx0dmFyIGlzUGhyYXNlUmV2ZWFsZWQgPSAobWFza2VkUGhyYXNlLmluZGV4T2YoJ18nKSA9PT0gLTEpID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuXHRpZiAoaXNQaHJhc2VSZXZlYWxlZCkge1xyXG5cdFx0ZmluaXNoR2FtZSgnd29uJyk7XHJcblx0fVxyXG5cclxuXHQvLyBDaGVjayBpZiB0aGUgY2xpY2tlZCBsZXR0ZXIgaXMgb25lIG9mIHRoZXNlIGhpZGRlbiBpbiB0aGUgcGhyYXNlXHJcblx0aWYgKHBocmFzZS5pbmRleE9mKGxldHRlci50b1VwcGVyQ2FzZSgpKSA+IC0xKSB7XHJcblx0XHRcclxuXHRcdC8vIExldHRlciBmb3VuZFxyXG5cdFx0XHJcblx0fSBlbHNlIHtcclxuXHJcblx0XHQvLyBMZXR0ZXIgbm90IGZvdW5kXHJcblx0XHRpbmNvcnJlY3RHdWVzcygpO1xyXG5cdH1cclxufTtcclxuXHJcbnZhciBpbmNvcnJlY3RHdWVzcyA9IGZ1bmN0aW9uKCkge1xyXG5cdC8vIFJlZHVjZSBsaXZlcyBhbmQgc3RhcnQgc2hvd2luZyB0aGUgaGFuZ21hblxyXG5cdGxpdmVzTGVmdC0tO1xyXG5cdFN0YXR1c0Jhci5kcmF3TGl2ZXMobGl2ZXNMZWZ0KTtcclxuXHJcblx0dmFyIG9wYWNpdHlUb0FkZCA9IDEgLyBzLnRvdGFsTGl2ZXMsXHJcblx0XHRoYW5nbWFuT3BhY2l0eSA9IHMuaGFuZ21hbkVsLnN0eWxlLm9wYWNpdHkgfHwgMDtcclxuXHJcblx0cy5oYW5nbWFuRWwuc3R5bGUub3BhY2l0eSA9IHBhcnNlRmxvYXQoaGFuZ21hbk9wYWNpdHkpICsgcGFyc2VGbG9hdChvcGFjaXR5VG9BZGQpO1xyXG5cclxuXHQvLyBJZiBubyBtb3JlIGxpdmVzIGxlZnQgLT4gZ2FtZSBvdmVyXHJcblx0aWYgKGxpdmVzTGVmdCA9PT0gMCkge1xyXG5cdFx0ZmluaXNoR2FtZSgnbG9zdCcpO1xyXG5cdH1cclxufTtcclxuXHJcbi8vIFJlc2V0IGdhbWUgc28gaXQgY2FuIGJlIHBsYXllZCBvbmNlIGFnYWluXHJcbnZhciByZXNldEdhbWUgPSBmdW5jdGlvbigpIHtcclxuXHQvLyBSZXNldCBsaXZlc1xyXG5cdGxpdmVzTGVmdCA9IHMudG90YWxMaXZlcztcclxuXHRTdGF0dXNCYXIuZHJhd0xpdmVzKGxpdmVzTGVmdCk7XHJcblxyXG5cdC8vIFJlc3RvcmUgaGFuZ21hbidzIG9yaWdpbmFsIG9wYWNpdHlcclxuXHRzLmhhbmdtYW5FbC5zdHlsZS5vcGFjaXR5ID0gMDtcclxuXHRcclxuXHQvLyBSZXNldCBhbHBoYWJldCBsZXR0ZXJzXHJcblx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHNpbmdsZUxldHRlcnNFbHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuXHRcdHNpbmdsZUxldHRlcnNFbHNbaV0uY2xhc3NMaXN0LnJlbW92ZSgnbGV0dGVyLWFjdGl2ZScpO1xyXG5cdH1cclxuXHJcblx0Ly8gTWFyayBpdCBhcyBuZXcgZ2FtZVxyXG5cdGlzTmV3R2FtZSA9IHRydWU7XHJcbn07XHJcblxyXG52YXIgZmluaXNoR2FtZSA9IGZ1bmN0aW9uKHN0YXR1cykge1xyXG5cdFxyXG5cdC8vIFNob3cgbWVzc2FnZVxyXG5cdHN3aXRjaCAoc3RhdHVzKSB7XHJcblx0Y2FzZSAnd29uJzpcclxuXHRcdFBvcHVwLnNob3dXaW4oKTtcclxuXHRcdFN0YXR1c0Jhci51cGRhdGVQb2ludHMoMSk7XHJcblx0XHRicmVhaztcclxuXHJcblx0Y2FzZSAnbG9zdCc6XHJcblx0XHRQb3B1cC5zaG93TG9zZSgpO1xyXG5cdFx0U3RhdHVzQmFyLnVwZGF0ZVBvaW50cygtMSk7XHJcblx0XHRicmVhaztcclxuXHJcblx0ZGVmYXVsdDpcclxuXHRcdGFsZXJ0KCdQbGVhc2UgcmVmcmVzaCBhbmQgdHJ5IGFnYWluIScpO1xyXG5cdFx0YnJlYWs7XHJcblx0fVxyXG5cclxuXHQvLyBTdGFydCBhIG5ldyBnYW1lXHJcblx0cmVzZXRHYW1lKCk7XHJcblx0aGFuZGxlR2FtZVN0YXJ0KCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRzdGFydDogc3RhcnRcclxufTsiLCJ2YXIgR2FtZSA9IHJlcXVpcmUoJy4vZ2FtZS5qcycpO1xyXG5cclxuLy8gUnVuIHRoZSBnYW1lIGlmIGFsbCBhc3NldHMgYXJlIGxvYWRlZFxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR2YXIgc2V0dGluZ3MgPSB7XHJcblx0XHRwaHJhc2VFbDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BocmFzZScpLFxyXG5cdFx0YWxwaGFiZXRFbDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FscGhhYmV0JyksXHJcblx0XHRoYW5nbWFuRWw6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoYW5nbWFuJyksXHJcblx0XHR0b3RhbExpdmVzOiA1LFxyXG5cclxuXHRcdHN0YXR1c0JhckVsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZS1pbmZvLWJhcicpLFxyXG5cdFx0cG9pbnRzRWxOYW1lOiAnLmdhbWUtaW5mby1wb2ludHMnLFxyXG5cdFx0bGl2ZXNFbE5hbWU6ICcuZ2FtZS1pbmZvLWxpdmVzJyxcclxuXHRcdHJlc2V0UG9pbnRzTmFtZTogJy5yZXNldC1wb2ludHMnLFxyXG5cclxuXHRcdHBvcHVwT3ZlcmxheUVsOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucG9wdXAtb3ZlcmxheScpLFxyXG5cdFx0cG9wdXBFbDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBvcHVwJyksXHJcblx0XHRnYW1lV29uVGV4dDogXCJDb25ncmF0dWxhdGlvbnMsIHlvdSd2ZSB3b24hXCIsXHJcblx0XHRnYW1lTG9zdFRleHQ6IFwiT29wcy4uLiBZb3UndmUganVzdCBsb3N0IGEgZ2FtZVwiLFxyXG5cdFx0b3BlbmVkQ2xhc3M6ICdvcGVuZWQnXHJcblx0fTtcclxuXHJcblx0R2FtZS5zdGFydChzZXR0aW5ncyk7XHJcblxyXG59O1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGluaXQsIGZhbHNlKTsiLCIvLyBHZXQgcmFuZG9tIHBocmFzZVxyXG52YXIgZ2V0ID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuXHR2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cclxuXHRyZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHJlcXVlc3QucmVhZHlTdGF0ZSA9PT0gNCAmJiByZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XHJcblxyXG5cdFx0XHQvLyBHZXQgMSByYW5kb20gcGhyYXNlXHJcblx0XHRcdHZhciBqc29uID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCksXHJcblx0XHRcdFx0cmFuZG9tID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICoganNvbi5sZW5ndGgpLFxyXG5cdFx0XHRcdHBocmFzZSA9ICcnLFxyXG5cdFx0XHRcdG1hc2tlZFBocmFzZSA9ICcnLFxyXG5cdFx0XHRcdHZpc2libGVMZXR0ZXJzID0gJyc7XHJcblxyXG5cdFx0XHRwaHJhc2UgPSBqc29uW3JhbmRvbV0udG9VcHBlckNhc2UoKTtcclxuXHRcdFx0bWFza2VkUGhyYXNlID0gbWFzayhwaHJhc2UsIDg1KTtcclxuXHRcdFx0dmlzaWJsZUxldHRlcnMgPSBnZXRWaXNpYmxlTGV0dGVycyhtYXNrZWRQaHJhc2UpO1xyXG5cclxuXHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdGNhbGxiYWNrKHBocmFzZSwgbWFza2VkUGhyYXNlLCB2aXNpYmxlTGV0dGVycyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRyZXF1ZXN0Lm9wZW4oJ0dFVCcsICd3b3Jkcy5qc29uJywgdHJ1ZSk7XHJcblx0cmVxdWVzdC5zZW5kKCk7XHJcbn07XHJcblxyXG4vLyBNYXNrIGNob3NlbiAlIG9mIHRoZSBnaXZlbiBwaHJhc2VcclxudmFyIG1hc2sgPSBmdW5jdGlvbihwaHJhc2UsIHBlcmNlbnRhZ2UpIHtcclxuXHJcblx0cGVyY2VudGFnZSAvPSAxMDA7XHJcblx0XHJcblx0dmFyIGhvd01hbnlMZXR0ZXJzVG9NYXNrID0gTWF0aC5mbG9vcihwaHJhc2UubGVuZ3RoICogcGVyY2VudGFnZSksXHJcblx0XHRtYXNrZWRQaHJhc2UgPSBwaHJhc2U7XHJcblxyXG5cdC8vIFJhbmRvbWx5IG1hc2sgbGV0dGVyc1xyXG5cdHdoaWxlIChob3dNYW55TGV0dGVyc1RvTWFzayA+IDApIHtcclxuXHRcdHZhciByYW5kb20gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwaHJhc2UubGVuZ3RoKSxcclxuXHRcdFx0bGV0dGVyID0gcGhyYXNlLmNoYXJBdChyYW5kb20pO1xyXG5cclxuXHRcdC8vIE1hc2sgb25seSBsZXR0ZXJzXHJcblx0XHQvLyBFeGNsdWRlOiAnXycgYW5kICcgJ1xyXG5cdFx0aWYgKGxldHRlciAhPT0gJ18nICYmIGxldHRlciAhPT0gJyAnKSB7XHJcblx0XHRcdG1hc2tlZFBocmFzZSA9IG1hc2tlZFBocmFzZS5yZXBsYWNlQXQocmFuZG9tLCAnXycpO1xyXG5cdFx0XHRob3dNYW55TGV0dGVyc1RvTWFzay0tO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gbWFza2VkUGhyYXNlO1xyXG59O1xyXG5cclxuLy8gRHJhdyBtYXNrZWQgcGhyYXNlXHJcbnZhciBkcmF3ID0gZnVuY3Rpb24ocGhyYXNlQ29udGFpbmVyLCBtYXNrZWRQaHJhc2UpIHtcclxuXHRwaHJhc2VDb250YWluZXIuaW5uZXJIVE1MID0gbWFza2VkUGhyYXNlO1xyXG59O1xyXG5cclxuLy8gR2V0IHZpc2libGUgbGV0dGVycyBvZiBhIG1hc2tlZCBwaHJhc2VcclxudmFyIGdldFZpc2libGVMZXR0ZXJzID0gZnVuY3Rpb24obWFza2VkUGhyYXNlKSB7XHJcblx0dmFyIHBocmFzZSA9IG1hc2tlZFBocmFzZS5zcGxpdCgnJyksXHJcblx0XHR2aXNpYmxlTGV0dGVycyA9IFtdO1xyXG5cclxuXHRmb3IgKHZhciBpID0gMCwgbGVuID0gcGhyYXNlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcblx0XHQvLyBJZiB5b3UgZmluZCAnXycgb3IgJyAnIG9yIGEgZHVwbGljYXRlIGxldHRlciAtIGNvbnRpbnVlXHJcblx0XHRpZiAocGhyYXNlW2ldID09PSAnXycgfHwgcGhyYXNlW2ldID09PSAnICcgfHwgdmlzaWJsZUxldHRlcnMuaW5kZXhPZihwaHJhc2VbaV0pID4gLTEpIHtcclxuXHRcdFx0Y29udGludWU7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR2aXNpYmxlTGV0dGVycy5wdXNoKHBocmFzZVtpXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdmlzaWJsZUxldHRlcnM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRnZXQ6IGdldCxcclxuXHRkcmF3OiBkcmF3XHJcbn07IiwidmFyIFRvb2xzID0gcmVxdWlyZSgnLi90b29scy5qcycpO1xyXG5cclxuLy8gRGVmYXVsdCBzZXR0aW5nc1xyXG52YXIgcyA9IHtcclxuXHRwb3B1cE92ZXJsYXlFbDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBvcHVwLW92ZXJsYXknKSxcclxuXHRwb3B1cEVsOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucG9wdXAnKSxcclxuXHRnYW1lV29uVGV4dDogXCJDb25ncmF0dWxhdGlvbnMsIHlvdSd2ZSB3b24hXCIsXHJcblx0Z2FtZUxvc3RUZXh0OiBcIk9vcHMuLi4gWW91J3ZlIGp1c3QgbG9zdCBhIGdhbWVcIixcclxuXHRvcGVuZWRDbGFzczogJ29wZW5lZCdcclxufTtcclxuXHJcbi8vIExvY2FsIHZhcmlhYmxlc1xyXG52YXIgcG9wdXBCdG4gPSAnJztcclxuXHJcbnZhciBzaG93ID0gZnVuY3Rpb24oKSB7XHJcblx0cy5wb3B1cE92ZXJsYXlFbC5jbGFzc0xpc3QuYWRkKHMub3BlbmVkQ2xhc3MpO1xyXG5cdHMucG9wdXBFbC5jbGFzc0xpc3QuYWRkKHMub3BlbmVkQ2xhc3MpO1xyXG59O1xyXG5cclxudmFyIGNsb3NlID0gZnVuY3Rpb24oKSB7XHJcblx0cy5wb3B1cE92ZXJsYXlFbC5jbGFzc0xpc3QucmVtb3ZlKHMub3BlbmVkQ2xhc3MpO1xyXG5cdHMucG9wdXBFbC5jbGFzc0xpc3QucmVtb3ZlKHMub3BlbmVkQ2xhc3MpO1xyXG59O1xyXG5cclxuLy8gT3BlbiBwb3B1cCBhbmQgc2V0IHByb3BlciB0ZXh0XHJcbnZhciBzaG93V2luID0gZnVuY3Rpb24oKSB7XHJcblx0cy5wb3B1cEVsLnF1ZXJ5U2VsZWN0b3IoJ2gzJykudGV4dENvbnRlbnQgPSBzLmdhbWVXb25UZXh0O1xyXG5cdHNob3coKTtcclxufTtcclxuXHJcbnZhciBzaG93TG9zZSA9IGZ1bmN0aW9uKCkge1xyXG5cdHMucG9wdXBFbC5xdWVyeVNlbGVjdG9yKCdoMycpLnRleHRDb250ZW50ID0gcy5nYW1lTG9zdFRleHQ7XHJcblx0c2hvdygpO1xyXG59O1xyXG5cclxuLy8gSW5pdGlhbGl6ZSBwb3B1cFxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG5cdFxyXG5cdC8vIEdldCB1c2VyJ3MgZGVmaW5lZCBvcHRpb25zXHJcblx0VG9vbHMudXBkYXRlU2V0dGluZ3MocywgY29uZmlnKTtcclxuXHJcblx0Ly8gV2hlbiBzZXR0aW5ncyBhcmUgcmVhZHksIHNldCBsb2NhbCB2YXJpYWJsZXNcclxuXHRwb3B1cEJ0biA9IHMucG9wdXBFbC5xdWVyeVNlbGVjdG9yKCdidXR0b24nKTtcclxuXHJcblx0Ly8gSGFuZGxlIHBvcHVwIGNsb3NlIGV2ZW50c1xyXG5cdC8vIE9uIGJ1dHRvbiBjbGlja1xyXG5cdHBvcHVwQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2UsIGZhbHNlKTtcclxuXHJcblx0Ly8gT24gb3V0c2lkZSBwb3B1cCBjbGlja1xyXG5cdHMucG9wdXBPdmVybGF5RWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZSwgZmFsc2UpO1xyXG5cclxuXHQvLyBCdXQgZG8gbm90aGluZyB3aGVuIGNsaWNrZWQgaW5zaWRlIHBvcHVwXHJcblx0cy5wb3B1cEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG5cdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHR9LCBmYWxzZSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRpbml0OiBpbml0LFxyXG5cdHNob3dXaW46IHNob3dXaW4sXHJcblx0c2hvd0xvc2U6IHNob3dMb3NlXHJcbn07IiwidmFyIFRvb2xzID0gcmVxdWlyZSgnLi90b29scy5qcycpO1xyXG5cclxuLy8gRGVmYXVsdCBzZXR0aW5nc1xyXG52YXIgcyA9IHtcclxuXHRsaXZlczogNSxcclxuXHRzdGF0dXNCYXJFbDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUtaW5mby1iYXInKSxcclxuXHRwb2ludHNFbE5hbWU6ICcuZ2FtZS1pbmZvLXBvaW50cycsXHJcblx0bGl2ZXNFbE5hbWU6ICcuZ2FtZS1pbmZvLWxpdmVzJyxcclxuXHRyZXNldFBvaW50c05hbWU6ICcucmVzZXQtcG9pbnRzJyxcclxufTtcclxuXHJcbi8vIExvY2FsIHZhcmlhYmxlc1xyXG52YXJcdHBvaW50c0VsID0gJycsXHJcblx0bGl2ZXNFbCA9ICcnLFxyXG5cdHJlc2V0UG9pbnRzRWwgPSAnJztcclxuXHJcbi8vIEFkZCB4IHBvaW50cyB0byBjdXJyZW50IHNjb3JlXHJcbi8vIE1pbmltdW0gc2NvcmUgaXMgMCwgd2UgZG9uJ3QgbmVlZCBuZWdhdGl2ZSB2YWx1ZXNcclxudmFyIHVwZGF0ZVBvaW50cyA9IGZ1bmN0aW9uKHBvaW50cykge1xyXG5cdHZhciBjdXJyZW50U2NvcmUgPSBnZXRDdXJyZW50U2NvcmUoKSxcclxuXHRcdG5ld1Njb3JlID0gY3VycmVudFNjb3JlICsgcGFyc2VJbnQocG9pbnRzLCAxMCk7XHJcblxyXG5cdGlmIChuZXdTY29yZSA+PSAwKSB7XHJcblx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaG1fc2NvcmUnLCBuZXdTY29yZSk7XHJcblx0XHRwb2ludHNFbC50ZXh0Q29udGVudCA9IG5ld1Njb3JlO1xyXG5cdH1cclxufTtcclxuXHJcbi8vIFJlc2V0IHBvaW50cyB0byAwXHJcbnZhciByZXNldFBvaW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cdGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdobV9zY29yZScsIDApO1xyXG59O1xyXG5cclxudmFyIGdldEN1cnJlbnRTY29yZSA9IGZ1bmN0aW9uKCkge1xyXG5cdHZhciBjdXJyZW50U2NvcmUgPSBwYXJzZUludChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaG1fc2NvcmUnKSwgMTApO1xyXG5cclxuXHRpZiAoaXNOYU4oY3VycmVudFNjb3JlKSB8fCBjdXJyZW50U2NvcmUgPT09IG51bGwpIHtcclxuXHRcdHJlc2V0UG9pbnRzKCk7XHJcblx0XHRyZXR1cm4gMDtcclxuXHR9IGVsc2Uge1xyXG5cdFx0cmV0dXJuIGN1cnJlbnRTY29yZTtcclxuXHR9XHJcbn07XHJcblxyXG52YXIgZHJhd0xpdmVzID0gZnVuY3Rpb24obGl2ZXMpIHtcclxuXHRsaXZlc0VsLnRleHRDb250ZW50ID0gbGl2ZXM7XHJcbn07XHJcblxyXG52YXIgZHJhd0N1cnJlbnRTY29yZSA9IGZ1bmN0aW9uKCkge1xyXG5cdHBvaW50c0VsLnRleHRDb250ZW50ID0gZ2V0Q3VycmVudFNjb3JlKCk7XHJcbn07XHJcblxyXG52YXIgaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG5cdFxyXG5cdC8vIEdldCB1c2VyJ3MgZGVmaW5lZCBvcHRpb25zXHJcblx0VG9vbHMudXBkYXRlU2V0dGluZ3MocywgY29uZmlnKTtcclxuXHJcblx0Ly8gV2hlbiBzZXR0aW5ncyBhcmUgcmVhZHksIHNldCBsb2NhbCB2YXJpYWJsZXNcclxuXHRwb2ludHNFbCA9IHMuc3RhdHVzQmFyRWwucXVlcnlTZWxlY3RvcihzLnBvaW50c0VsTmFtZSk7XHJcblx0bGl2ZXNFbCA9IHMuc3RhdHVzQmFyRWwucXVlcnlTZWxlY3RvcihzLmxpdmVzRWxOYW1lKTtcclxuXHRyZXNldFBvaW50c0VsID0gcy5zdGF0dXNCYXJFbC5xdWVyeVNlbGVjdG9yKHMucmVzZXRQb2ludHNOYW1lKTtcclxuXHJcblx0ZHJhd0N1cnJlbnRTY29yZSgpO1xyXG5cdGRyYXdMaXZlcyhzLmxpdmVzKTtcclxuXHJcblx0cmVzZXRQb2ludHNFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG5cdFx0cmVzZXRQb2ludHMoKTtcclxuXHRcdGRyYXdDdXJyZW50U2NvcmUoKTtcclxuXHR9LCBmYWxzZSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRpbml0OiBpbml0LFxyXG5cdHVwZGF0ZVBvaW50czogdXBkYXRlUG9pbnRzLFxyXG5cdGRyYXdMaXZlczogZHJhd0xpdmVzXHJcbn07IiwiLy8gQXV0b21hdGljYWxseSBhZGQgcmVwbGFjZUF0IG1ldGhvZCB0byBzdHJpbmdzXHJcblN0cmluZy5wcm90b3R5cGUucmVwbGFjZUF0ID0gZnVuY3Rpb24oaW5kZXgsIGNoYXJhY3Rlcikge1xyXG5cdHJldHVybiB0aGlzLnN1YnN0cigwLCBpbmRleCkgKyBjaGFyYWN0ZXIgKyB0aGlzLnN1YnN0cihpbmRleCArIGNoYXJhY3Rlci5sZW5ndGgpO1xyXG59O1xyXG5cclxuLy8gT3ZlcndyaXRlIGRlZmF1bHQgc2V0dGluZ3Mgd2l0aCB1c2VyJ3NcclxuLy8gRXZlbiBpZiB0aGUgc2luZ2xlIHNldHRpbmcgZG9lc24ndCBleGlzdCBpbiBkZWZhdWx0c1xyXG4vLyBjcmVhdGUgYSBuZXcgb25lIGJhc2luZyBvbiBuZXdTZXR0aW5nc1xyXG52YXIgdXBkYXRlU2V0dGluZ3MgPSBmdW5jdGlvbihkZWZhdWx0U2V0dGluZ3MsIG5ld1NldHRpbmdzKSB7XHJcblx0Zm9yICh2YXIgcHJvcCBpbiBuZXdTZXR0aW5ncykge1xyXG5cdFx0aWYgKG5ld1NldHRpbmdzLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcblx0XHRcdGRlZmF1bHRTZXR0aW5nc1twcm9wXSA9IG5ld1NldHRpbmdzW3Byb3BdO1xyXG5cdFx0fVxyXG5cdH1cclxufTtcclxuXHJcbi8vIEdldCBhbGwgaW5kZXhlcyBvZiB2YWx1ZSBpbiBhcnJheVxyXG52YXIgZ2V0QWxsSW5kZXhlcyA9IGZ1bmN0aW9uKGFyciwgdmFsKSB7XHJcblx0dmFyIGluZGV4ZXMgPSBbXSwgXHJcblx0XHRpID0gLTE7XHJcblxyXG5cdHdoaWxlICgoaSA9IGFyci5pbmRleE9mKHZhbCwgaSArIDEpKSAhPSAtMSkge1xyXG5cdFx0aW5kZXhlcy5wdXNoKGkpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGluZGV4ZXM7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHR1cGRhdGVTZXR0aW5nczogdXBkYXRlU2V0dGluZ3MsXHJcblx0Z2V0QWxsSW5kZXhlczogZ2V0QWxsSW5kZXhlc1xyXG59O1xyXG4iXX0=
