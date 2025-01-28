// File: games/race/public/race.js
//-------------------------------------------------------

// 1) Connect to main namespace for admin events
const mainSocket = io("/");

// 2) Connect to race-specific namespace
const raceSocket = io("/race-ns");

// DOM references
const teamAScoreEl = document.getElementById("teamAScore");
const teamBScoreEl = document.getElementById("teamBScore");
const gameAreaEl = document.getElementById("gameArea");

// Listen for "gameStopped"
mainSocket.on("gameStopped", (data) => {
    if (data.gameName === "race") {
        stopCurrentGame("race");
    }
});

// If needed, also handle "activeGameChanged"
// mainSocket.on("activeGameChanged", (data) => { ... });

// Score updates from the race namespace
raceSocket.on("raceScores", (scores) => {
    teamAScoreEl.textContent = scores.teamAScore;
    teamBScoreEl.textContent = scores.teamBScore;
});

// Example: completing a lap by pressing "L"
document.addEventListener("keydown", (e) => {
    if (e.key === "l" || e.key === "L") {
        raceSocket.emit("lapComplete");
    }
});

/** Stop the current race with a message and countdown */
function stopCurrentGame(gameName) {
    // Clear or disable game area
    gameAreaEl.innerHTML = "";

    // Show message
    const msg = document.createElement("div");
    msg.innerHTML = `
    <p>The game <strong>${gameName}</strong> has been stopped by the Game Master. A new game will begin soon.</p>
    <p>Redirecting to the lobby in <span id="countdown">7</span> seconds 
       or <a href="/">click here</a>.</p>
  `;
    document.body.appendChild(msg);

    let counter = 7;
    const interval = setInterval(() => {
        counter--;
        const cd = document.getElementById("countdown");
        if (cd) cd.textContent = counter;
        if (counter <= 0) {
            clearInterval(interval);
            window.location.href = "/";
        }
    }, 1000);
}
