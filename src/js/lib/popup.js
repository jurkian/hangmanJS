import Tools from './tools';

let Popup = {};

// Default settings
let s = {
	popupOverlayEl: document.querySelector('.popup-overlay'),
	popupEl: document.querySelector('.popup'),
	gameWonText: "Congratulations, you've won!",
	gameLostText: "Oops... You've just lost a game",
	openedClass: 'opened'
};

// Local variables
let popupBtn = '';

let show = () => {
	s.popupOverlayEl.classList.add(s.openedClass);
	s.popupEl.classList.add(s.openedClass);
};

let close = () => {
	s.popupOverlayEl.classList.remove(s.openedClass);
	s.popupEl.classList.remove(s.openedClass);
};

// Open popup and set proper text
Popup.showWin = () => {
	s.popupEl.querySelector('h3').textContent = s.gameWonText;
	show();
};

Popup.showLose = () => {
	s.popupEl.querySelector('h3').textContent = s.gameLostText;
	show();
};

// Initialize popup
Popup.init = config => {
	
	// Get user's defined options
	Tools.updateSettings(s, config);

	// When settings are ready, set local variables
	popupBtn = s.popupEl.querySelector('button');

	// Handle popup close events
	// On button click
	popupBtn.addEventListener('click', close, false);

	// On outside popup click
	s.popupOverlayEl.addEventListener('click', close, false);

	// But do nothing when clicked inside popup
	s.popupEl.addEventListener('click', e => {
		e.stopPropagation();
	}, false);
};

export default Popup;