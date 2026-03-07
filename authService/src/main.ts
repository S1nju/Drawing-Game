import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import * as dotenv from 'dotenv';
dotenv.config();

import connectPgSimple from 'connect-pg-simple';
import { Transport } from '@nestjs/microservices';
import { USERS_PACKAGE_NAME } from 'types/proto/user';

const PgSession = connectPgSimple(session);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Session middleware
  app.use(
    session({
      store: new PgSession({
        conObject: {
          host:  'postgres', // Docker service name
          port: 5435,
          user: 'harir',
          password: 'harir',
          database: 'auth',
        },
        tableName: 'user_sessions',
        createTableIfMissing: true,
      }),
      secret: process.env.SECRET_KEY_SESSION!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      },
    }),
  );

  app.enableCors();

  // gRPC microservice
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: USERS_PACKAGE_NAME,
      protoPath: './proto/user.proto',
      url: '0.0.0.0:50051',
    },
  });

  // Start both REST and gRPC
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3001);

  console.log('REST API running on port', process.env.PORT ?? 3001);
  console.log('gRPC server running on port 50051');
}

bootstrap();