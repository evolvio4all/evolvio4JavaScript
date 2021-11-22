var background = document.body.style.background;

var lcx = 0;
var lcy = 0;

function checkKey(key) {
  // checks an incoming key
  lastKey = key;

  if (keyDown(controls.play) && keyToggle) {
    timescale = 1;
    autoMode = false;

    keyToggle = false;
  } else if (keyDown(controls.fastForward) && keyToggle) {
    if (timescale >= 0) {
      if (timescale == 0) timescale = 0.0625;
      timescale *= 2;
    } else if (timescale < -0.125) {
      timescale /= 2;
    } else timescale = 0;

    keyToggle = false;
  } else if (keyDown(controls.stop) && keyToggle) {
    autoMode = false;

    if (timescale <= 0) {
      if (timescale == 0) timescale = -0.0625;
      timescale *= 2;
    } else if (timescale > 0.125) {
      timescale /= 2;
    } else timescale = 0;

    keyToggle = false;
  }
  if (keyDown(controls.auto) && keyToggle && !autoMode) {
    autoMode = true;
    update(true);
    keyToggle = false;
  }

  if (keyDown(controls.debug) && keyToggle) {
    debugMode = !debugMode;

    keyToggle = false;
  }

  if (keyDown(controls.info) && keyToggle) {
    infoMode = !infoMode;

    keyToggle = false;
  }

  if (keyDown(controls.scent) && keyToggle) {
    scentMode = !scentMode;

    keyToggle = false;
  }

  if (keyDown(controls.speciesGraphMode) && keyToggle) {
    speciesGraphOn = !speciesGraphOn;

    keyToggle = false;
  }

  if (keyDown(controls.speciesGraphLeft)) {
    speciesGraphDial += speciesGraphScrollSpeed;
    speciesGraphAutoDial = false;
  }

  if (keyDown(controls.speciesGraphRight)) {
    speciesGraphDial -= speciesGraphScrollSpeed;
    speciesGraphAutoDial = false;
  }

  if (keyDown(controls.speciesGraphDial) && keyToggle) {
    speciesGraphAutoDial = true;

    keyToggle = false;
  }

  if (keyDown(controls.brainDisplayMode) && keyToggle) {
    brainDisplayMode = !brainDisplayMode;

    keyToggle = false;
  }

  if (keyDown(controls.background) && keyToggle) {
    uiBackground = !uiBackground;

    keyToggle = false;
  }
}

var mouse = {
  up: {
    x: 0,
    y: 0
  },
  down: {
    x: 0,
    y: 0
  },
  current: {
    x: 0,
    y: 0
  },
  isdown: false
};

function getMousePos(e) {
  return [
    (e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.clientWidth),
    (e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.clientHeight)
  ];
}

window.onkeydown = function(e) {
  activeKeys.push(e.keyCode);
};

window.onmousedown = function(e) {
  mouse.down.x = getMousePos(e)[0];
  mouse.down.y = getMousePos(e)[1];

  mouse.isdown = true;

  selectedCreature = null;

  for (let creature of creatures) {
    if (select(creature)) {
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

  if (brainDisplayMode) hoverSelectedNeuron(e)
};


var zoomCache = zoomLevel;
window.onwheel = function(e) {
  zoomCache = zoomLevel;
  var zoomAmount = Math.max(Math.min(-e.deltaY, 1), -1) * zoomSpeed * zoomCache;

  zoomLevel += zoomAmount;

  if (zoomLevel < minZoomLevel) {
    zoomLevel = minZoomLevel;
  } else
  if (zoomLevel > maxZoomLevel) {
    zoomLevel = maxZoomLevel;
  }

  var trueZoomAmount = zoomLevel - zoomCache;

  mouse.current.x = getMousePos(e)[0];
  mouse.current.y = getMousePos(e)[1];

  var bzoom = {};
  zoomLevel -= trueZoomAmount;
  bzoom.x = (cropx + mouse.current.x) / zoomLevel;
  bzoom.y = (cropy + mouse.current.y) / zoomLevel;

  var azoom = {};

  zoomLevel += trueZoomAmount;

  azoom.x = (cropx + mouse.current.x) / zoomLevel;
  azoom.y = (cropy + mouse.current.y) / zoomLevel;

  cropx += (bzoom.x - azoom.x) * zoomLevel;
  cropy += (bzoom.y - azoom.y) * zoomLevel;

  multiple = tileSize * zoomLevel;
};

function keyDown(key) {
  if (activeKeys.indexOf(keys[key.toLowerCase()]) > -1) return true;
  return false;
}

window.onkeyup = function(e) {
  if (e.keyCode == keys[controls.fastForward] && fastforward) {
    fastforward = false;
    timescale /= 3;
  }

  var z = activeKeys.indexOf(e.keyCode);
  toggle = true;

  var activeKeysLength = activeKeys.length - 1
  for (let i = activeKeysLength; i >= 0; i--) {
    activeKeys.splice(z, 1);

    activeKeys.indexOf(e.keyCode);
    if (z == -1) break;
  }

  keyToggle = true;
};