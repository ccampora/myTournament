// DOM References
const registrationSection = document.getElementById("registration");
const usernameInput = document.getElementById("usernameInput");
const registerBtn = document.getElementById("registerBtn");

const mainContainer = document.getElementById("mainContainer");
const questionTextEl = document.getElementById("questionText");
const answersEl = document.getElementById("answers");
const statusEl = document.getElementById("status");

const scoreListEl = document.getElementById("scoreList");
const timeLeftDisplayEl = document.getElementById("timeLeftDisplay");
const startOverBtn = document.getElementById("startOverBtn");

const socket = io();

// Check if we have a saved username in localStorage
const savedUsername = localStorage.getItem("username");
if (savedUsername) {
    registrationSection.classList.add("hidden");
    mainContainer.classList.remove("hidden");
    // Register with the server
    socket.emit("registerUser", savedUsername);
}

// Registration button
registerBtn.addEventListener("click", () => {
    const uname = usernameInput.value.trim();
    if (!uname) {
        alert("Please enter a username!");
        return;
    }
    localStorage.setItem("username", uname);
    registrationSection.classList.add("hidden");
    mainContainer.classList.remove("hidden");

    socket.emit("registerUser", uname);
});

// Start Over
startOverBtn.addEventListener("click", () => {
    localStorage.removeItem("username");
    window.location.reload();
});

// ------------------
// Socket.io Events
// ------------------

// New question broadcast
socket.on("newQuestion", (data) => {
    const { question } = data;
    statusEl.textContent = "";
    questionTextEl.textContent = question.questionText;
    answersEl.innerHTML = "";

    // Display possible answers depending on type
    if (question.type === "multiple_choice") {
        question.possibleAnswers.forEach((ans) => {
            const btn = document.createElement("button");
            btn.textContent = ans.text;
            btn.addEventListener("click", () => {
                socket.emit("answer", { answer: ans.option });
            });
            answersEl.appendChild(btn);
        });
    } else if (question.type === "text_input") {
        const input = document.createElement("input");
        input.type = "text";
        answersEl.appendChild(input);

        const submitBtn = document.createElement("button");
        submitBtn.textContent = "Submit";
        submitBtn.addEventListener("click", () => {
            socket.emit("answer", { answer: input.value.trim() });
        });
        answersEl.appendChild(submitBtn);
    } else {
        questionTextEl.textContent = "Unsupported question type.";
    }
});

// Real-time countdown
socket.on("timeLeftUpdate", (timeLeft) => {
    timeLeftDisplayEl.textContent = timeLeft;
});

// If question is answered by someone
socket.on("questionAnswered", (data) => {
    const { winner, correctAnswer } = data;
    if (winner) {
        statusEl.textContent = `Answered by ${winner}! Correct answer: ${correctAnswer}`;
    } else {
        // If winner is null, it might mean user joined late
        statusEl.textContent = "This question was already answered.";
    }
    // Disable the answer area
    answersEl.innerHTML = "";
});

// If user answered incorrectly
socket.on("wrongAnswer", (msg) => {
    statusEl.textContent = msg.message;
});

// If question timed out
socket.on("questionTimedOut", (data) => {
    // data.message is the random time-out message from the server
    statusEl.textContent = data.message;
    answersEl.innerHTML = ""; // disable answering
});

// If quiz is finished
socket.on("quizFinished", (data) => {
    questionTextEl.textContent = data.message;
    answersEl.innerHTML = "";
    statusEl.textContent = "Thanks for playing!";
    timeLeftDisplayEl.textContent = "--";
});

// Scoreboard updates
socket.on("scoreboardUpdate", (scores) => {
    scoreListEl.innerHTML = "";
    scores.forEach((player, index) => {
        const div = document.createElement("div");
        div.classList.add("score-row");
        const rank = index + 1;
        div.innerHTML = `<span>#${rank} ${player.username}</span><span>${player.score}</span>`;
        scoreListEl.appendChild(div);
    });
});
