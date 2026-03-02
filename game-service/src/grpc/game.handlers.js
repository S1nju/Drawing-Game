const AppDataSource = require("../config/data-source");
const lobbyClient = require("./lobby"); 


async function Checkgame(call,callback) {
  try{

  const gameRepo = AppDataSource.getRepository("Game");

  const { gameId } = call.request;

  const game = await gameRepo.findOne({
    where: { id: gameId },
  });

  if (!game) {
    return callback(null,{exists: false});
  }

  return callback(null, {  exists: true});
} catch (error) {

  callback(new Error("Error checking game existence"));
}
}


async function GetGameInfo(call, callback) {
  try {
    const gameRepo = AppDataSource.getRepository("Game");

    const { gameId } = call.request;


    const game = await gameRepo.findOne({
      where: { id: gameId },
    });

    if (!game) {
      return callback(new Error("Game not found"));
    }

    // 🔥 Envoyer les infos au Lobby Service
    lobbyClient.CreateLobby(
      {
        gameId: game.id,
        status: game.status,
        maxPlayers: game.maxPlayers,
        totalRounds: game.totalRounds,
        turnTime: game.turnTime,
      },
      (err, response) => {
        if (err) {
          console.error("Lobby error:", err);
        }
      }
    );

    
    callback(null, {
      gameId: game.id,
      status: game.status,
      maxPlayers: game.maxPlayers,
      totalRounds: game.totalRounds,
      turnTime: game.turnTime,
    });

  } catch (error) {
    callback(error);
  }
}

module.exports = {
  GetGameInfo,
};