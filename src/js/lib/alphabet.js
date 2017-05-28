import Tools from './tools';
import Phrase from './phrase';

let Alphabet = {};

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
Alphabet.init = config => {
	Tools.updateSettings(s, config);
};

// Get single letters as DOM elements
Alphabet.getLettersEls = () => {
	return singleLettersEls;
};

// Draw alphabet
Alphabet.draw = () => {
	return new Promise((resolve, reject) => {

		s.alphabet.split('').forEach((el, index) => {
			let singleLetterLi = document.createElement('li');

			singleLetterLi.innerHTML = el;
			s.alphabetContainer.appendChild(singleLetterLi);
		});

		singleLettersEls = s.alphabetContainer.getElementsByTagName('li');
		resolve();
	});
};

// Handle letter clicks
Alphabet.handleClicks = handleSingleClick => {
	if (typeof handleSingleClick === 'function') {
		for (let el of singleLettersEls) {
			el.addEventListener('click', handleSingleClick, false);
		}
	}
};

// Uncover phrase parts
Alphabet.uncoverPhraseParts = () => {
	Phrase.get('visibleLetters').forEach((el, index) => {
		Alphabet.revealLetter(el);
	});
};

// Mark letter as active and deactivate click listener
let deactivateLetter = letter => {
	let index = s.alphabet.indexOf(letter);

	singleLettersEls[index].classList.add('letter-active');
	singleLettersEls[index].removeEventListener('click', handleClicksFn);
};

// Reveal the letter (can be multiple letters)
Alphabet.revealLetter = letterToReveal => {

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

export default Alphabet;