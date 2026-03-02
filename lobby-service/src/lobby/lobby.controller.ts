import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { Observable } from 'rxjs';

import { LobbyService, LobbyState } from './lobby.service';

@Controller()
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  // ── CreateLobby ────────────────────────────────────────────────────────────
  @GrpcMethod('LobbyService', 'CreateLobby')
  async createLobby(data: { gameId: string }) {
    const lobby = await this.lobbyService.createLobby(data.gameId);
    return { lobbyId: lobby.id, status: lobby.status };
  }

  // ── StartLobby ─────────────────────────────────────────────────────────────
  @GrpcMethod('LobbyService', 'StartLobby')
  async startLobby(data: { lobbyId: string; gameId: string }) {
    return this.lobbyService.startLobby(data.lobbyId, data.gameId);
  }

  // ── LobbyStateStream ───────────────────────────────────────────────────────
  @GrpcMethod('LobbyService', 'LobbyStateStream')
  async lobbyStateStream(data: {
    lobbyId: string;
    sessionId: string;
  }): Promise<Observable<LobbyState>> {
    // Security: validate session via Users Service before opening stream
    const isValid = await this.lobbyService.validateSession(data.sessionId);

    if (!isValid) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Access Denied: Invalid Session',
      });
    }

    return this.lobbyService.getStream(data.lobbyId).asObservable();
  }
}