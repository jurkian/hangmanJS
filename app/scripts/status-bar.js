var StatusBar = (function () {
	
	// Default settings
	var s = {
		lives: 5,
		statusBarEl: document.getElementById('game-info-bar'),
		pointsElName: '.game-info-points',
		livesElName: '.game-info-lives',
		resetPointsName: '.reset-points',
	};

	// Local variables
	var	pointsEl = '',
		livesEl = '',
		resetPointsEl = '';

	// Add x points to current score
	// Minimum score is 0, we don't need negative values
	var updatePoints = function(points) {
		var currentScore = getCurrentScore(),
			newScore = currentScore + parseInt(points, 10);

		if (newScore >= 0) {
			localStorage.setItem('hm_score', newScore);
			pointsEl.textContent = newScore;
		}
	};

	// Reset points to 0
	var resetPoints = function() {
		localStorage.setItem('hm_score', 0);
	};

	var getCurrentScore = function() {
		var currentScore = parseInt(localStorage.getItem('hm_score'), 10);

		if (isNaN(currentScore) || currentScore === null) {
			resetPoints();
			return 0;
		} else {
			return currentScore;
		}
	};

	var drawLives = function(lives) {
		livesEl.textContent = lives;
	};

	var drawCurrentScore = function() {
		pointsEl.textContent = getCurrentScore();
	};

	var init = function(config) {
		
		// Get user's defined options
		for (var prop in config) {
			if (config.hasOwnProperty(prop)) {
				s[prop] = config[prop];
			}
		}

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

	// Public returns
	return {
		init: init,
	  updatePoints: updatePoints,
	  getCurrentScore: getCurrentScore,
	  drawCurrentScore: drawCurrentScore,
	  resetPoints: resetPoints,
	  drawLives: drawLives
	};

})();