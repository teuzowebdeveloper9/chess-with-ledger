import { io, type Socket } from 'socket.io-client';
import type { OnlineMatchUpdatedEvent, WatchOnlineMatchRequest } from '@chess-ledger/shared';

import { API_BASE_URL } from './chess-api';

export type OnlineMatchSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface ServerToClientEvents {
  readonly 'online:match_updated': (event: OnlineMatchUpdatedEvent) => void;
  readonly 'online:error': (event: { readonly message: string }) => void;
}

interface ClientToServerEvents {
  readonly 'online:watch': (
    request: WatchOnlineMatchRequest,
    callback: (event?: OnlineMatchUpdatedEvent) => void
  ) => void;
}

export function createOnlineMatchSocket(): OnlineMatchSocket {
  return io(API_BASE_URL, {
    transports: ['websocket']
  });
}
