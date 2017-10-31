function keyEvents() {
	if (keyDown(controls.slowDown)) {
		timescale = 0.2;
	} else if (keyDown(controls.fastForward)) {
		timescale = 50;
	} else if (keyDown(controls.stop)) {
		timescale = 0;
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

window.onmousedown = function(e) {
	mouse.down.x = (e.clientX - viewport.getBoundingClientRect().left) * (viewport.width / viewport.clientWidth);
	mouse.down.y = (e.clientY - viewport.getBoundingClientRect().top) * (viewport.height / viewport.clientHeight);

	mouse.isdown = true;

	selectedCreature = null;

	for (let creature of creatures) {
		if (creature.select()) {
			selectedCreature = creature;
		}
	}
};

window.onmouseup = function(e) {
	mouse.up.x = (e.clientX - viewport.getBoundingClientRect().left) * (viewport.width / viewport.clientWidth);
	mouse.up.y = (e.clientY - viewport.getBoundingClientRect().top) * (viewport.height / viewport.clientHeight);

	mouse.isdown = false;
};

window.onmousemove = function(e) {
	mouse.current.x = (e.clientX - viewport.getBoundingClientRect().left) * (viewport.width / viewport.clientWidth);
	mouse.current.y = (e.clientY - viewport.getBoundingClientRect().top) * (viewport.height / viewport.clientHeight);

	if (mouse.isdown) {
		cropx += lcx - mouse.current.x;
		cropy += lcy - mouse.current.y;
	}

	lcx = mouse.current.x;
	lcy = mouse.current.y;
};

window.onmousewheel = function(e) {
	mouse.current.x = (e.clientX - viewport.getBoundingClientRect().left) * (viewport.width / viewport.clientWidth);
	mouse.current.y = (e.clientY - viewport.getBoundingClientRect().top) * (viewport.height / viewport.clientHeight);

	viewport.width -= e.wheelDelta;
	viewport.height -= e.wheelDelta * 0.5625;

	if (viewport.width > minZoomLevel) {
		viewport.width = minZoomLevel;
		viewport.height = minZoomLevel * 0.5625;
	}

	if (viewport.width < maxZoomLevel) {
		viewport.width = maxZoomLevel;
		viewport.height = maxZoomLevel * 0.5625;
	}
	
	cropx += lcx - mouse.current.x;
	cropy += lcy - mouse.current.y;
	
	lcx = mouse.current.x;
	lcy = mouse.current.y;
};

window.onkeydown = function(e) {
	activeKeys.push(e.keyCode);
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
