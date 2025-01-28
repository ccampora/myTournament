// File: mainServer.js
//------------------------------------------------
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const scoreboard = require("./scoreboard/scoreboard");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.urlencoded({ extended: true }));

let activeGame = null;

// Serve admin & public
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Global Socket.io for all clients
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("adminCommand", (data) => {
    const { command, game } = data;
    if (command === "launchGame") {
      activeGame = game; // e.g. "trivia", "race", "2048"
      // Broadcast that a new game is active
      io.emit("activeGameChanged", { activeGame });
      socket.emit("adminResponse", `Active game set to ${activeGame}`);
    }
    else if (command === "stopGame") {
      if (activeGame !== null) {
        // Let everyone know the old game is being stopped
        const oldGame = activeGame;
        activeGame = null;
        // 1) Emit "gameStopped" so that existing players in that game see the message
        io.emit("gameStopped", { gameName: oldGame });
        // 2) Also emit "activeGameChanged" with null if needed
        io.emit("activeGameChanged", { activeGame: null });
        socket.emit("adminResponse", `The game ${oldGame} was stopped.`);
      } else {
        socket.emit("adminResponse", "No game is active to stop.");
      }
    }
  });
});

// Registration
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.post("/register", (req, res) => {
  const nickname = req.body.nickname || "Player";
  const fakeSocketId = "web-" + Math.random().toString(36).substr(2, 8);

  const assignedTeam = scoreboard.addUser(fakeSocketId, nickname);

  if (activeGame) {
    return res.redirect("/" + activeGame);
  } else {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Registered</title></head>
      <body>
        <h1>Registration Successful!</h1>
        <p>You have been assigned to <strong>Team ${assignedTeam}</strong>.</p>
        <p>No game is active. Please wait... or <a href="/">go to lobby</a>.</p>
      </body>
      </html>
    `);
  }
});

// MOUNT GAMES
const triviaApp = require("./games/trivia/server")(io, scoreboard);
const raceApp = require("./games/race/server")(io, scoreboard);
const game2048App = require("./games/2048/server")(io, scoreboard);

app.use("/trivia", triviaApp);
app.use("/race", raceApp);
app.use("/2048", game2048App);

// Root route (lobby/waiting)
app.get("/", (req, res) => {
  if (activeGame) {
    res.redirect("/" + activeGame);
  } else {
    res.sendFile(path.join(__dirname, "public", "lobby.html"));
  }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Main server running at http://localhost:${PORT}`);
});
