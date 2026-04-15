/* ========================================
   GRID MANAGER — Handles territory capture
   Uses a 2D grid to track captured cells.
   Flood-fill based area capture.
   ======================================== */

class GridManager {
    constructor(scene) {
        this.scene = scene;
        this.cellSize = GAME_CONFIG.CELL_SIZE;
        this.cols = Math.floor(GAME_CONFIG.MAP_WIDTH / this.cellSize);
        this.rows = Math.floor(GAME_CONFIG.MAP_HEIGHT / this.cellSize);
        this.totalCells = this.cols * this.rows;

        // Grid state: 0 = uncaptured, 1 = captured
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = new Array(this.cols).fill(0);
        }

        // Graphics object for rendering captured area
        this.capturedGraphics = scene.add.graphics();
        this.capturedGraphics.setDepth(1);

        // Give player a small starting area at center
        this._captureStartingArea();
    }

    /** Capture a small block at center so the player has a safe zone */
    _captureStartingArea() {
        const cx = Math.floor(this.cols / 2);
        const cy = Math.floor(this.rows / 2);
        const half = 3;
        for (let r = cy - half; r <= cy + half; r++) {
            for (let c = cx - half; c <= cx + half; c++) {
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    this.grid[r][c] = 1;
                }
            }
        }
        this._redraw();
    }

    /** Convert world position to grid col/row */
    worldToGrid(x, y) {
        return {
            col: Math.floor(x / this.cellSize),
            row: Math.floor(y / this.cellSize),
        };
    }

    /** Check if a world position is inside captured territory */
    isCaptured(x, y) {
        const { col, row } = this.worldToGrid(x, y);
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
        return this.grid[row][col] === 1;
    }

    /** Get current capture percentage */
    getCapturePercent() {
        let count = 0;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === 1) count++;
            }
        }
        return (count / this.totalCells) * 100;
    }

    /**
     * Capture area from a completed trail.
     * Strategy: mark trail cells, then flood-fill from edges to find
     * exterior cells, everything else becomes captured.
     */
    captureFromTrail(trailPoints) {
        if (trailPoints.length < 4) return 0;

        const prevPercent = this.getCapturePercent();

        // 1. Build a temp grid: 0 = empty, 1 = already captured, 2 = trail
        const temp = [];
        for (let r = 0; r < this.rows; r++) {
            temp[r] = new Array(this.cols).fill(0);
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === 1) {
                    temp[r][c] = 1;
                }
            }
        }

        // Rasterize trail onto temp grid
        for (let i = 0; i < trailPoints.length - 1; i++) {
            const p1 = trailPoints[i];
            const p2 = trailPoints[i + 1];
            this._rasterizeLine(temp, p1.x, p1.y, p2.x, p2.y, 2);
        }
        // Close the loop — connect last point back to first
        const first = trailPoints[0];
        const last = trailPoints[trailPoints.length - 1];
        this._rasterizeLine(temp, last.x, last.y, first.x, first.y, 2);

        // 2. Flood-fill from all border cells that are 0 (exterior)
        //    Using a flat array + index-based queue for performance
        const visited = new Uint8Array(this.rows * this.cols);

        // Use an array as a queue with a head pointer (avoids slow shift())
        const queue = [];
        let head = 0;

        // Seed flood from all edge cells
        for (let c = 0; c < this.cols; c++) {
            if (temp[0][c] === 0 && !visited[c]) {
                visited[c] = 1;
                queue.push(c); // row=0, flat index = 0*cols + c = c
            }
            const bottomIdx = (this.rows - 1) * this.cols + c;
            if (temp[this.rows - 1][c] === 0 && !visited[bottomIdx]) {
                visited[bottomIdx] = 1;
                queue.push(bottomIdx);
            }
        }
        for (let r = 1; r < this.rows - 1; r++) {
            const leftIdx = r * this.cols;
            if (temp[r][0] === 0 && !visited[leftIdx]) {
                visited[leftIdx] = 1;
                queue.push(leftIdx);
            }
            const rightIdx = r * this.cols + (this.cols - 1);
            if (temp[r][this.cols - 1] === 0 && !visited[rightIdx]) {
                visited[rightIdx] = 1;
                queue.push(rightIdx);
            }
        }

        // BFS flood-fill exterior (uses head pointer instead of shift)
        const cols = this.cols;
        const rows = this.rows;
        while (head < queue.length) {
            const idx = queue[head++];
            const r = Math.floor(idx / cols);
            const c = idx % cols;

            // Check 4 neighbors
            // Up
            if (r > 0) {
                const ni = (r - 1) * cols + c;
                if (!visited[ni] && temp[r - 1][c] === 0) {
                    visited[ni] = 1;
                    queue.push(ni);
                }
            }
            // Down
            if (r < rows - 1) {
                const ni = (r + 1) * cols + c;
                if (!visited[ni] && temp[r + 1][c] === 0) {
                    visited[ni] = 1;
                    queue.push(ni);
                }
            }
            // Left
            if (c > 0) {
                const ni = r * cols + (c - 1);
                if (!visited[ni] && temp[r][c - 1] === 0) {
                    visited[ni] = 1;
                    queue.push(ni);
                }
            }
            // Right
            if (c < cols - 1) {
                const ni = r * cols + (c + 1);
                if (!visited[ni] && temp[r][c + 1] === 0) {
                    visited[ni] = 1;
                    queue.push(ni);
                }
            }
        }

        // 3. Everything not visited and not already captured = interior → capture
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!visited[r * cols + c]) {
                    this.grid[r][c] = 1;
                }
            }
        }

        this._redraw();

        const newPercent = this.getCapturePercent();
        return newPercent - prevPercent;
    }

    /** Bresenham line rasterization on the grid */
    _rasterizeLine(grid, x1, y1, x2, y2, value) {
        let c1 = Math.floor(x1 / this.cellSize);
        let r1 = Math.floor(y1 / this.cellSize);
        const c2 = Math.floor(x2 / this.cellSize);
        const r2 = Math.floor(y2 / this.cellSize);

        const dc = Math.abs(c2 - c1);
        const dr = Math.abs(r2 - r1);
        const sc = c1 < c2 ? 1 : -1;
        const sr = r1 < r2 ? 1 : -1;
        let err = dc - dr;

        // Safety limit to prevent infinite loop from edge cases
        let maxSteps = dc + dr + 2;

        while (maxSteps-- > 0) {
            if (r1 >= 0 && r1 < this.rows && c1 >= 0 && c1 < this.cols) {
                if (grid[r1][c1] === 0) {
                    grid[r1][c1] = value;
                }
            }
            if (c1 === c2 && r1 === r2) break;
            const e2 = 2 * err;
            if (e2 > -dr) { err -= dr; c1 += sc; }
            if (e2 < dc) { err += dc; r1 += sr; }
        }
    }

    /** Redraw all captured cells */
    _redraw() {
        this.capturedGraphics.clear();
        this.capturedGraphics.fillStyle(GAME_CONFIG.CAPTURED_COLOR, GAME_CONFIG.CAPTURED_ALPHA);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === 1) {
                    this.capturedGraphics.fillRect(
                        c * this.cellSize,
                        r * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }
    }

    destroy() {
        if (this.capturedGraphics) {
            this.capturedGraphics.destroy();
        }
    }
}
