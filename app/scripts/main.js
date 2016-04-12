// Run the game if all assets are loaded
window.onload = function() {

  // Get random phrase
  var init = function() {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
      if (request.readyState === 4 && request.status === 200) {

        // Success - launch the game
        var json = JSON.parse(request.responseText),
          random = Math.floor(Math.random() * json.length);

        correctPhrase = json[random].toUpperCase();
        game(correctPhrase);
      }
    };

    request.open('GET', 'words.json', true);
    request.send();
  };

  // Variables
  var maskedPhrase = '',
    alphabet = 'abcdefghijklmnopqrstuwvxyz'.toUpperCase(),
    letters = document.getElementById('alphabet'),
    singleLetters = letters.getElementsByTagName('li'),
    visibleLetters = '',
    totalLives = 5,
    livesLeft = totalLives;

  init();

  var game = function(correctPhrase) {
    maskedPhrase = maskLetters(correctPhrase);
    visibleLetters = getVisibleLetters(maskedPhrase);

    // Draw randomly masked phrase
    document.getElementById('phrase').innerHTML = maskedPhrase;

    // Draw alphabet
    for (var i = 0; i < alphabet.length; i++) {
      var singleLetterLi = document.createElement('li');

      singleLetterLi.innerHTML = alphabet.charAt(i);
      letters.appendChild(singleLetterLi);
    }

    // Handle the click on each letter
    for (i = 0; i < singleLetters.length; i++) {
      singleLetters[i].addEventListener('click', checkLetter, false);
    }

    // Make sure every instance of uncovered letter is visible
    for (i = 0; i < visibleLetters.length; i++) {
      revealLetter(visibleLetters[i]);
    }
  };

  /* FUNCTIONS */

  String.prototype.replaceAt = function(index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
  };

  function maskLetters(correctPhrase) {
    // Mask 85% of the given correctPhrase
    var howManyLettersToMask = Math.floor(correctPhrase.length * 0.85),
      maskedPhrase = correctPhrase;

    while (howManyLettersToMask > 0) {
      var random = Math.floor(Math.random() * correctPhrase.length),
        letter = correctPhrase.charAt(random);

      // Mask a letter if it's not '_' or ' '
      if (letter !== '_' && letter !== ' ') {
        maskedPhrase = maskedPhrase.replaceAt(random, '_');
        howManyLettersToMask--;
      } else {
        continue;
      }
    }

    return maskedPhrase;
  }

  function getVisibleLetters(maskedPhrase) {
    var duplicateLetters = [],
      phrase = maskedPhrase.split(''),
      visibleLetters = [];

    for (var i = 0; i < phrase.length; i++) {
      // If you find '_' or ' ' or a duplicate letter - continue
      if (phrase[i] === '_' || phrase[i] === ' ' || duplicateLetters.indexOf(phrase[i]) > -1) {
        continue;
      } else {
        visibleLetters.push(phrase[i]);
        duplicateLetters.push(phrase[i]);
      }
    }

    return visibleLetters;
  }

  function checkLetter() {
    var clickedLetter = this.innerHTML;

    // Check if the clicked letter is one of these hidden in the phrase
    for (var i = 0; i < correctPhrase.length; i++) {

      // Convert both characters to upper case, to compare it as case insensitive
      if (correctPhrase.charAt(i).toUpperCase() === clickedLetter.toUpperCase()) {
        // Letter found
        revealLetter(clickedLetter);
        return;
      }
    }

    // You can use every letter only once
    var deactivateIndex = alphabet.indexOf(clickedLetter);
    deactivateLetter(deactivateIndex);

    // Letter not found
    incorrectGuess();
  }

  function revealLetter(letterToReveal) {

    // Reveal the letter (can be multiple letters)
    for (var i = 0; i < maskedPhrase.length; i++) {

      if (correctPhrase.charAt(i).toUpperCase() === letterToReveal.toUpperCase()) {
        // To make sure the correct letter case is replaced,
        // get the letter from correct phrase, basing on index
        maskedPhrase = maskedPhrase.replaceAt(i, correctPhrase.charAt(i));

        // Show every uncovered letter as active on the alphabet and deactivate click event
        var indexLetterToReveal = alphabet.indexOf(letterToReveal);
        deactivateLetter(indexLetterToReveal);
      }
    }

    document.getElementById('phrase').innerHTML = maskedPhrase;

    // Check if user has won
    isPhraseRevealed = (maskedPhrase.indexOf('_') === -1) ? true : false;

    if (isPhraseRevealed) {
      finishGame('won');
    }
  }

  function deactivateLetter(index) {
    singleLetters[index].className += ' letter-active';
    singleLetters[index].removeEventListener('click', checkLetter);
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
    }
  }

};