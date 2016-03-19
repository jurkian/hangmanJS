// Replace character method
String.prototype.replaceAt = function(index, character) {
  return this.substr(0, index) + character + this.substr(index + character.length);
};

// Draw randomly masked phrase
var correctPhrase = 'Computer type'.toUpperCase(),
  maskedPhrase = correctPhrase;

function maskLetters(correctPhrase) {
  // Mask 60% of the given correctPhrase
  var howManyLettersToMask = Math.floor(correctPhrase.length * 0.6);

  while (howManyLettersToMask > 0) {
    var random = Math.floor(Math.random() * correctPhrase.length);

    if (maskedPhrase.charAt(random) != '_' && maskedPhrase.charAt(random) != ' ') {
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
  livesLeft = totalLives;

for (var i = 0; i < singleLetters.length; i++) {
  singleLetters[i].addEventListener('click', checkLetter, false);
}

function checkLetter() {
  var clickedLetter = this.innerHTML;

  // Check if the clicked letter is one of these hidden in the phrase
  for (var i = 0; i < correctPhrase.length; i++) {

    // Convert both characters to upper case, to compare it as case insensitive
    if (correctPhrase.charAt(i).toUpperCase() == clickedLetter.toUpperCase()) {
      // Letter found
      revealLetter(clickedLetter);
      return;
    }

  }

  // Letter not found
  incorrectGuess();
}

function revealLetter(letterToReveal) {

  // Reveal the letter (can be multiple letters)
  for (var i = 0; i < maskedPhrase.length; i++) {
    
    if (correctPhrase.charAt(i).toUpperCase() == letterToReveal.toUpperCase()) {
      // To make sure the correct letter case is replaced,
      // get the letter from correct phrase, basing on index
      maskedPhrase = maskedPhrase.replaceAt(i, correctPhrase.charAt(i));
    }
  }

  document.getElementById('phrase').innerHTML = maskedPhrase;

  // Check if user has won
  isPhraseRevealed = (maskedPhrase.indexOf('_') == -1) ? true : false;
  
  if (isPhraseRevealed) {
    finishGame('won');
  }
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

    finishGame('lost');
  }
}

function finishGame(status) {
  // Disable click on letters and show message
  for (var i = 0; i < singleLetters.length; i++) {
    singleLetters[i].removeEventListener('click', checkLetter);
  }

  switch (status) {
    case 'won':
      alert('Congratulations, you won! Now you can refresh and try again.');
      break;

    case 'lost':
      alert('Ooops... You\'ve just lost a game. Please refresh and try again!');
      break;

    default:
  }
}