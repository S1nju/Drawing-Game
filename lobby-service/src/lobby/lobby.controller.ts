import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { LobbyService, LobbyState } from './lobby.service';

// extend with optional word for the stream handler
interface LobbyStreamState extends LobbyState {
  word?: string;
}

@Controller()
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  // =====================================================
  // Create lobby
  // =====================================================

  @GrpcMethod('LobbyService', 'CreateLobby')
  async createLobby(data: { gameId: string; rounds: number }) {
    const lobby = await this.lobbyService.createLobby(data.gameId, data.rounds);

    return {
      lobbyId: lobby.id,
      status: lobby.status,
    };
  }

  // =====================================================
  // Start lobby
  // =====================================================

  @GrpcMethod('LobbyService', 'StartLobby')
  async startLobby(data: { lobbyId: string }) {
    return this.lobbyService.startLobby(data.lobbyId);
  }

  // =====================================================
  // Real-time state stream
  // =====================================================

  @GrpcMethod('LobbyService', 'LobbyStateStream')
  lobbyStateStream(data: {
    lobbyId: string;
    userId: string;
  }): Observable<LobbyStreamState> {
    // getStream now always returns a Subject so it cannot be undefined
    const stream = this.lobbyService.getStream(data.lobbyId);

    return new Observable<LobbyState>((observer) => {
      // ✅ send current state immediately
      const current = this.lobbyService.getState(data.lobbyId);
      if (current) observer.next(current);

      const sub = stream.subscribe((state: LobbyStreamState) => {
        // game finished → close stream
        if (state.status === 'FINISHED') {
          observer.next(state);
          observer.complete();
          return;
        }

        // hide word for non-drawers
        if (state.word && state.currentDrawer !== data.userId) {
          // force wider type so we can override word
          observer.next({ ...state, word: '' } as LobbyStreamState);
        } else {
          observer.next(state);
        }
      });

      // cleanup
      return () => sub.unsubscribe();
    });
  }
}
