// General files
import '../robots.txt';

// Scss
import '../sass/site.scss';

// API
import '../api/words.json';

import './lib/polyfills';

import start from './lib/game';

// Run the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	let settings = {
		phraseEl: document.querySelector('#phrase'),
		alphabetEl: document.querySelector('#alphabet'),
		hangmanEl: document.querySelector('#hangman'),
		totalLives: 5,

		statusBarEl: document.querySelector('#game-info-bar'),
		pointsElName: '.game-info-points',
		livesElName: '.game-info-lives',
		resetPointsName: '.reset-points',

		popupOverlayEl: document.querySelector('.popup-overlay'),
		popupEl: document.querySelector('.popup'),
		gameWonText: "Congratulations, you've won!",
		gameLostText: "Oops... You've just lost a game",
		openedClass: 'opened'
	};

	start(settings);
});