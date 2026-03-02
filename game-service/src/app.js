const express = require("express");
const gameClient = require("./grpc/game.client");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    service: "Game Service",
    status: "Running",
  });
});

app.get("/game/:gameId", (req, res) => {
  const gameId = req.params.gameId;
  gameClient.GetGameInfo({ gameId }, (err, response) => {
    if (err) {
      console.error("Error fetching game info:", err);
      return res.status(500).json({ error: "Failed to fetch game info" });
    }
    res.json({
      status: response.status,
      maxPlayers: response.maxPlayers,
      totalRounds: response.totalRounds,
      turnTime: response.turnTime
    })

  })});
  app.post("/game", (req, res) => {
    const { maxPlayers, totalRounds, turnTime } = req.body;
    gameClient.CreateGame({ maxPlayers, totalRounds, turnTime }, (err, response) => {
      if (err) {
        console.error("Error creating game:", err);
        return res.status(500).json({ error: "Failed to create game" });
      }
      res.json({
        gameId: response.gameId,
        status: response.status,
        maxPlayers: response.maxPlayers,
        totalRounds: response.totalRounds,
        turnTime: response.turnTime
      });
    });
  });


module.exports = app;