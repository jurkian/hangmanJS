let s = {
	phrase: '',
	maskedPhrase: '',
	visibleLetters: ''
};

let Phrase = {};

// Get random phrase
Phrase.fetch = () => {
	return new Promise((resolve, reject) => {

		let req = new XMLHttpRequest();
		req.open('GET', 'api/words.json', true);

		req.onload = () => {

			// Get 1 random phrase
			let json = JSON.parse(req.responseText),
				random = Math.floor(Math.random() * json.length);

			s.phrase = json[random].toUpperCase();
			s.maskedPhrase = mask(s.phrase, 85);
			s.visibleLetters = getVisibleLetters(s.maskedPhrase);

			resolve(s.phrase);
		};

		req.onerror = () => {
			reject(req.statusText);
		};

		req.send();
	});
};

// Getter and setter
Phrase.get = value => s[value];

Phrase.set = (setting, value) => s[setting] = value;

// Mask chosen % of the given phrase
let mask = (phrase, percentage) => {

	percentage /= 100;
	
	let howManyLettersToMask = Math.floor(phrase.length * percentage),
		maskedPhrase = phrase;

	// Randomly mask letters
	while (howManyLettersToMask > 0) {
		let random = Math.floor(Math.random() * phrase.length),
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
Phrase.draw = phraseContainer => phraseContainer.innerHTML = s.maskedPhrase;

// Get visible letters of a masked phrase
let getVisibleLetters = maskedPhrase => {
	let phrase = maskedPhrase.split(''),
		duplicateEls = [];

	// Get all letters except: duplicates, '_' and ' '
	let visibleLetters = phrase.filter(letter => {
		if (duplicateEls.indexOf(letter) === -1 && letter !== '_' && letter !== ' ') {
			duplicateEls.push(letter);
			return true;
		} else {
			return false;
		}
	});

	return visibleLetters;
};

export default Phrase;