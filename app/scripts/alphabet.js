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