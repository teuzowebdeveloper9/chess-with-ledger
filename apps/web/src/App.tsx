import { useState } from 'react';

import { AdminLedgerPage } from './features/admin-ledger/components/AdminLedgerPage';
import { ChessGamePage } from './features/chess/components/ChessGamePage';
import { GameModeMenu } from './features/chess/components/GameModeMenu';
import { OnlineChessGamePage } from './features/chess/components/OnlineChessGamePage';

type GameRoute = 'menu' | 'local' | 'online';

export function App() {
  const [route, setRoute] = useState<GameRoute>('menu');

  if (window.location.pathname === '/admin/ledger') {
    return <AdminLedgerPage />;
  }

  if (route === 'local') {
    return <ChessGamePage onBack={() => setRoute('menu')} />;
  }

  if (route === 'online') {
    return <OnlineChessGamePage onBack={() => setRoute('menu')} />;
  }

  return <GameModeMenu onLocal={() => setRoute('local')} onOnline={() => setRoute('online')} />;
}
