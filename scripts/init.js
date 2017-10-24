const display = document.getElementById("canvas");
const ctx = display.getContext("2d");

const layers = [3, 4, 5];

let timescale = 1;
let creatures = [];

function newColor() {
	let h = Math.floor(Math.random() * 360);
	let s = Math.floor(Math.random() * 100);
	let l = Math.floor(Math.random() * 100);
	
	return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

let test = new Creature(1920 / 2, 1080 / 2, 20);
creatures.push(test);