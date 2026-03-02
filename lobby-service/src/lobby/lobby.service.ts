import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientGrpc } from '@nestjs/microservices';
import { Subject, Observable, firstValueFrom } from 'rxjs';

import { Lobby } from './entities/lobby.entity';
import { WordProvider } from './engine/word-provider';

// ── Shape of every stream emission ──────────────────────────────────────────
export interface LobbyState {
  status: string;
  word: string;
}

// ── gRPC service interfaces (match proto definitions exactly) ────────────────
interface GameService {
  GetGameInfo(data: { gameId: string }): Observable<{
    gameId: string;
    status: string;
    maxPlayers: number;
    totalRounds: number;
    turnTime: number;
  }>;
}

interface UsersService {
  CheckUser(data: { sessionId: string }): Observable<{ check: number }>;
}

@Injectable()
export class LobbyService implements OnModuleInit {
  // ── gRPC clients (assigned in onModuleInit) ────────────────────────────────
  private gameService!: GameService;
  private usersService!: UsersService;

  // ── In-memory runtime state ────────────────────────────────────────────────
  private gameStatus = new Map<string, string>();
  private currentWords = new Map<string, string>();
  private currentRounds = new Map<string, number>();
  private totalRounds = new Map<string, number>();
  private streams = new Map<string, Subject<LobbyState>>();
  private timers = new Map<string, NodeJS.Timeout>();

  private words = new WordProvider();

  constructor(
    @InjectRepository(Lobby)
    private lobbyRepo: Repository<Lobby>,

    @Inject('GAME_SERVICE')
    private gameClient: ClientGrpc,

    @Inject('USERS_SERVICE')
    private usersClient: ClientGrpc,
  ) {}

  // ── NestJS lifecycle: runs once the module is ready ────────────────────────
  onModuleInit() {
    this.gameService = this.gameClient.getService<GameService>('GameService');
    this.usersService = this.usersClient.getService<UsersService>('UsersService');
  }

  // =====================================================
  // CREATE LOBBY  – persist metadata only, no game logic
  // =====================================================
  async createLobby(gameId: string) {
    const lobby = this.lobbyRepo.create({
      game_id: gameId,
      status: 'PENDING',
    });
    return this.lobbyRepo.save(lobby);
  }

  // =====================================================
  // START LOBBY  – fetch rules from Game Service, then run
  // =====================================================
  async startLobby(lobbyId: string, gameId: string) {
    // 1. Verify lobby exists in DB
    const lobby = await this.lobbyRepo.findOneBy({ id: lobbyId });
    if (!lobby) throw new Error(`Lobby ${lobbyId} not found`);

    // 2. Fetch rules (totalRounds + turnTime) from Game Service
    const gameInfo = await firstValueFrom(
      this.gameService.GetGameInfo({ gameId }),
    );

    // 3. Persist rounds count for reference
    lobby.rounds = gameInfo.totalRounds;
    lobby.status = 'STARTED';
    await this.lobbyRepo.save(lobby);

    // 4. Bootstrap in-memory state
    this.gameStatus.set(lobbyId, 'STARTED');
    this.currentRounds.set(lobbyId, 1);
    this.totalRounds.set(lobbyId, gameInfo.totalRounds);
    this.currentWords.set(lobbyId, this.words.getRandomWord());

    // 5. Broadcast initial state, then start the timed loop
    this.emitState(lobbyId);
    this.runGameLoop(lobbyId, gameInfo.totalRounds, gameInfo.turnTime * 1000);

    return { status: 'STARTED' };
  }

  // =====================================================
  // GAME LOOP  – advances rounds using dynamic turnTime
  // =====================================================
  private runGameLoop(lobbyId: string, total: number, durationMs: number) {
    const timer = setTimeout(() => {
      const round = this.currentRounds.get(lobbyId) ?? 0;

      if (round >= total) {
        this.finishGame(lobbyId);
      } else {
        // Advance round + new word
        this.currentRounds.set(lobbyId, round + 1);
        this.currentWords.set(lobbyId, this.words.getRandomWord());
        this.emitState(lobbyId);
        this.runGameLoop(lobbyId, total, durationMs); // schedule next
      }
    }, durationMs);

    this.timers.set(lobbyId, timer);
  }

  private finishGame(lobbyId: string) {
    this.gameStatus.set(lobbyId, 'FINISHED');
    this.currentWords.set(lobbyId, '');
    this.emitState(lobbyId);
    this.cleanup(lobbyId);

    // Persist FINISHED in DB (fire-and-forget)
    void this.lobbyRepo.update(lobbyId, { status: 'FINISHED' });
  }

  // =====================================================
  // STREAM  – one Subject per lobby
  // =====================================================
  getStream(lobbyId: string): Subject<LobbyState> {
    if (!this.streams.has(lobbyId)) {
      this.streams.set(lobbyId, new Subject<LobbyState>());
    }
    return this.streams.get(lobbyId)!;
  }

  private emitState(lobbyId: string) {
    this.getStream(lobbyId).next({
      status: this.gameStatus.get(lobbyId) ?? 'PENDING',
      word: this.currentWords.get(lobbyId) ?? '',
    });
  }

  // =====================================================
  // SECURITY  – delegates to Users Service
  // =====================================================
  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.usersService.CheckUser({ sessionId }),
      );
      return res.check === 1.0;
    } catch {
      return false;
    }
  }

  // =====================================================
  // CLEANUP  – prevent memory leaks
  // =====================================================
  private cleanup(lobbyId: string) {
    const t = this.timers.get(lobbyId);
    if (t) clearTimeout(t);

    this.timers.delete(lobbyId);
    this.gameStatus.delete(lobbyId);
    this.currentWords.delete(lobbyId);
    this.currentRounds.delete(lobbyId);
    this.totalRounds.delete(lobbyId);
    // streams stays alive until all subscribers unsubscribe
  }
}
