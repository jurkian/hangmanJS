// Replace character method
String.prototype.replaceAt = function(index, character) {
  return this.substr(0, index) + character + this.substr(index + character.length);
};

// Draw randomly masked phrase
var correctPhrase = 'Computer',
  maskedLettersLeft = '';

function maskLetters(correctPhrase) {
  // Mask 60% of the given correctPhrase
  var howManyLettersToMask = Math.floor(correctPhrase.length * 0.6),
    maskedLettersLeft = howManyLettersToMask,
    maskedPhrase = correctPhrase;

  while (howManyLettersToMask > 0) {
    var random = Math.floor(Math.random() * correctPhrase.length);

    if (maskedPhrase.charAt(random) != '_') {
      maskedPhrase = maskedPhrase.replaceAt(random, '_');
      howManyLettersToMask--;
    } else {
      continue;
    }
  }

  return maskedPhrase;
}

document.getElementById('phrase').innerHTML = maskLetters(correctPhrase);

// Draw alphabet
var letters = 'abcdefghijklmnopqrstuwvxyz'.toUpperCase(),
  lettersList = document.getElementById('letters');

for (var i = 0; i < letters.length; i++) {
  var singleLetterLi = document.createElement('li');

  singleLetterLi.innerHTML = letters.charAt(i);
  lettersList.appendChild(singleLetterLi);
}

// Check letter
var singleLetters = lettersList.getElementsByTagName('li');

// Handle the click on each letter
var totalLives = 5,
	livesLeft = totalLives,
	isPhraseRevealed = (maskedLettersLeft === 0) ? true : false;

for (var i = 0; i < singleLetters.length; i++) {
  singleLetters[i].addEventListener('click', checkLetter, false);
}

function checkLetter() {
  var clickedLetter = this.innerHTML;

  // Check if the clicked letter is one of these hidden in the phrase
  for (var i = 0; i < correctPhrase.length; i++) {

    if (correctPhrase.charAt(i) === clickedLetter) {
      // Letter found
      revealLetter(clickedLetter);
      return;
    }

  }

  // Letter not found
  incorrectGuess();
}

function revealLetter(letterToReveal) {
	// Reveal the letter
	// ...
	
	// Check if user has won
	// ...
}

function incorrectGuess() {
	// Reduce lives and start showing the hangman
	livesLeft--;

	var hangman = document.getElementById('hangman'),
			opacityToAdd = 1 / totalLives,
			hangmanOpacity = hangman.style.opacity || 0;

	hangman.style.opacity = parseFloat(hangmanOpacity) + parseFloat(opacityToAdd);

	// If no more lives left -> game over
	if (livesLeft === 0) {

		// Disable click on letters and show message
		for (var i = 0; i < singleLetters.length; i++) {
		  singleLetters[i].removeEventListener('click', checkLetter);
		}

		alert('Ooops... You\'ve just lost a game. Please refresh and try again!');
	}
}