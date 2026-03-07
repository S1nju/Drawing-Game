import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './users.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async create(username: string) {
    try{
      const existingUser = await this.usersRepository.findOneBy({ username });
      if (existingUser) {
        return null; 
        
      }
    }catch(error){
      throw new Error('Error checking username uniqueness: ' + error.message);
    }
    const sessionId = uuidv4(); // generate unique session ID
    const user = this.usersRepository.create({ username, sessionId });
    return await this.usersRepository.save(user);
  }

  async findOneBySession(sessionId: string) {
    return this.usersRepository.findOneBy({ sessionId });
  }

  async removeBySession(sessionId: string) {
    return this.usersRepository.delete({ sessionId });
  }
  async removeById(id: number) {
    return this.usersRepository.delete({ id });
  }
}