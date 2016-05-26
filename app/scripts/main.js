var Game = require('./game.js');

// Run the game if all assets are loaded
var init = function() {

	var settings = {
		phraseEl: document.getElementById('phrase'),
		alphabetEl: document.getElementById('alphabet'),
		hangmanEl: document.getElementById('hangman'),
		totalLives: 5,

		statusBarEl: document.getElementById('game-info-bar'),
		pointsElName: '.game-info-points',
		livesElName: '.game-info-lives',
		resetPointsName: '.reset-points',

		popupOverlayEl: document.querySelector('.popup-overlay'),
		popupEl: document.querySelector('.popup'),
		gameWonText: "Congratulations, you've won!",
		gameLostText: "Oops... You've just lost a game",
		openedClass: 'opened'
	};

	Game.start(settings);

};
window.addEventListener('load', init, false);