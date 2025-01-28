const socket = io("/2048"); // Connect to the 2048 namespace

// DOM Elements
const boardEl = document.getElementById("board");

// Render the 2048 board
function renderBoard(board) {
    // const boardElement = document.getElementById('board');
    // if (!boardElement) return;

    boardEl.innerHTML = ""; // Clear previous board
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.textContent = board[r][c] === 0 ? "" : board[r][c];
            tile.classList.add(`tile-${board[r][c]}`); // Add class for styling
            boardEl.appendChild(tile);
        }
    }
}

// Listen for board updates from the server
socket.on("boardUpdate", (board) => {
    console.log("Received board update:", board);
    renderBoard(board);
});

// Handle arrow key presses
document.addEventListener("keydown", (e) => {
    let direction = null;
    if (e.key === "ArrowUp") direction = "up";
    if (e.key === "ArrowDown") direction = "down";
    if (e.key === "ArrowLeft") direction = "left";
    if (e.key === "ArrowRight") direction = "right";
    if (direction) {
        socket.emit("move", direction);
    }
});
