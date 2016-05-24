var StatusBar = (function () {
	
	// Settings
	var _statusBarEl = document.getElementById('game-info-bar'),
			_pointsElName = '.game-info-points',
			_livesElName = '.game-info-lives',
			_pointsEl = _statusBarEl.querySelector(_pointsElName),
			_livesEl = _statusBarEl.querySelector(_livesElName);

	var updateLives = function(lives) {
		_livesEl.textContent = lives;
	};

	var updatePoints = function(points) {
		_pointsEl.textContent = points;
	};

	// Public returns
	return {
	  updatePoints: updatePoints,
	  updateLives: updateLives
	};

})();