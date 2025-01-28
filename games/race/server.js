// File: games/race/server.js
//---------------------------------------------
const express = require("express");
const path = require("path");

module.exports = function setupRace(io, scoreboard) {
    const router = express.Router();

    // Serve the race public folder
    router.use(express.static(path.join(__dirname, "public")));

    // A separate namespace or room for Race
    const raceNsp = io.of("/race-ns");

    // In-memory race state
    let teamAScore = 0;
    let teamBScore = 0;
    // etc.

    raceNsp.on("connection", (socket) => {
        console.log("Race client connected:", socket.id);

        if (!scoreboard.users[socket.id]) {
            scoreboard.addUser(socket.id, "Racer-" + socket.id.slice(0, 4));
        }

        // Example: handle collisions or laps
        socket.on("lapComplete", (data) => {
            const user = scoreboard.users[socket.id];
            if (!user) return;
            if (user.team === "A") {
                teamAScore += 10;
            } else {
                teamBScore += 10;
            }
            user.gameScores.race += 10;
            user.totalScore += 10;

            // Broadcast updated scores
            raceNsp.emit("raceScores", { teamAScore, teamBScore });
        });

        socket.on("disconnect", () => {
            scoreboard.removeUser(socket.id);
        });
    });

    return router;
};
