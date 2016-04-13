var Game = (function () {
	
	// Start = get random phrase
	var start = function(callback) {
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
			if (request.readyState === 4 && request.status === 200) {
				// Phrases loaded - get 1 random and start the game
				var json = JSON.parse(request.responseText),
						random = Math.floor(Math.random() * json.length),
						phrase = json[random].toUpperCase();

				callback(phrase);
			}
		};

		request.open('GET', 'words.json', true);
		request.send();
	};
	
	return {
	  start: start,
	};

})();