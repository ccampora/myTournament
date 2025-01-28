console.log("Loading 2048 game server...");

const express = require("express");
const { Server } = require("socket.io");
const path = require("path");

module.exports = (io, scoreboard) => {
    const router = express.Router();
    const namespace = io.of("/2048");

    const gameBoards = {}; // Store player boards { socketId: board }

    // Helper function to create an empty board
    function createEmptyBoard() {
        return [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
    }

    // Helper function to spawn a random tile (2 or 4)
    function spawnRandomTile(board) {
        const emptyTiles = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (board[r][c] === 0) {
                    emptyTiles.push({ r, c });
                }
            }
        }

        if (emptyTiles.length > 0) {
            const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            board[r][c] = Math.random() < 0.9 ? 2 : 4; // 90% chance of 2, 10% of 4
        }
    }

    // Helper function to slide and merge tiles
    function slideAndMerge(row) {
        const filteredRow = row.filter((val) => val !== 0); // Remove zeroes
        for (let i = 0; i < filteredRow.length - 1; i++) {
            if (filteredRow[i] === filteredRow[i + 1]) {
                filteredRow[i] *= 2; // Merge tiles
                filteredRow[i + 1] = 0; // Remove the second tile
            }
        }
        return filteredRow.filter((val) => val !== 0); // Remove zeroes again
    }

    // Helper function to move tiles in a given direction
    function move(board, direction) {
        let moved = false;
        if (direction === "up" || direction === "down") {
            for (let c = 0; c < 4; c++) {
                const col = [];
                for (let r = 0; r < 4; r++) {
                    col.push(board[r][c]);
                }
                const mergedCol = slideAndMerge(direction === "up" ? col : col.reverse());
                for (let r = 0; r < 4; r++) {
                    const newValue = direction === "up" ? mergedCol[r] || 0 : mergedCol[3 - r] || 0;
                    if (board[r][c] !== newValue) moved = true;
                    board[r][c] = newValue;
                }
            }
        } else {
            for (let r = 0; r < 4; r++) {
                const row = board[r];
                const mergedRow = slideAndMerge(direction === "left" ? row : row.reverse());
                for (let c = 0; c < 4; c++) {
                    const newValue = direction === "left" ? mergedRow[c] || 0 : mergedRow[3 - c] || 0;
                    if (board[r][c] !== newValue) moved = true;
                    board[r][c] = newValue;
                }
            }
        }
        return moved;
    }

    // Socket.io connection for players
    namespace.on("connection", (socket) => {
        console.log(`Player connected: ${socket.id}`);

        // Initialize the board for the player
        const board = createEmptyBoard();
        spawnRandomTile(board);
        spawnRandomTile(board);
        gameBoards[socket.id] = board;

        // Send the initial board to the player
        socket.emit("boardUpdate", board);

        // Handle player moves
        socket.on("move", (direction) => {
            const board = gameBoards[socket.id];
            if (move(board, direction)) {
                spawnRandomTile(board); // Only spawn a new tile if a move was made
                socket.emit("boardUpdate", board); // Send the updated board to the player
            }
        });

        // Handle player disconnection
        socket.on("disconnect", () => {
            console.log(`Player disconnected: ${socket.id}`);
            delete gameBoards[socket.id];
        });
    });

    // Serve the 2048 HTML file
    router.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    return router;
};
