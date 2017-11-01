function keyEvents() {
	if (keyDown(controls.play)) {
		timescale = 1;
		timeUp = 0;
		timetoggle = false;
	} else if (timetoggle && firstError) {
		timescale = 250 * timeUp;
	} else if (keyDown(controls.fastForward)) {
		timescale = 50;
	} else if (keyDown(controls.stop)) {
		timescale = 0;
	} else if (keyDown(controls.speedUp)) {
		timetoggle = true;
	} else if (firstError) {
		timescale = 1;
	} else {
	    timescale = 0;
	}
}

let mouse = {
	up: {},
	down: {},
	current: {},
	isdown: false
};

function getMousePos(e) {
	return [
		(e.clientX - viewport.getBoundingClientRect().left) * (viewport.width / zoomLevel / viewport.clientWidth),
		(e.clientY - viewport.getBoundingClientRect().top) * (viewport.height / zoomLevel / viewport.clientHeight)
	];
}

window.onmousedown = function(e) {
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

window.onmouseup = function(e) {
	mouse.up.x = getMousePos(e)[0];
	mouse.up.y = getMousePos(e)[1];

	mouse.isdown = false;
};

window.onmousemove = function(e) {
	mouse.current.x = getMousePos(e)[0];
	mouse.current.y = getMousePos(e)[1];

	if (mouse.isdown) {
		cropx += (lcx - mouse.current.x);
		cropy += (lcy - mouse.current.y);
	}

	lcx = mouse.current.x;
	lcy = mouse.current.y;
};

window.onmousewheel = function(e) {
	zoomLevel += e.wheelDelta / zoomSpeed / (2400 / zoomLevel);

	if (zoomLevel < minZoomLevel) {
		zoomLevel = minZoomLevel;
	}

	if (zoomLevel > maxZoomLevel) {
		zoomLevel = maxZoomLevel;
	}

	mouse.current.x = getMousePos(e)[0];
	mouse.current.y = getMousePos(e)[1];

	cropx += lcx - mouse.current.x;
	cropy += lcy - mouse.current.y;

	lcx = mouse.current.x;
	lcy = mouse.current.y;
};

window.onkeydown = function(e) {
	activeKeys.push(e.keyCode);
	
	if (keyDown(controls.speedUp)) {
	    timeUp += 1;
	}
};

window.onkeyup = function(e) {
	var z = activeKeys.indexOf(e.keyCode);
	for (i = activeKeys.length; i > 0; i--) {
		if (z == -1) break;
		activeKeys.splice(z, 1);
		z = activeKeys.indexOf(e.keyCode);
	}
};

function keyDown(key) {
	if (activeKeys.indexOf(keys[key]) > -1) return true;
	return false;
}
