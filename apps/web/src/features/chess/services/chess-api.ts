import type {
  AdminSessionResponse,
  LedgerEventView,
  MatchSummary,
  MatchView,
  MovePieceRequest,
  StartLocalMatchRequest
} from '@chess-ledger/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export const chessApi = {
  startMatch(input: StartLocalMatchRequest): Promise<MatchView> {
    return request<MatchView>('/matches', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  getMatch(matchId: string): Promise<MatchView> {
    return request<MatchView>(`/matches/${matchId}`);
  },

  movePiece(matchId: string, input: MovePieceRequest): Promise<MatchView> {
    return request<MatchView>(`/matches/${matchId}/moves`, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  listMatches(): Promise<readonly MatchSummary[]> {
    return request<readonly MatchSummary[]>('/matches');
  },

  createAdminSession(password: string): Promise<AdminSessionResponse> {
    return request<AdminSessionResponse>('/admin/session', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  },

  listLedger(token: string, matchId?: string): Promise<readonly LedgerEventView[]> {
    const search = matchId ? `?matchId=${encodeURIComponent(matchId)}` : '';
    return request<readonly LedgerEventView[]>(`/admin/ledger${search}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};
