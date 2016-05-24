var Popup = (function () {
	
	// Settings
	var _popupOverlayEl = document.querySelector('.popup-overlay'),
			_popupEl = document.querySelector('.popup'),
			_popupBtn = _popupEl.querySelector('button'),
			_gameWonText = "Congratulations, you've won!",
			_gameLostText = "Oops... You've just lost a game";

	var show = function() {
		_popupOverlayEl.classList.add('opened');
		_popupEl.classList.add('opened');
	};

	var close = function() {
		_popupOverlayEl.classList.remove('opened');
		_popupEl.classList.remove('opened');
	};

	// Open popup and set proper text
	var showWin = function() {
		_popupEl.querySelector('h3').textContent = _gameWonText;
		show();
	};

	var showLose = function() {
		_popupEl.querySelector('h3').textContent = _gameLostText;
		show();
	};

	// Initialize popup
	var init = function() {
		
		// Handle popup close events
		// On button click
		_popupBtn.addEventListener('click', close, false);

		// On outside popup click
		_popupOverlayEl.addEventListener('click', close, false);

		_popupEl.addEventListener('click', function(e) {
			e.stopPropagation();
		}, false);
	};

	// Public returns
	return {
		init: init,
		showWin: showWin,
		showLose: showLose,
		close: close
	};

})();