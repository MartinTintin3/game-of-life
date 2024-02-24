// Conways Game of Life.

import { step, type Board, Camera, type Config } from "./util";

export default class Game {
	ctx: CanvasRenderingContext2D;
	board: Board;
	camera: Camera;
	lastRender: number = 0;
	fps: number = 0;
	debug: boolean = false;

	mouseDown: boolean = false;
	mousePos: { x: number, y: number } | null = null;

	constructor(canvas: HTMLCanvasElement, public config: Config, public keys: { [key: string]: boolean }) {
		this.board = new Array(config.width).fill(null).map(() => new Array(config.height).fill(false));

		// simple glider at the center
		this.board[config.width / 2][config.height / 2] = true;
		this.board[config.width / 2 + 1][config.height / 2] = true;
		this.board[config.width / 2 - 1][config.height / 2] = true;
		this.board[config.width / 2][config.height / 2 - 2] = true;
		this.board[config.width / 2 + 1][config.height / 2 - 1] = true;


		this.camera = new Camera({ x: config.width / 2, y: config.height / 2 }, 10, canvas.getContext("2d")!);

		this.ctx = canvas.getContext("2d")!;
	}

	/**
	 * Plays one step of the game of life
	 */
	public step() {
		this.board = step(this.board);
	}

	public toggle(x: number, y: number) {
		if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) return;
		this.board[x][y] = !this.board[x][y];
	}

	public set(x: number, y: number, value: boolean) {
		if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) return;
		this.board[x][y] = value;
	}

	public get(x: number, y: number): boolean {
		if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) return false;
		return this.board[x][y];
	}

	/**
	 * Renders the game of life
	 */
	public render() {
		this.fps = 1000 / (performance.now() - this.lastRender);

		this.ctx.fillStyle = this.config.backgroundColor;
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

		this.ctx.fillStyle = this.config.cellColor;

		for (let x = 0; x < this.config.width; x++) {
			for (let y = 0; y < this.config.height; y++) {
				if (this.get(x, y)) {
					const { x: screenX, y: screenY } = this.camera.worldToScreen(x, y);
					this.ctx.fillRect(screenX, screenY, this.camera.zoom, this.camera.zoom);
				}
			}
		}

		// Render grid
		this.ctx.strokeStyle = "black";
		this.ctx.lineWidth = 0.1;
		
		const topLeft = this.camera.screenToWorld(0, 0);
		const bottomRight = this.camera.screenToWorld(this.ctx.canvas.width, this.ctx.canvas.height);

		const worldBorderTopLeft = this.camera.worldToScreen(0, 0);
		const worldBorderBottomRight = this.camera.worldToScreen(this.config.width, this.config.height);

		for (let x = topLeft.x; x <= bottomRight.x; x++) {
			if (x < 0 || x >= this.config.width + 1) continue; // don't render outside the board
			const { x: screenX } = this.camera.worldToScreen(x, 0);
			this.ctx.beginPath();
			this.ctx.moveTo(screenX, worldBorderTopLeft.y > 0 ? worldBorderTopLeft.y : 0);
			this.ctx.lineTo(screenX, worldBorderBottomRight.y < this.ctx.canvas.height ? worldBorderBottomRight.y : this.ctx.canvas.height);
			this.ctx.stroke();
		}

		for (let y = topLeft.y; y <= bottomRight.y; y++) {
			if (y < 0 || y >= this.config.height + 1) continue; // don't render outside the board
			const { y: screenY } = this.camera.worldToScreen(0, y);
			this.ctx.beginPath();
			this.ctx.moveTo(worldBorderTopLeft.x > 0 ? worldBorderTopLeft.x : 0, screenY);
			this.ctx.lineTo(worldBorderBottomRight.x < this.ctx.canvas.width ? worldBorderBottomRight.x : this.ctx.canvas.width, screenY);
			this.ctx.stroke();
		}

		// move wasd, use lastRender as delta

		/*let factor = 1;

		if (this.keys["w"] && this.keys["a"] && !this.keys["s"] && !this.keys["d"]) factor = 0.70710678118;
		if (this.keys["w"] && this.keys["d"] && !this.keys["s"] && !this.keys["a"]) factor = 0.70710678118;
		if (this.keys["s"] && this.keys["a"] && !this.keys["w"] && !this.keys["d"]) factor = 0.70710678118;
		if (this.keys["s"] && this.keys["d"] && !this.keys["w"] && !this.keys["a"]) factor = 0.70710678118;

		if (this.keys["w"]) this.camera.position.y -= this.config.cameraMoveSpeed * factor * (performance.now() - this.lastRender);
		if (this.keys["s"]) this.camera.position.y += this.config.cameraMoveSpeed * factor * (performance.now() - this.lastRender);
		if (this.keys["a"]) this.camera.position.x -= this.config.cameraMoveSpeed * factor * (performance.now() - this.lastRender);
		if (this.keys["d"]) this.camera.position.x += this.config.cameraMoveSpeed * factor * (performance.now() - this.lastRender);*/

		this.lastRender = performance.now();

		requestAnimationFrame(() => this.render());
	}

	public handleKeydown(event: KeyboardEvent) {
		if (event.repeat) return;

		if (event.key == "Shift") window.document.body.style.cursor = "grab";
		else if (event.key == "d") this.debug = true;
	}

	public handleKeyup(event: KeyboardEvent) {
		if (!this.keys["Shift"]) {
			window.document.body.style.cursor = "default";
		}

		if (event.key == "d") this.debug = false;
	}

	public handleWheel(event: WheelEvent) {
		this.camera.zoom += -event.deltaY / 100;
		if (this.camera.zoom < 1) this.camera.zoom = 1;
		if (this.camera.zoom > 300) this.camera.zoom = 300;
	}

	public handleMousedown(event: MouseEvent) {
		if (event.button == 0 && !this.keys["Shift"]) {
			const { x, y } = this.camera.screenToWorld(event.clientX, event.clientY);

			this.toggle(x, y);
			if (this.keys["d"]) console.log(x, y, this.get(x, y));
		}

		this.mouseDown = true;
		this.mousePos = { x: event.clientX, y: event.clientY };
	}

	public handleMousemove(event: MouseEvent) {
		if (event.buttons % 2 == 1) {
			if (this.keys["Shift"]) {
				window.document.body.style.cursor = "grabbing";
				// move camera
				this.camera.position.x -= event.movementX / this.camera.zoom;
				this.camera.position.y -= event.movementY / this.camera.zoom;
			} else {
				const { x, y } = this.camera.screenToWorld(event.clientX, event.clientY);

				this.set(x, y, true);
			}
		}

		this.mousePos = { x: event.clientX, y: event.clientY };
	}

	public handleMouseup(event: MouseEvent) {	
		if (event.button % 2 == 0) {
			// normal
			window.document.body.style.cursor = this.keys["Shift"] ? "grab" : "default";
		}

		this.mouseDown = false;
	}
}