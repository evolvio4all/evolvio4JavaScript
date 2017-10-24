const display = document.getElementById("canvas");
const ctx = display.getContext("2d");

let timescale = 1;
let creatures = [];

function Creature(x, y, s, c) {
	this.x = x || Math.random() * 1920;
	this.y = y || Math.random() * 1080;

	this.size = s || Math.random() * (maxCreatureSize - minCreatureSize) + minCreatureSize;
	this.color = c || newColor();
}

function newColor() {
	let h = Math.floor(Math.random() * 360);
	let s = Math.floor(Math.random() * 100);
	let l = Math.floor(Math.random() * 100);
	
	return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

let test = new Creature(1920 / 2, 1080 / 2, 20);
creatures.push(test);