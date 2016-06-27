let s = {
	phrase: '',
	maskedPhrase: '',
	visibleLetters: ''
};

// Get random phrase
let fetch = callback => {
	let req = new XMLHttpRequest();

	req.onreadystatechange = () => {
		if (req.readyState === 4 && req.status === 200) {

			// Get 1 random phrase
			let json = JSON.parse(req.responseText),
				random = Math.floor(Math.random() * json.length);

			s.phrase = json[random].toUpperCase();
			s.maskedPhrase = mask(s.phrase, 85);
			s.visibleLetters = getVisibleLetters(s.maskedPhrase);

			if (typeof callback === 'function') {
				callback(s.phrase, s.maskedPhrase, s.visibleLetters);
			}
		}
	};

	req.open('GET', 'words.json', true);
	req.send();
};

// Getter and setter
let get = value => s[value];

let set = (setting, value) => s[setting] = value;

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
let draw = phraseContainer => phraseContainer.innerHTML = s.maskedPhrase;

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

module.exports = {
	get,
	set,
	fetch,
	draw
};