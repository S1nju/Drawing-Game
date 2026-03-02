const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync("proto/game.proto");
const gameProto = grpc.loadPackageDefinition(packageDefinition).game;


const gameClient = new gameProto.GameService(
  process.env.GAME_SERVICE_URL || "localhost:50051",
  grpc.credentials.createInsecure()
);

module.exports = gameClient;
