const express = require("express");
const app = express();

const { open } = require("sqlite");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

const sqlite3 = require("sqlite3");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`DB had Accessed Correctly`);
    });
  } catch (e) {
    console.log(`ERROR VACHINDI: ${e.message}`);
  }
};

initializeDBAndServer();
app.use(express.json());
//GET PLAYER

app.get("/players/", async (request, response) => {
  const players = `SELECT player_id,player_name,jersey_number,role FROM cricket_team;`;
  const playersall = await db.all(players);

  response.send(playersall);
});

//POST PLAYER

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  //console.log(playerName, jerseyNumber, role);
  const addPlayer = `INSERT INTO cricket_team (player_name, jersey_number, role) VALUES('${playerName}',${jerseyNumber},'${role}');`;
  let playerId = await db.run(addPlayer);
  //newPlayer = playerId.lastID;
  console.log(playerId);
  response.send("Player Added to Team");
});

//GET Only one BOOK

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const requestPlayer = `SELECT player_id,player_name,jersey_number,role FROM cricket_team WHERE player_id = ${playerId};`;
  const player = await db.get(requestPlayer);

  response.send(playerNew);
});
//Updating the Player

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  console.log(playerName, jerseyNumber, role);
  const table = `UPDATE cricket_team SET player_name='${playerName}',jersey_number = ${jerseyNumber},role='${role}' WHERE player_id = ${playerId};`;
  const playerUpdates = await db.run(table);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", (req, res) => {
  const { playerId } = req.params;
  const deletePlayer = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  const deleted = db.run(deletePlayer);
  res.send("Player Removed");
});

module.exports = app;
