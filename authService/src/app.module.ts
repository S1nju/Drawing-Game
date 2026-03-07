import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { Users } from './users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { UsersController } from './users/users.controller';


@Module({
   imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'harir',
      password: process.env.DATABASE_PASSWORD || 'harir',
      database: process.env.DATABASE_NAME || 'auth',
      entities: [Users],
      synchronize: true,
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    UsersModule,
    UserModule,
  ],
  controllers: [AppController, UserController,UsersController],
  providers: [AppService],
})
export class AppModule {}
