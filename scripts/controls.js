function checkKey(key) {
	// checks an incoming key
	lastKey = key;
	
	if (keyDown(controls.play)) {
		timescale = 1;
	} else if (keyDown(controls.fastForward) && !fastforward) {
		timescale *= 3;
		fastforward = true;
	} else if (keyDown(controls.stop)) {
		timescale = 0;
	} else if (keyDown(controls.speedUp)) {
		timescale += 20;
	}
	
	if (keyDown(controls.debug)) {
	  debugMode = !debugMode;
	}
	
	if (keyDown(controls.auto)) {
	  autoMode = !autoMode;
	}
	
	if (keyDown(controls.gif)) {
	  gifMode = !gifMode;
	  
	  if (gifMode) document.body.style.background = "black";
	  else document.body.style.background = "url('./water.gif') center center repeat fixed";
	}
}

let mouse = {
	up: {x: 0, y: 0},
	down: {x: 0, y: 0},
	current: {x: 0, y: 0},
	isdown: false
};

function getMousePos(e) {
	return [
		(e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.clientWidth),
		(e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.clientHeight)
	];
}

function keyDown(key) {
  if (lastKey == keys[key]) return true;
  return false;
}

window.onmousedown = function (e) {
	mouse.down.x = getMousePos(e)[0];
	mouse.down.y = getMousePos(e)[1];

	mouse.isdown = true;

	selectedCreature = null;

	for (let creature of creatures) {
		if (creature.select()) {
			selectedCreature = creature;
		}
	}
};

window.onmouseup = function (e) {
	mouse.up.x = getMousePos(e)[0];
	mouse.up.y = getMousePos(e)[1];

	mouse.isdown = false;
};

window.onmousemove = function (e) {
	mouse.current.x = getMousePos(e)[0];
	mouse.current.y = getMousePos(e)[1];

	if (mouse.isdown) {
		cropx += (lcx - mouse.current.x);
		cropy += (lcy - mouse.current.y);
	}

	lcx = mouse.current.x;
	lcy = mouse.current.y;
};

window.onmousewheel = function (e) {
	e.preventDefault();
	zoomAmount = Math.max(Math.min(e.wheelDelta, 1), -1);
	zoomLevel += zoomAmount * zoomSpeed;

	if (zoomLevel < minZoomLevel) {
		zoomLevel = minZoomLevel;
	} else
	if (zoomLevel > maxZoomLevel) {
		zoomLevel = maxZoomLevel;
	} else {
		mouse.current.x = getMousePos(e)[0];
		mouse.current.y = getMousePos(e)[1];

		let bzoom = {};
		zoomLevel -= zoomAmount * zoomSpeed;
		bzoom.x = (cropx + mouse.current.x) / zoomLevel;
		bzoom.y = (cropy + mouse.current.y) / zoomLevel;

		let azoom = {};
		zoomLevel += zoomAmount * zoomSpeed;
		azoom.x = (cropx + mouse.current.x) / zoomLevel;
		azoom.y = (cropy + mouse.current.y) / zoomLevel;

		cropx += (bzoom.x - azoom.x) * zoomLevel;
		cropy += (bzoom.y - azoom.y) * zoomLevel;
	}
};

window.onkeydown = function (e) {
	checkKey(e.keyCode);
};

window.onkeyup = function (e) {
	if (e.keyCode == keys[controls.fastForward] && fastforward) {
		fastforward = false;
		timescale /= 3;
	}
};
