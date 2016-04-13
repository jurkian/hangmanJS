(function() {

	// Run the game if all assets are loaded
	var init = function() {
		var phrase = '',
				phraseEl = document.getElementById('phrase'),
				maskedPhrase = '',
				alphabet = 'abcdefghijklmnopqrstuwvxyz'.toUpperCase(),
				lettersEl = document.getElementById('alphabet'),
				singleLettersEl = lettersEl.getElementsByTagName('li'),
				visibleLetters = '',
				totalLives = 5,
				livesLeft = totalLives;

		Game.start(function(phrase) {
			maskedPhrase = Game.maskPhrase(phrase);
			visibleLetters = Game.getVisibleLetters(maskedPhrase);

			// Draw masked phrase
			phraseEl.innerHTML = maskedPhrase;

			// Draw alphabet
			for (var i = 0; i < alphabet.length; i++) {
				var singleLetterLi = document.createElement('li');

				singleLetterLi.innerHTML = alphabet.charAt(i);
				lettersEl.appendChild(singleLetterLi);
			}

			// Handle the click on each letter
			for (i = 0; i < singleLettersEl.length; i++) {
				singleLettersEl[i].addEventListener('click', checkLetter, false);
			}

			// Make sure every instance of uncovered letter is visible
			for (i = 0; i < visibleLetters.length; i++) {
				revealLetter(visibleLetters[i]);
			}
		});

		String.prototype.replaceAt = function(index, character) {
			return this.substr(0, index) + character + this.substr(index + character.length);
		};

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
			singleLettersEl[index].className += ' letter-active';
			singleLettersEl[index].removeEventListener('click', checkLetter);
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
			for (var i = 0; i < singleLettersEl.length; i++) {
				singleLettersEl[i].removeEventListener('click', checkLetter);
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
	window.addEventListener('load', init, false);

})();