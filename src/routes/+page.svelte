<script>
	import Game from "../lib/game";
	import { onMount } from "svelte";

	/** @type {Game} */
	let game;

	let fps = 0;

	let zoom = 20;
	let debug = false;
	let mouse_world_pos = {x: 0, y: 0};

	/** @type { { [key: string]: boolean } } */
	let keys = {};
	
	$: game ? game.keys = keys : null;

	$: game ? game.camera.zoom = zoom : null;
	$: if (game && keys["d"]) {debug = true} else {debug = false};

	let running = false;
	let interval = 1000;

	const step = () => {
		if (running) {
			game.step();
		}
		setTimeout(step, interval);
	};

	onMount(() => {
		const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas"));

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		window.addEventListener("resize", () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		});

		/** @type {import("../lib/game").default} */
		game = new Game(canvas, {
			width: 500,
			height: 500,
			backgroundColor: "white",
			cellColor: "black",
			cameraMoveSpeed: 0.05,
		}, keys);

		setInterval(() => {
			//game.step();
			fps = game.fps;
		}, 500);

		game.render();

		window["game"] = game;

		document.addEventListener("keydown", e => {
			keys[e.key] = true;
			keys = { ...keys }; // force update
			game.handleKeydown(e);
		});
		document.addEventListener("keyup", e => {
			keys[e.key] = false;
			keys = { ...keys }; // force update
			game.handleKeyup(e);
		});
		canvas.addEventListener("mousedown", e => {
			game.handleMousedown(e)});
		canvas.addEventListener("wheel", e => {
			e.preventDefault();
			game.handleWheel(e);
			zoom = game.camera.zoom;
		}, { passive: false });
		canvas.addEventListener("mousemove", e => {
			game.handleMousemove(e);
			mouse_world_pos = game.camera.screenToWorld(e.clientX, e.clientY);
		});
		canvas.addEventListener("mouseup", e => game.handleMouseup(e));

		step();
	});
</script>

<div class="controls">
	<div>
		<label for="zoom">Zoom: </label>
		<input type="range" min="1" max="300" bind:value={zoom} />
	</div>
	<div>
		<label for="speed">Speed ({interval}ms): </label>
		<input type="range" min="0" max="1000" bind:value={interval} />
	</div>
	<button on:click={() => game.step()}>Step</button>
	<button on:click={() => game.board.forEach(c => c.fill(false))}>Clear</button>
	<button on:click={() => game.board.forEach(c => c.fill(true))}>Fill</button>
	<button on:click={() => running = !running}>{running ? "Stop" : "Start"}</button>

</div>

{#if debug}
	<div class="debug">
		<label for="mouse-world-coords">Mouse World Coords: {mouse_world_pos.x}, {mouse_world_pos.y}</label>
	</div>
{/if}

<canvas id="canvas"></canvas>

<style>
	* {
		text-align: center;
		margin: auto;
	}

	#canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		z-index: -1;
	}

	.controls {
		display: flex;
	}

	.controls > * {
		flex-grow: 0;
		gap: 10px;
		margin: 10px;
	}

	.controls > div {
		display: flex;
		align-items: center;
	}

	.debug { /* Right corner */
		position: absolute;
		top: 0;
		right: 0;
		background-color: white;
		padding: 10px;
	}
</style>