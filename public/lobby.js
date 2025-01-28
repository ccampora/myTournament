// File: public/lobby.js

const socket = io(); // Connect to the main server

console.log("Lobby script loaded");

// DOM Elements
const teamATotal = document.getElementById("teamATotal");
const teamBTotal = document.getElementById("teamBTotal");
const teamABody = document.getElementById("teamABody");
const teamBBody = document.getElementById("teamBBody");
const lobbyMessage = document.getElementById("lobbyMessage");
const launchMessage = document.getElementById("launchMessage");
const countdownEl = document.getElementById("countdown");

// Listen for when a game starts
socket.on("activeGameChanged", (data) => {
    console.log("Game changed to:", data.activeGame);

    if (data.activeGame) {
        // Show the launch message and start the countdown
        showLaunchCountdown(data.activeGame);
    } else {
        // Hide the launch message if no game is being launched
        hideLaunchMessage();
    }
});

// Listen for scoreboard updates
socket.on("scoreboardUpdate", (data) => {
    console.log("Received scoreboard update:", data);
    renderScoreboard(data);
});

function renderScoreboard(data) {
    console.log("Rendering scoreboard:", data);
    const { players, teamTotals } = data;

    // Update team totals
    teamATotal.textContent = teamTotals.A;
    teamBTotal.textContent = teamTotals.B;

    // Clear old content
    teamABody.innerHTML = "";
    teamBBody.innerHTML = "";

    // Render Team A players
    const teamAPlayers = players.filter((p) => p.team === "A");
    if (teamAPlayers.length === 0) {
        teamABody.innerHTML = `<tr><td colspan="5" class="no-players">No players yet</td></tr>`;
    } else {
        teamAPlayers.forEach((p) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${p.username}</td>
        <td>${p.totalScore}</td>
      `;
            teamABody.appendChild(row);
        });
    }

    // Render Team B players
    const teamBPlayers = players.filter((p) => p.team === "B");
    if (teamBPlayers.length === 0) {
        teamBBody.innerHTML = `<tr><td colspan="5" class="no-players">No players yet</td></tr>`;
    } else {
        teamBPlayers.forEach((p) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${p.username}</td>
        <td>${p.totalScore}</td>
      `;
            teamBBody.appendChild(row);
        });
    }
}

/**
 * Show the launch message and start a 10-second countdown.
 * Redirect to the game after the countdown finishes.
 * @param {string} game - The name of the game being launched (e.g., "trivia", "race", "2048").
 */
function showLaunchCountdown(game) {
    launchMessage.style.display = "block"; // Show the launch message
    let counter = 10;

    const interval = setInterval(() => {
        countdownEl.textContent = counter;
        counter--;

        if (counter < 0) {
            clearInterval(interval);
            window.location.href = `/${game}`; // Redirect to the game page
        }
    }, 1000);
}

/**
 * Hide the launch message if no game is being launched.
 */
function hideLaunchMessage() {
    launchMessage.style.display = "none";
}
