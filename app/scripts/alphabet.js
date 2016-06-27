let Tools = require('./tools.js'),
	Phrase = require('./phrase.js');

// Settings
let s = {
	alphabet: '',
	alphabetContainer: {},
	phrase: '',
	phraseContainer: {}
};

// Local variables
let singleLettersEls = {},
	handleClicksFn = {};

// Get user's defined options
let init = config => {
	Tools.updateSettings(s, config);
};

// Get single letters as DOM elements
let getLettersEls = () => {
	return singleLettersEls;
};

// Draw alphabet
let draw = callback => {

	s.alphabet.split('').forEach((el, index) => {
		let singleLetterLi = document.createElement('li');

		singleLetterLi.innerHTML = el;
		s.alphabetContainer.appendChild(singleLetterLi);
	});

	singleLettersEls = s.alphabetContainer.getElementsByTagName('li');

	if (typeof callback === 'function') {
		callback();
	}

};

// Handle letter clicks
let handleClicks = handleSingleClick => {
	if (typeof handleSingleClick === 'function') {
		for (let i = 0, len = singleLettersEls.length; i < len; i++) {
			singleLettersEls[i].addEventListener('click', handleSingleClick, false);
		}
	}
};

// Uncover phrase parts
let uncoverPhraseParts = () => {
	Phrase.get('visibleLetters').forEach((el, index) => {
		revealLetter(el);
	});
};

// Mark letter as active and deactivate click listener
let deactivateLetter = letter => {
	let index = s.alphabet.indexOf(letter);

	singleLettersEls[index].classList.add('letter-active');
	singleLettersEls[index].removeEventListener('click', handleClicksFn);
};

// Reveal the letter (can be multiple letters)
let revealLetter = letterToReveal => {

	let maskedPhrase = Phrase.get('maskedPhrase'),
		indexes = Tools.getAllIndexes(s.phrase, letterToReveal);

	letterToReveal = letterToReveal.toUpperCase();
	maskedPhrase = maskedPhrase.toUpperCase();

	indexes.forEach((el, index) => {
		maskedPhrase = maskedPhrase.replaceAt(el, letterToReveal);
	});

	Phrase.set('maskedPhrase', maskedPhrase);
	Phrase.draw(s.phraseContainer, maskedPhrase);

	deactivateLetter(letterToReveal);
};

module.exports = {
	init,
	draw,
	handleClicks,
	getLettersEls,
	uncoverPhraseParts,
	revealLetter
};