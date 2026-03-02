import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { LobbyService } from './lobby.service';

@Controller()
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  // ── CreateLobby ────────────────────────────────────────────────────────────
  @GrpcMethod('LobbyService', 'CreateLobby')
  async createLobby(data: { gameId: string }) {
    const lobby = await this.lobbyService.createLobby(data.gameId);
    return {
      lobbyId: lobby.id,
      status: lobby.status,
    };
  }

  // ── StartLobby ─────────────────────────────────────────────────────────────
  @GrpcMethod('LobbyService', 'StartLobby')
  async startLobby(data: { lobbyId: string; gameId: string }) {
    return this.lobbyService.startLobby(data.lobbyId, data.gameId);
  }

  // ── GetLobbyState (Replaces LobbyStateStream) ──────────────────────────────
  @GrpcMethod('LobbyService', 'GetLobbyState')
  async getLobbyState(data: { lobbyId: string; sessionId: string }) {
    // 1. Security: Validate user session via Users Service
    const isValid = await this.lobbyService.validateSession(data.sessionId);

    if (!isValid) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Access Denied: Invalid Session',
      });
    }

    // 2. Fetch the current snapshot of the game
    const state = this.lobbyService.getLobbyState(data.lobbyId);

    if (!state) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Lobby not found or not active',
      });
    }

    return state;
  }
}
