import { useCallback, useEffect, useState } from 'react';
import type { LedgerEventView } from '@chess-ledger/shared';

import { chessApi } from '../../chess/services/chess-api';

const TOKEN_STORAGE_KEY = 'chess-ledger-admin-token';

export function useAdminLedger() {
  const [token, setToken] = useState(() => window.sessionStorage.getItem(TOKEN_STORAGE_KEY));
  const [events, setEvents] = useState<readonly LedgerEventView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLedger = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setEvents(await chessApi.listLedger(token));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao carregar ledger.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const login = useCallback(async (password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await chessApi.createAdminSession(password);
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, session.token);
      setToken(session.token);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Senha invalida.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setEvents([]);
  }, []);

  useEffect(() => {
    void loadLedger();
    const interval = window.setInterval(() => void loadLedger(), 2500);
    return () => window.clearInterval(interval);
  }, [loadLedger]);

  return {
    events,
    isAuthenticated: Boolean(token),
    isLoading,
    error,
    login,
    logout,
    refresh: loadLedger
  };
}
