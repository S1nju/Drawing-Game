import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { Lobby } from './entities/lobby.entity';
import { LobbyService } from './lobby.service';
import { LobbyController } from './lobby.controller';

@Module({
  imports: [
    // ================= DB =================
    TypeOrmModule.forFeature([Lobby]),

    // ================= gRPC CLIENTS =================
    // Lobby calls ONLY Session + Game
    ClientsModule.register([
      // ---------- Session Service ----------
      {
        name: 'SESSION_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'session',
          protoPath: join(__dirname, '../grpc/session.proto'),
          url: 'localhost:50052',
        },
      },

      // ---------- Game Service ----------
      {
        name: 'GAME_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'game',
          protoPath: join(__dirname, '../grpc/game.proto'),
          url: 'localhost:50053',
        },
      },
    ]),
  ],

  controllers: [LobbyController],
  providers: [LobbyService],
})
export class LobbyModule {}
