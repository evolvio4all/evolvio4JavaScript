const display = document.getElementById("canvas");
const ctx = display.getContext("2d", {
	alpha: false
});

const viewport = document.getElementById("viewport");
const ctz = viewport.getContext("2d", {
	alpha: false
});

// VARIABLES //

const layers = [10, 6, 4];

let tick = 0;
let tc = 0;

let timescale = 1;
let creatures = [];

let grv = 1;

let population = 0;

let timetoggle = false;

let selectedCreature = null;

let cropx = -1550;
let cropy = 0;

// FUNCTIONS //

function newColor() {
	let h = Math.floor(seededNoise() * 360);
	let s = Math.floor(seededNoise() * 100);
	let l = Math.floor(seededNoise() * 100);

	return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

function newSeed() {
	return Math.floor(Math.random() * 1000000);
}

function seededNoise() {
	let date = new Date();
	grv++;
	return (Math.abs(Math.sin(seed) + seed * grv * Math.tan(grv) * Math.cos(grv) / Math.cos(seed / 5) + Math.tan(seed))) % 1;
}

CanvasRenderingContext2D.prototype.fillCircle = function(x, y, r, s) {
	this.beginPath();
	this.arc(x, y, r, 0, 2 * Math.PI);
	this.closePath();

	this.fill();
	if (s) this.stroke();
};