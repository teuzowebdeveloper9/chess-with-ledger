import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { MatchView, OnlineMatchUpdatedEvent, WatchOnlineMatchRequest } from '@chess-ledger/shared';
import type { Server, Socket } from 'socket.io';

import { GetMatchUseCase } from '../../application/use-cases/get-match.use-case';
import type { MatchRealtimePublisher } from '../../application/ports/match-realtime-publisher.port';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})
export class OnlineMatchGateway implements MatchRealtimePublisher {
  @WebSocketServer()
  private server!: Server;

  constructor(private readonly getMatch: GetMatchUseCase) {}

  @SubscribeMessage('online:watch')
  async watchMatch(
    @MessageBody() data: WatchOnlineMatchRequest,
    @ConnectedSocket() client: Socket
  ): Promise<OnlineMatchUpdatedEvent | undefined> {
    if (!data?.matchId || !data.playerToken) {
      client.emit('online:error', { message: 'Dados da sala online invalidos.' });
      return undefined;
    }

    try {
      const match = await this.getMatch.execute(data.matchId);
      if (match.mode !== 'online') {
        client.emit('online:error', { message: 'Esta partida nao e online.' });
        return undefined;
      }

      await client.join(createMatchRoom(match.id));
      return { match };
    } catch (error) {
      client.emit('online:error', {
        message: error instanceof Error ? error.message : 'Falha ao acompanhar partida online.'
      });
      return undefined;
    }
  }

  publishMatchUpdated(match: MatchView): void {
    if (match.mode !== 'online') {
      return;
    }

    this.server.to(createMatchRoom(match.id)).emit('online:match_updated', { match });
  }
}

function createMatchRoom(matchId: string): string {
  return `match:${matchId}`;
}
