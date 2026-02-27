import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ---------- gRPC server for Lobby Service ----------
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'lobby',
      protoPath: join(__dirname, './grpc/lobby.proto'),
      url: '0.0.0.0:50051', // Lobby service gRPC port
    },
  });

  // Start gRPC microservice
  await app.startAllMicroservices();
  await app.listen(3000);

  console.log('Lobby Service is running:');
  console.log('- gRPC on 0.0.0.0:50051');
  console.log('- HTTP (optional) on 3000');
}

// ignore returned promise so we satisfy lint/TS expectations
void bootstrap();
