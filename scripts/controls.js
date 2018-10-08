function keyEvents() {
	if (keyDown(controls.play)) {
		timescale = 1;
		timeUp = 0;
		timetoggle = false;
	} else if (timetoggle) {
		timescale = 3 * timeUp;
	} else if (keyDown(controls.fastForward)) {
		timescale = 3;
	} else if (keyDown(controls.stop)) {
		timescale = 0;
	} else if (keyDown(controls.speedUp)) {
		timetoggle = true;
		timeUp++;
	} else {
		timescale = 1;
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
		(e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.clientWidth),
		(e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.clientHeight)
	];
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
	activeKeys.push(e.keyCode);

	if (keyDown(controls.speedUp)) {
		timeUp += 1;
	}
};

window.onkeyup = function (e) {
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