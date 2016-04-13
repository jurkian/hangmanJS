(function() {

	// Run the game if all assets are loaded
	var init = function() {
		var phrase = '',
				phraseEl = document.getElementById('phrase'),
				maskedPhrase = '',
				lettersEl = document.getElementById('alphabet'),
				singleLettersEl = lettersEl.getElementsByTagName('li'),
				visibleLetters = '',
				totalLives = 5,
				livesLeft = totalLives,
				i;

		Game.start(function(phrase) {
			maskedPhrase = Game.maskPhrase(phrase);
			visibleLetters = Game.getVisibleLetters(maskedPhrase);

			// Draw masked phrase
			phraseEl.innerHTML = maskedPhrase;

			// Draw alphabet
			Game.drawAlphabet(lettersEl);

			// Handle the click on each letter
			var handleLetterClick = function(event) {
				var letter = event.target.textContent;
				Game.checkLetter(letter, phrase, function() {
					// Letter found
					Game.revealLetter(letter, maskedPhrase, phrase, phraseEl);
					Game.deactivateLetter(letter, singleLettersEl, handleLetterClick);
				});
			};

			for (i = 0; i < singleLettersEl.length; i++) {
				singleLettersEl[i].addEventListener('click', handleLetterClick, false);
			}

			// Make sure every instance of uncovered letter is visible
			for (i = 0; i < visibleLetters.length; i++) {
				Game.revealLetter(visibleLetters[i], maskedPhrase, phrase, phraseEl);
				Game.deactivateLetter(visibleLetters[i], singleLettersEl, handleLetterClick);
			}
		});

		String.prototype.replaceAt = function(index, character) {
			return this.substr(0, index) + character + this.substr(index + character.length);
		};

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