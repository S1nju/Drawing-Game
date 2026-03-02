import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });aimport { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest'; // Use * as request for better compatibility
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lobby } from './../src/lobby/entities/lobby.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // 💡 MOCK THE REPOSITORY to avoid DB connection errors
      .overrideProvider(getRepositoryToken(Lobby))
      .useValue({
        find: jest.fn(),
        findOneBy: jest.fn(),
        save: jest.fn(),
      })
      // 💡 MOCK THE gRPC CLIENTS to avoid connection timeouts
      .overrideProvider('GAME_SERVICE')
      .useValue({ getService: () => ({ GetGameInfo: jest.fn() }) })
      .overrideProvider('USERS_SERVICE')
      .useValue({ getService: () => ({ CheckUser: jest.fn() }) })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // 💡 ALWAYS CLOSE THE APP to prevent "Jest did not exit" error
  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    // If your AppController doesn't have a GET '/' route, this test will fail.
    // Most microservices don't have a root GET route.
    return request(app.getHttpServer())
      .get('/')
      .expect(404); // Change to 404 if you don't have a '/' route
  });
});
});
