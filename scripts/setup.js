seed = hashString(seed)();

const axonTypes = ["+", "*", "/", "-"];

var hoveredNeuron = [-1, -1];

var varAOK = true;

var tick = 0;
var tc = 0;
var timescale = 1;
var population = 0;
var oldest = 0;

var pause = false;

var fastforward = false;

var debugToggle = false;

var lastTick = -1;

var maxNewSpeciesTries = 200;

var creatures = [];
var selectedCreature = null;

var updating = false;

var energyGraph = {
  eat: [],
  move: [],
  metabolism: [],
  attack: [],
  birth: [],
  net: [],
  gain: [],
  loss: [],
  total: []
};

var season = 0;
var seasonUp = true;
var day = 0;

var highestSimulatedTick = 0;

const tickList = [];

var replacer = ['x', 'y', 'output', 'network', 'color', 'rotation', 'eyes', 'energy', 'size', 'main', 'forget', 'decide', 'modify', 'cellState', 'neurons', 'energyGraph', 'gross', 'net', 'attack', 'eat', 'move', 'metabolism', 'age'];

var firstGen = 0;

var specieslist = {};
var prefixes = ["Feles", "Canis", "Elephantus", "Porcus", "Vacca", "Apis", "Lupus", "Cervus", "Cerva", "Equus", "Leo", "Avis", "Serpentis", "Vulpes", "Polypus", "Apris", "Formica", "Ovis", "Sciurus", "Neotoma", "Dipodomys", "Chelicerata", "Crustacea", "Insecta", "Arachnida", "Craniforma", "Chilopoda", "Amphibia", "Acoela", "Clitellata", "Echiura", "Sipuncula", "Myzostomida", "Xiphosura", "Maxillopoda", "Malacostraca", "Mandibulata", "Malacostraca", "Anopheles", "Aedes", "Culex", "Zygentoma", "Archaeognatha", "Diplura", "Volantis", "Passer", "Patella", "Coccymys", "Syngamia", "Chrysomya", "Nepenthes", "Microtus", "Veronica", "Agrestis", "Amblyrhynchus", "Cristatus", "Ursus", "Hyperoodon", "Scalopus", "Sceloporus", "Zenaida", "Cygnus", "Sauromalus", "Fulica", "Achillea", "Semotilus", "Eubalaena", "Taxus", "Conus", "Erignathus", "Micrelaps", "Mallos", "Brachycephalus", "Brachyphylla", "Holochilus", "Brunneria", "Ceratogymna", "Meloe", "Rieppeleon", "Lophiotoma", "Ceratosoma", "Unga", "Bunga", "T-", "Mark", "Aaron", "Michael", "Denny", "Rick", "Morty", "Fart", "Conk", "Stonk", "saur"];
var suffixes = ["Unus", "Duo", "Tribus", "Quattuor", "Quinque", "Sex", "Septem", "Octo", "Novem", "Decem", "Undecim", "Duodecim", "Tredecim", "Quattuordecim", "Quindecim", "Sedecim", "Septendecim", "Duodeviginti", "Undeviginti", "Viginti"];

var lastKey = NaN;
var toggle = false;

var speciesGraph = [];
var speciesColors = [];
var speciesCountList = [];
var currentSpeciesGraphIndex = 0;

var speciesGraphDial = 0;
var speciesGraphAutoDial = true;

var waterTexture = new Image();
waterTexture.src = "./topwater.jpg";

var waterScrollX = -1000;
var waterScrollY = -1000;

var waterDirection = true;

var speciesGraphOn = false;


var noiseChain = [];

var keyToggle = true;

var brainNames = ["main"];
// FUNCTIONS //

function newColor(noiseGroup) {
  if (noiseGroup) {
    var h = Math.floor(seededNoiseB(0, 360));
  } else {
    var h = Math.floor(seededNoiseA(0, 360));
  }

  var l = 50;

  return "hsl(" + h + ", " + 100 + "%, " + l + "%)";
}

function sortByHighestValue(a, b) {
  var aMax = 0;
  var bMax = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > aMax) {
      aMax = a[i];
    }
  }

  for (let i = 0; i < b.length; i++) {
    if (b[i] > bMax) {
      bMax = b[i];
    }
  }

  return aMax - bMax;
}

function strDifference(str1, str2) {
  var value = 0;
  for (let i = 2; i < str1.length; i++) {
    value += Math.abs(str1[i] - str2[i]);
  }
  return value;
}

function arrayDifference(arr1, arr2) {
  var value = 0;

  for (let i = 0; i < arr1.length; i++) {
    value += Math.abs(arr1[i] - arr2[i]);
  }

  return value;
}

function leakyRELU(x) {
  if (x < 0) {
    return 0.01 * x;
  } else {
    return x;
  }

  return 0;
}

function flatten(arr) {
  return arr.reduce(function(flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

CanvasRenderingContext2D.prototype.fillCircle = function(x, y, r, s) {
  this.beginPath();
  this.arc(x, y, r, 0, 2 * Math.PI);
  this.closePath();

  this.fill();
  if (s) this.stroke();
};

// LINE/CIRCLE
function lineCircle(x1, y1, x2, y2, cx, cy, r) {

  // is either end INSIDE the circle?
  // if so, return true immediately
  var inside1 = pointCircle(x1, y1, cx, cy, r);
  var inside2 = pointCircle(x2, y2, cx, cy, r);
  if (inside1 || inside2) return true;

  // get length of the line
  var distX = x1 - x2;
  var distY = y1 - y2;
  var len = Math.sqrt((distX * distX) + (distY * distY));

  // get dot product of the line and circle
  var dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / Math.pow(len, 2);

  // find the closest point on the line
  var closestX = x1 + (dot * (x2 - x1));
  var closestY = y1 + (dot * (y2 - y1));

  // is this point actually on the line segment?
  // if so keep going, but if not, return false
  var onSegment = linePoint(x1, y1, x2, y2, closestX, closestY);
  if (!onSegment) return false;

  // get distance to closest point
  distX = closestX - cx;
  distY = closestY - cy;
  var distance = Math.sqrt((distX * distX) + (distY * distY));

  if (distance <= r) {
    return true;
  }
  return false;
}


// POINT/CIRCLE
function pointCircle(px, py, cx, cy, r) {

  // get distance between the point and circle's center
  // using the Pythagorean Theorem
  var distX = px - cx;
  var distY = py - cy;
  var distance = Math.sqrt((distX * distX) + (distY * distY));

  // if the distance is less than the circle's
  // radius the point is inside!
  if (distance <= r) {
    return true;
  }
  return false;
}

Math.dist = function(x1, y1, x2, y2) {
  if (!x2) x2 = 0;
  if (!y2) y2 = 0;
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}


// LINE/POINT
function linePoint(x1, y1, x2, y2, px, py) {

  // get distance from the point to the two ends of the line
  var d1 = Math.dist(px, py, x1, y1);
  var d2 = Math.dist(px, py, x2, y2);

  // get the length of the line
  var lineLen = Math.dist(x1, y1, x2, y2);

  // since floats are so minutely accurate, add
  // a little buffer zone that will give collision
  var buffer = 0.1; // higher # = less accurate

  // if the two distances are equal to the line's
  // length, the point is on the line!
  // note we use the buffer here to give a range,
  // rather than one #
  if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
    return true;
  }
  return false;
}

function hashString(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
    h = h << 13 | h >>> 19;
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}