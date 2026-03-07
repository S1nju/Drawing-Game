const express = require("express");
const gameClient = require("./grpc/game.client");
const AppDataSource = require("./config/data-source");

const app = express();

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

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
      gameId: response.gameId,
      status: response.status,
      maxPlayers: response.maxPlayers,
      totalRounds: response.totalRounds,
      turnTime: response.turnTime,
    });
  });
});

app.post("/game", async (req, res) => {
  try {
    const gameRepo = AppDataSource.getRepository("Game");
    const { hostId, maxPlayers, totalRounds, turnTime } = req.body;

    const game = gameRepo.create({
      hostId: hostId || null,
      status: "waiting",
      maxPlayers,
      totalRounds,
      turnTime,
    });

    const savedGame = await gameRepo.save(game);

    res.json({
      gameId: savedGame.id,
      status: savedGame.status,
      maxPlayers: savedGame.maxPlayers,
      totalRounds: savedGame.totalRounds,
      turnTime: savedGame.turnTime,
    });
  } catch (err) {
    console.error("Error creating game:", err);
    return res.status(500).json({ error: "Failed to create game" });
  }
});


module.exports = app;