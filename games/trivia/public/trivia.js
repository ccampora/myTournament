// File: games/trivia/public/trivia.js
//--------------------------------------
const triviaSocket = io("/"); // or .io("/trivia-ns") if you have a separate namespace
// But also watch the main namespace for "gameStopped"
// If you're using a separate namespace, you can also connect to the default namespace

// We'll assume we connect to the default namespace for admin events:
const mainSocket = io("/", { path: "/socket.io" });

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const messageEl = document.getElementById("message");

// Existing code for handling new questions, answers, etc.

// Listen for "gameStopped"
mainSocket.on("gameStopped", (data) => {
    const { gameName } = data;
    if (gameName === "trivia") {
        // Display the stop message in the page
        stopCurrentGame(gameName);
    }
});

function stopCurrentGame(gameName) {
    // Hide or disable any gameplay UI
    questionEl.innerHTML = "";
    answersEl.innerHTML = "";

    // Show a big message
    messageEl.innerHTML = `
    <p>The game <strong>${gameName}</strong> has been stopped by the Game Master. A new game will begin soon.</p>
    <p>Redirecting to the lobby automatically in <span id="countdown">7</span> seconds or 
       <a href="/">click here</a></p>
  `;

    // 7-second countdown
    let counter = 7;
    const countdownEl = document.getElementById("countdown");
    const interval = setInterval(() => {
        counter--;
        countdownEl.textContent = counter;
        if (counter <= 0) {
            clearInterval(interval);
            window.location.href = "/";
        }
    }, 1000);
}
