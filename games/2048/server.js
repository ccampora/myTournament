// File: games/2048/server.js
//------------------------------------------------
const express = require("express");
const path = require("path");

module.exports = function setup2048(io, scoreboard) {
    const router = express.Router();

    // Serve the 2048 public folder
    router.use(express.static(path.join(__dirname, "public")));

    const gameNsp = io.of("/game-2048-ns");

    // Example: single board or team-based boards
    // For brevity, let's do a single-board approach:
    let board = createEmptyBoard();

    // Listen for connections
    gameNsp.on("connection", (socket) => {
        console.log("2048 client connected:", socket.id);

        if (!scoreboard.users[socket.id]) {
            scoreboard.addUser(socket.id, "2048-" + socket.id.slice(0, 4));
        }

        // Send board to new user
        socket.emit("boardUpdate", board);

        socket.on("makeMove", (direction) => {
            // Perform merges, track points, spawn tile
            let points = moveBoard(board, direction);
            scoreboard.users[socket.id].gameScores["2048"] += points;
            scoreboard.users[socket.id].totalScore += points;
            spawnRandomTile(board);

            // Broadcast updated board
            gameNsp.emit("boardUpdate", board);
        });

        socket.on("disconnect", () => {
            scoreboard.removeUser(socket.id);
        });
    });

    // Minimal 2048 board logic
    function createEmptyBoard() {
        return [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
    }
    function spawnRandomTile(board) {
        // ...
    }
    function moveBoard(board, direction) {
        // ...
        return 2; // placeholder points
    }

    return router;
};
