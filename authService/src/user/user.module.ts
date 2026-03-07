import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/users/users.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
     imports: [
        // This line registers the repository for injection
        TypeOrmModule.forFeature([Users]) 
      ],
      controllers: [UserController],
      providers: [UserService],
      exports: [UserService],
      
})
export class UserModule {
    
    
    
}
