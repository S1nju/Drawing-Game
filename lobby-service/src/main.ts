import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'lobby',
      protoPath: join(__dirname, './grpc/lobby.proto'),
      url: '0.0.0.0:50051',
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);

  console.log('Lobby Service running:');
  console.log('  gRPC  → 0.0.0.0:50051');
  console.log('  HTTP  → 0.0.0.0:3000');
}

void bootstrap();
