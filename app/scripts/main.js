// Replace character method
String.prototype.replaceAt = function(index, character) {
  return this.substr(0, index) + character + this.substr(index + character.length);
};

// Draw randomly masked phrase
var correctPhrase = 'Computer';

function maskLetters(correctPhrase) {
  // Mask 60% of the given correctPhrase
  var howManyLettersToMask = Math.floor(correctPhrase.length * 0.6),
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