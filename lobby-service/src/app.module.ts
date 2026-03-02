import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LobbyModule } from './lobby/lobby.module';
import { Lobby } from './lobby/entities/lobby.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'lobbydb',
      entities: [Lobby],
      synchronize: true,
    }),
    LobbyModule,
  ],
})
export class AppModule {}
