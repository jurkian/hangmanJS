var StatusBar = (function () {
	
	// Settings
	var _statusBarEl = document.getElementById('game-info-bar'),
			_pointsElName = '.game-info-points',
			_livesElName = '.game-info-lives',
			_resetPointsName = '.reset-points',
			_pointsEl = _statusBarEl.querySelector(_pointsElName),
			_livesEl = _statusBarEl.querySelector(_livesElName),
			_resetPointsEl = _statusBarEl.querySelector(_resetPointsName);

	// Add x points to current score
	// Minimum score is 0, we don't need negative values
	var updatePoints = function(points) {
		var currentScore = getCurrentScore(),
				newScore = currentScore + parseInt(points, 10);

		if (newScore >= 0) {
			localStorage.setItem('hm_score', newScore);
			_pointsEl.textContent = newScore;
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
		_livesEl.textContent = lives;
	};

	var drawCurrentScore = function() {
		_pointsEl.textContent = getCurrentScore();
	};

	var init = function(lives) {
		drawCurrentScore();
		drawLives(lives);

		_resetPointsEl.addEventListener('click', function() {
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