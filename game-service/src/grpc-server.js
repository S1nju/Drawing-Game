const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const {
  GetGameInfo,
  CheckGame,
} = require("./grpc/game.handlers");

const packageDefinition = protoLoader.loadSync("proto/game.proto");
const gameProto = grpc.loadPackageDefinition(packageDefinition).game;

function startGrpcServer(port) {
  const server = new grpc.Server();

  server.addService(gameProto.GameService.service, {
    CheckGame,
    GetGameInfo,
  });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log(`gRPC running on port ${port}`);
      server.start();
    }
  );
}

module.exports = startGrpcServer;