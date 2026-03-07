import { Controller, Post, Get, Delete, Body, Req, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import express from 'express';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    sessionId: string; // add your custom sessionId here
  }
}


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body('username') username: string, @Req() req: express.Request) {
    const user = await this.usersService.create(username);
    if(!user){
      throw new ConflictException('Username already exists');
    }

    // Store sessionId in cookie
    req.session.sessionId = user.sessionId;

    return { user, sessionId: user.sessionId };
  }

  @Get('me')
  async getUser(@Req() req: express.Request) {
    const sessionId = req.session.sessionId;
    if (!sessionId) return { error: 'Not logged in' };
    return this.usersService.findOneBySession(sessionId);
  }

  @Delete('me')
  async deleteUser(@Req() req: express.Request) {
    const sessionId = req.session.sessionId;
    if (!sessionId) return { error: 'Not logged in' };

    await this.usersService.removeBySession(sessionId);

    req.session.destroy(err => {
      if (err) console.error(err);
    });

    return { message: `User deleted and session cleared` };
  }
  @Delete(':id')
  async deleteById(@Req() req: express.Request, @Body('id') id: string) {
    await this.usersService.removeById(parseInt(id));
    return { message: `User with ID ${id} deleted` };
  }
}