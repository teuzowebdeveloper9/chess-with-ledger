import { AdminLedgerPage } from './features/admin-ledger/components/AdminLedgerPage';
import { ChessGamePage } from './features/chess/components/ChessGamePage';

export function App() {
  if (window.location.pathname === '/admin/ledger') {
    return <AdminLedgerPage />;
  }

  return <ChessGamePage />;
}
