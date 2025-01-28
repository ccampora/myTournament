// File: games/2048/public/2048.js
//------------------------------------------------------

// 1) Connect to the main namespace for admin events (stopGame, etc.)
const mainSocket = io("/");

// 2) Connect to the 2048-specific namespace (if you have one). 
//    Otherwise, you can just reuse the main namespace for game events, too.
const gameSocket = io("/game-2048-ns");

// DOM elements for displaying the board
const gridEl = document.getElementById("grid");

// Listen for gameStopped from the main namespace
mainSocket.on("gameStopped", (data) => {
    if (data.gameName === "2048") {
        stopCurrentGame("2048");
    }
});

// If you also handle activeGameChanged, you could do:
// mainSocket.on("activeGameChanged", (data) => { ... });

// Listen for board updates from the 2048 namespace
gameSocket.on("boardUpdate", (board) => {
    renderBoard(board);
});

// Pressing arrow keys to move tiles
document.addEventListener("keydown", (e) => {
    let direction = null;
    if (e.key === "ArrowUp") direction = "up";
    else if (e.key === "ArrowDown") direction = "down";
    else if (e.key === "ArrowLeft") direction = "left";
    else if (e.key === "ArrowRight") direction = "right";
    if (direction) {
        // Tell the server we made a move
        gameSocket.emit("makeMove", direction);
    }
});

/** Render a 4x4 board in the DOM */
function renderBoard(board) {
    gridEl.innerHTML = "";
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            let val = board[r][c];
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.textContent = (val === 0) ? "" : val;
            gridEl.appendChild(cell);
        }
    }
}

/** Stop the current game with a message + 7s countdown redirect */
function stopCurrentGame(gameName) {
    // Clear board or disable inputs
    gridEl.innerHTML = "";

    // Create a message area
    const msg = document.createElement("div");
    msg.innerHTML = `
    <p>The game <strong>${gameName}</strong> has been stopped by the Game Master. A new game will begin soon.</p>
    <p>Redirecting to the lobby automatically in <span id="countdown">7</span> seconds 
       or <a href="/">click here</a>.</p>
  `;
    document.body.appendChild(msg);

    // 7-second countdown
    let counter = 7;
    const interval = setInterval(() => {
        counter--;
        const countdownEl = document.getElementById("countdown");
        if (countdownEl) countdownEl.textContent = counter;
        if (counter <= 0) {
            clearInterval(interval);
            window.location.href = "/";
        }
    }, 1000);
}
