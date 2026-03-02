import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { Lobby } from './entities/lobby.entity';
import { LobbyService } from './lobby.service';
import { LobbyController } from './lobby.controller';

@Module({
  imports: [
    // ── Database ─────────────────────────────────────────────────────────────
    TypeOrmModule.forFeature([Lobby]),

    // ── gRPC Clients ──────────────────────────────────────────────────────────
    ClientsModule.register([
      {
        name: 'GAME_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'game',
          protoPath: join(__dirname, '../grpc/game.proto'),
          url: 'localhost:50053',
        },
      },
      {
        name: 'USERS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'users',
          protoPath: join(__dirname, '../grpc/users.proto'),
          url: 'localhost:50054',
        },
      },
    ]),
  ],
  controllers: [LobbyController],
  providers: [LobbyService],
})
export class LobbyModule {}