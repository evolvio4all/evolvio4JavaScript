function main() {
	for (let i = 0; i < timescale; i++) {
		update();
		render();
	}
}

function update() {

}

function render() {
	ctx.clearRect(0, 0, display.width, display.height);

	for (let i in creatures) {
		ctx.fillStyle = creatures[i].color;
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = 5;
		
		ctx.beginPath();
		ctx.arc(creatures[i].x, creatures[i].y, creatures[i].size, 0, 2 * Math.PI);
		ctx.closePath();
		
		ctx.fill();
		ctx.stroke();
	}
}

setInterval(main, 1000 / 100);