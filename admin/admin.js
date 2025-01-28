// admin.js
//------------------------------------------------
const socket = io(); // main server

// Example: Launch Trivia
document.getElementById("btnLaunchTrivia").addEventListener("click", () => {
    socket.emit("adminCommand", { command: "launchGame", game: "trivia" });
});

document.getElementById("btnLaunchRace").addEventListener("click", () => {
    socket.emit("adminCommand", { command: "launchGame", game: "race" });
});

document.getElementById("btnLaunch2048").addEventListener("click", () => {
    socket.emit("adminCommand", { command: "launchGame", game: "2048" });
});

document.getElementById("btnStopGame").addEventListener("click", () => {
    socket.emit("adminCommand", { command: "stopGame" });
});

// Listen for adminResponse
socket.on("adminResponse", (msg) => {
    // Show some status
    document.getElementById("status").textContent = msg;
});

