const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync("proto/auth.proto");
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const authClient = new authProto.AuthService(
  process.env.AUTH_SERVICE_URL || "auth-service:50052",
  grpc.credentials.createInsecure()
);

module.exports = authClient;