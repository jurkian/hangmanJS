let Tools = require('./tools.js');

// Default settings
let s = {
	lives: 5,
	statusBarEl: document.getElementById('game-info-bar'),
	pointsElName: '.game-info-points',
	livesElName: '.game-info-lives',
	resetPointsName: '.reset-points',
};

// Local variables
let	pointsEl = '',
	livesEl = '',
	resetPointsEl = '';

// Add x points to current score
// Minimum score is 0, we don't need negative values
let updatePoints = function(points) {
	let currentScore = getCurrentScore(),
		newScore = currentScore + parseInt(points, 10);

	if (newScore >= 0) {
		localStorage.setItem('hm_score', newScore);
		pointsEl.textContent = newScore;
	}
};

// Reset points to 0
let resetPoints = function() {
	localStorage.setItem('hm_score', 0);
};

let getCurrentScore = function() {
	let currentScore = parseInt(localStorage.getItem('hm_score'), 10);

	if (isNaN(currentScore) || !currentScore) {
		resetPoints();
		return 0;
	} else {
		return currentScore;
	}
};

let drawLives = function(lives) {
	livesEl.textContent = lives;
};

let drawCurrentScore = function() {
	pointsEl.textContent = getCurrentScore();
};

let init = function(config) {
	
	// Get user's defined options
	Tools.updateSettings(s, config);

	// When settings are ready, set local variables
	pointsEl = s.statusBarEl.querySelector(s.pointsElName);
	livesEl = s.statusBarEl.querySelector(s.livesElName);
	resetPointsEl = s.statusBarEl.querySelector(s.resetPointsName);

	drawCurrentScore();
	drawLives(s.lives);

	resetPointsEl.addEventListener('click', function() {
		resetPoints();
		drawCurrentScore();
	}, false);
};

module.exports = {
	init,
	updatePoints,
	drawLives
};