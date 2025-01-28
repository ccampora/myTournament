// File: games/trivia/server.js
//------------------------------------------------
const express = require("express");
const path = require("path");

module.exports = function setupTrivia(io, scoreboard) {
    // Create a sub-router
    const router = express.Router();

    // Serve the trivia public folder
    router.use(express.static(path.join(__dirname, "public")));

    // Example Socket.io namespace or use the main `io` with a "trivia" room
    const triviaNsp = io.of("/trivia-namespace");

    // Some in-memory trivia state
    let currentQuestionIndex = 0;
    let questions = [
        { text: "Which is NOT a programming language?", answers: ["Python", "Java", "HTML"], correct: 2 },
        { text: "2 + 2 = ?", answers: ["2", "4", "22"], correct: 1 }
    ];

    // Listen for connections on /trivia-namespace
    triviaNsp.on("connection", (socket) => {
        console.log("Trivia client connected:", socket.id);

        // On join, add user to scoreboard if needed
        if (!scoreboard.users[socket.id]) {
            scoreboard.addUser(socket.id, "Player-" + socket.id.slice(0, 4));
        }

        // Send current question
        socket.emit("triviaQuestion", getCurrentQuestion());

        socket.on("submitAnswer", (answerIndex) => {
            let correct = (answerIndex === questions[currentQuestionIndex].correct);
            if (correct) {
                scoreboard.users[socket.id].gameScores.trivia += 1;
                scoreboard.users[socket.id].totalScore += 1;
                triviaNsp.emit("triviaResult", { winner: scoreboard.users[socket.id].username });
                // Next question
                currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
                triviaNsp.emit("triviaQuestion", getCurrentQuestion());
            } else {
                socket.emit("triviaWrong", { msg: "Incorrect. Try next time." });
            }
        });

        socket.on("disconnect", () => {
            scoreboard.removeUser(socket.id);
        });
    });

    function getCurrentQuestion() {
        return {
            index: currentQuestionIndex,
            text: questions[currentQuestionIndex].text,
            answers: questions[currentQuestionIndex].answers
        };
    }

    return router;
};
