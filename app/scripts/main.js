(function() {

	// Run the game if all assets are loaded
	var init = function() {

		Game.start(function() {
			// ...
		});

	};
	window.addEventListener('load', init, false);

})();