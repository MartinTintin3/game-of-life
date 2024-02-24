export type Board = boolean[][];

export type Vector2 = {	x: number, y: number };

export type Config = {
	width: number;
	height: number;
	backgroundColor: string;
	cellColor: string;
	cameraMoveSpeed: number;
}

export class Camera {
	constructor(public position: Vector2, public zoom: number, private ctx: CanvasRenderingContext2D) { }

	public screenToWorld(x: number, y: number): Vector2 {
		const offsetX = Math.floor(this.ctx.canvas.width / 2);
		const offsetY = Math.floor(this.ctx.canvas.height / 2);

		const worldX = (x - offsetX) / this.zoom + this.position.x;
		const worldY = (y - offsetY) / this.zoom + this.position.y;

		return {
			x: Math.floor(worldX),
			y: Math.floor(worldY),
		};
	}

	public worldToScreen(x: number, y: number): Vector2 {
		const offsetX = Math.floor(this.ctx.canvas.width / 2);
		const offsetY = Math.floor(this.ctx.canvas.height / 2);

		return {
			x: (x - this.position.x) * this.zoom + offsetX,
			y: (y - this.position.y) * this.zoom + offsetY
		};
	}
}

export const getNeighbors = (board: Board, x: number, y: number): number => [
	board[x - 1]?.[y - 1],
	board[x]?.[y - 1],
	board[x + 1]?.[y - 1],
	board[x - 1]?.[y],
	board[x + 1]?.[y],
	board[x - 1]?.[y + 1],
	board[x]?.[y + 1],
	board[x + 1]?.[y + 1]
].filter(Boolean).length;

export const checkLife = (cell: boolean, neighbors: number): boolean => {
	if (cell) {
		if (neighbors < 2 || neighbors > 3) {
			return false; // underpopulation or overpopulation
		}
		return true; // lives on
	} else {
		if (neighbors == 3) {
			return true; // reproduction
		}
		return false; // stays dead
	}
}

/**
 * Plays one step of the game of life, returning a new board.
 * @param board 2d array of booleans
 */
export const step = (board: Board): Board => {
	const width = board.length;
	const height = board[0].length;

	const newBoard: Board = new Array(width).fill(null).map(() => new Array(height).fill(false));

	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			const neighbors = getNeighbors(board, x, y);

			newBoard[x][y] = checkLife(board[x][y], neighbors);
		}
	}

	return newBoard;
}