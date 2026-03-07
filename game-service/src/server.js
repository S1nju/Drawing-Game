require("dotenv").config();
const app = require("./app");
const AppDataSource = require("./config/data-source");
const startGrpcServer = require("./grpc-server");

const PORT = process.env.PORT || 3000;
const GRPC_PORT = process.env.GRPC_PORT || 50051;

function connectWithRetry() {
  AppDataSource.initialize()
    .then(() => {
      console.log("Database connected");

      app.listen(PORT, () => {
        console.log(`Express running on port ${PORT}`);
      });

      startGrpcServer(GRPC_PORT);
    })
    .catch((err) => {
      console.error("Database connection failed, retrying in 5 seconds...", err.message);
      setTimeout(connectWithRetry, 5000);
    });
}

connectWithRetry();