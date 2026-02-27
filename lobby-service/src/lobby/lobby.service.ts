import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { ClientGrpc } from '@nestjs/microservices';
import { Subject, Observable, firstValueFrom } from 'rxjs';

// exported so other modules (controller) can reuse the shape
export interface LobbyState {
  status: string;
  currentRound: number;
  currentDrawer: string;
  numberOfPlayers: number;
}

import { Lobby } from './entities/lobby.entity';
import { GameEngine } from './engine/game-engine';
import { WordProvider } from './engine/word-provider';

interface SessionService {
  GetPlayers(data: { lobbyId: string }): Observable<{ players: string[] }>;
}

@Injectable()
export class LobbyService implements OnModuleInit {
  // we initialise in onModuleInit after the grpc client is ready
  private sessionService!: SessionService;

  private engines = new Map<string, GameEngine>();
  private streams = new Map<string, Subject<any>>();
  private timers = new Map<string, NodeJS.Timeout>();
  private words = new WordProvider();

  constructor(
    @InjectRepository(Lobby)
    private lobbyRepo: Repository<Lobby>,

    @Inject('SESSION_SERVICE')
    private client: ClientGrpc,
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  onModuleInit() {
    // ⚠️ MUST be proto service name
    this.sessionService =
      this.client.getService<SessionService>('SessionService');
  }

  // =====================================================
  // CREATE LOBBY
  // =====================================================

  async createLobby(gameId: string, rounds: number) {
    const lobby = this.lobbyRepo.create({
      game_id: gameId,
      rounds,
      status: 'PENDING',
    });

    return this.lobbyRepo.save(lobby);
  }

  // =====================================================
  // START LOBBY
  // =====================================================

  async startLobby(lobbyId: string) {
    const lobby = await this.lobbyRepo.findOneBy({ id: lobbyId });
    if (!lobby) throw new Error('Lobby not found');

    // fetch players from Session
    const response = await firstValueFrom(
      this.sessionService.GetPlayers({ lobbyId }),
    );

    const players = response.players;

    if (!players?.length) throw new Error('No players');

    const engine = new GameEngine(players, lobby.rounds);

    const word = this.words.getRandomWord();
    engine.startFirstRound(word);

    this.engines.set(lobbyId, engine);

    lobby.status = 'STARTED';
    lobby.current_round = 1;
    await this.lobbyRepo.save(lobby);

    this.startRoundTimer(lobbyId);
    this.emitState(lobbyId);

    return {
      drawerId: engine.getCurrentDrawer(),
      round: 1,
    };
  }

  // =====================================================
  // STREAM
  // =====================================================

  /**
   * Always returns a Subject for the given lobby.  If one does not yet
   * exist it is created.  The return type is **never** undefined which
   * prevents callers having to guard.
   */
  getStream(lobbyId: string): Subject<any> {
    if (!this.streams.has(lobbyId)) {
      this.streams.set(lobbyId, new Subject());
    }
    // the has() above guarantees this will not be undefined
    return this.streams.get(lobbyId)!;
  }

  private broadcast(lobbyId: string, payload: any) {
    this.getStream(lobbyId).next(payload);
  }

  // =====================================================
  // TIMER
  // =====================================================

  private startRoundTimer(lobbyId: string) {
    // the callback is async; we don't care about the returned promise
    const timer = setTimeout(() => void this.nextRound(lobbyId), 60_000);
    this.timers.set(lobbyId, timer);
  }

  private clearTimer(lobbyId: string) {
    const t = this.timers.get(lobbyId);
    if (t) clearTimeout(t);
  }

  // =====================================================
  // ROUND ROTATION
  // =====================================================

  private async nextRound(lobbyId: string) {
    const engine = this.engines.get(lobbyId);
    const lobby = await this.lobbyRepo.findOneBy({ id: lobbyId });

    if (!engine || !lobby) return;

    if (engine.getRound() >= lobby.rounds) {
      lobby.status = 'FINISHED';
      await this.lobbyRepo.save(lobby);

      this.broadcast(lobbyId, { status: 'FINISHED' });

      this.cleanup(lobbyId);
      return;
    }

    const word = this.words.getRandomWord();
    engine.nextRound(word);

    lobby.current_round = engine.getRound();
    await this.lobbyRepo.save(lobby);

    this.emitState(lobbyId);
    this.startRoundTimer(lobbyId);
  }

  // =====================================================
  // STATE EMISSION
  // =====================================================

  private emitState(lobbyId: string) {
    const engine = this.engines.get(lobbyId);
    if (!engine) return;

    this.broadcast(lobbyId, {
      status: 'STARTED',
      currentRound: engine.getRound(),
      numberOfPlayers: engine.getPlayerCount(),
      currentDrawer: engine.getCurrentDrawer(),
      word: engine.getCurrentWord(),
    });
  }

  // =====================================================
  // CLEANUP (important)
  // =====================================================

  private cleanup(lobbyId: string) {
    this.clearTimer(lobbyId);
    this.engines.delete(lobbyId);
    this.streams.delete(lobbyId);
    this.timers.delete(lobbyId);
  }

  // =====================================================
  // STATE GETTER
  // =====================================================

  getState(lobbyId: string): LobbyState | null {
    const engine = this.engines.get(lobbyId);
    if (!engine) return null;

    return {
      status: engine.getStatus(), // ← ADD THIS
      currentRound: engine.getRound(),
      currentDrawer: engine.getCurrentDrawer(),
      numberOfPlayers: engine.getPlayerCount(),
    };
  }
}
