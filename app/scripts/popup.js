var Popup = (function () {
	
	// Default settings
	var s = {
		popupOverlayEl: document.querySelector('.popup-overlay'),
		popupEl: document.querySelector('.popup'),
		gameWonText: "Congratulations, you've won!",
		gameLostText: "Oops... You've just lost a game",
		openedClass: 'opened'
	};

	// Local variables
	var popupBtn = '';

	var show = function() {
		s.popupOverlayEl.classList.add(s.openedClass);
		s.popupEl.classList.add(s.openedClass);
	};

	var close = function() {
		s.popupOverlayEl.classList.remove(s.openedClass);
		s.popupEl.classList.remove(s.openedClass);
	};

	// Open popup and set proper text
	var showWin = function() {
		s.popupEl.querySelector('h3').textContent = s.gameWonText;
		show();
	};

	var showLose = function() {
		s.popupEl.querySelector('h3').textContent = s.gameLostText;
		show();
	};

	// Initialize popup
	var init = function(config) {
		
		// Get user's defined options
		for (var prop in config) {
			if (config.hasOwnProperty(prop)) {
				s[prop] = config[prop];
			}
		}

		// When settings are ready, set local variables
		popupBtn = s.popupEl.querySelector('button');

		// Handle popup close events
		// On button click
		popupBtn.addEventListener('click', close, false);

		// On outside popup click
		s.popupOverlayEl.addEventListener('click', close, false);

		// But do nothing when clicked inside popup
		s.popupEl.addEventListener('click', function(e) {
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