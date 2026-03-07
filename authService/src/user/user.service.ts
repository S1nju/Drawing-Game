import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/users.entity';
import { Repository } from 'typeorm';


@Injectable()
export class UserService {
 constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}
  async ckeck(sessionId: string) {
    const res=await this.usersRepository.findOneBy({ sessionId });
    if(res){
      return true
    }
    return this.usersRepository.findOneBy({ sessionId });
  }
  async checkUsername(id: number) {
    const res=await this.usersRepository.findOneBy({ id });
    if(res){
      return true
    }
    return false;
  }
}
