// File: scoreboard/scoreboard.js
//------------------------------------------------
const scoreboard = {
    users: {},    // { socketId: { username, team, totalScore, ... } }
    teams: {
        A: { score: 0 },
        B: { score: 0 }
    },
    nextTeam: "A",

    addUser(socketId, username) {
        const assignedTeam = this.getNextTeam();
        this.users[socketId] = {
            username,
            team: assignedTeam,
            totalScore: 0,
            gameScores: { trivia: 0, race: 0, "2048": 0 }
        };
        return assignedTeam;
    },

    removeUser(socketId) {
        delete this.users[socketId];
    },

    resetAllScores() {
        for (let sid in this.users) {
            this.users[sid].totalScore = 0;
            this.users[sid].gameScores = { trivia: 0, race: 0, "2048": 0 };
            // if you want to reassign teams or keep them, your choice
        }
        this.teams = { A: { score: 0 }, B: { score: 0 } };
    },

    getNextTeam() {
        const t = this.nextTeam;
        this.nextTeam = (this.nextTeam === "A") ? "B" : "A";
        return t;
    },

    /**
     * Return a more detailed scoreboard view:
     * {
     *   players: [ { username, team, totalScore, gameScores: { trivia, race, '2048'} }, ... ],
     *   teamTotals: { A: number, B: number }
     * }
     */
    getScoreboardView() {
        let players = [];
        let teamTotals = { A: 0, B: 0 };
        for (let sid in this.users) {
            const u = this.users[sid];
            players.push({
                username: u.username,
                team: u.team,
                totalScore: u.totalScore,
                gameScores: { ...u.gameScores } // copy of the per-game scores
            });
            if (u.team === "A") {
                teamTotals.A += u.totalScore;
            } else if (u.team === "B") {
                teamTotals.B += u.totalScore;
            }
        }

        // Sort players by team, then by totalScore desc
        players.sort((a, b) => {
            if (a.team !== b.team) {
                return (a.team === "A") ? -1 : 1; // A first, then B
            }
            // Same team, sort by descending totalScore
            return b.totalScore - a.totalScore;
        });

        return { players, teamTotals };
    }
};

module.exports = scoreboard;
