import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, firstValueFrom } from 'rxjs';
// ✅ Use 'import type' to fix TS1272
import type { ClientGrpc } from '@nestjs/microservices';

import { Lobby } from './entities/lobby.entity';
import { WordProvider } from './engine/word-provider';

export interface LobbyState {
  status: string;
  word: string;
}

interface GameService {
  GetGameInfo(data: { gameId: string }): Observable<{
    gameId: string;
    totalRounds: number;
    turnTime: number;
  }>;
}

interface UsersService {
  CheckUser(data: { sessionId: string }): Observable<{ check: number }>;
}

@Injectable()
export class LobbyService implements OnModuleInit {
  private gameService!: GameService;
  private usersService!: UsersService;

  private gameStatus = new Map<string, string>();
  private currentWords = new Map<string, string>();
  private currentRounds = new Map<string, number>();
  private timers = new Map<string, NodeJS.Timeout>();

  private words = new WordProvider();

  constructor(
    @InjectRepository(Lobby)
    private lobbyRepo: Repository<Lobby>,

    // ✅ Explicitly tell TS these are types in the constructor
    @Inject('GAME_SERVICE')
    private readonly gameClient: ClientGrpc,

    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.gameService = this.gameClient.getService<GameService>('GameService');
    this.usersService = this.usersClient.getService<UsersService>('UsersService');
  }

  // =====================================================
  // CORE FUNCTIONS
  // =====================================================

  async createLobby(gameId: string) {
    const lobby = this.lobbyRepo.create({
      game_id: gameId,
      status: 'PENDING',
      rounds: 0,
    });
    return this.lobbyRepo.save(lobby);
  }

  async startLobby(lobbyId: string, gameId: string) {
    const gameInfo = await firstValueFrom(this.gameService.GetGameInfo({ gameId }));

    await this.lobbyRepo.update(lobbyId, {
      status: 'STARTED',
      rounds: gameInfo.totalRounds,
    });

    this.gameStatus.set(lobbyId, 'STARTED');
    this.currentRounds.set(lobbyId, 1);
    this.currentWords.set(lobbyId, this.words.getRandomWord());

    this.runGameLoop(lobbyId, gameInfo.totalRounds, gameInfo.turnTime * 1000);

    return { status: 'STARTED' };
  }

  getLobbyState(lobbyId: string): LobbyState | null {
    if (!this.gameStatus.has(lobbyId)) return null;

    return {
      status: this.gameStatus.get(lobbyId) ?? 'PENDING',
      word: this.currentWords.get(lobbyId) ?? '',
    };
  }

  private runGameLoop(lobbyId: string, total: number, durationMs: number) {
    const timer = setTimeout(() => {
      const currentRound = this.currentRounds.get(lobbyId) ?? 0;

      if (currentRound >= total) {
        this.finishGame(lobbyId);
      } else {
        this.currentRounds.set(lobbyId, currentRound + 1);
        this.currentWords.set(lobbyId, this.words.getRandomWord());
        this.runGameLoop(lobbyId, total, durationMs);
      }
    }, durationMs);

    this.timers.set(lobbyId, timer);
  }

  private finishGame(lobbyId: string) {
    this.gameStatus.set(lobbyId, 'FINISHED');
    this.currentWords.set(lobbyId, '');
    this.clearTimer(lobbyId);
    void this.lobbyRepo.update(lobbyId, { status: 'FINISHED' });
  }

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(this.usersService.CheckUser({ sessionId }));
      return res.check === 1.0;
    } catch {
      return false;
    }
  }

  private clearTimer(lobbyId: string) {
    const t = this.timers.get(lobbyId);
    if (t) clearTimeout(t);
    this.timers.delete(lobbyId);
  }
}
