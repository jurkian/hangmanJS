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

	start(settings);
});