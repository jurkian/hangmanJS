(function() {

	// Run the game if all assets are loaded
	var init = function() {

		Game.start(function(phrase) {

			// Draw masked phrase
			Game.drawMaskedPhrase();

			// Draw alphabet
			Game.drawAlphabet();

			// Handle the click on each letter
			Game.handleLetterClicks();

			// Show every uncovered letter on the alphabet board
			Game.uncoverPhraseParts();
		});

	};
	window.addEventListener('load', init, false);

})();