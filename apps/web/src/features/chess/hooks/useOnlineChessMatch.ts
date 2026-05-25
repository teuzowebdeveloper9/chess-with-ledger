import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  BoardSquare,
  MatchView,
  MovePieceRequest,
  OnlineMatchSession,
  PromotionPieceType
} from '@chess-ledger/shared';

import { chessApi } from '../services/chess-api';
import { createOnlineMatchSocket, type OnlineMatchSocket } from '../services/online-socket';

interface PendingPromotion {
  readonly from: BoardSquare;
  readonly to: BoardSquare;
}

export function useOnlineChessMatch() {
  const [session, setSession] = useState<OnlineMatchSession | null>(null);
  const [match, setMatch] = useState<MatchView | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<BoardSquare | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<OnlineMatchSocket | null>(null);

  const selectedLegalMoves = useMemo(() => {
    if (!match || !selectedSquare) {
      return [];
    }

    return match.boardState.legalMoves.filter((move) => move.from === selectedSquare);
  }, [match, selectedSquare]);

  const createRoom = useCallback(async (whitePlayerName?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const created = await chessApi.createOnlineMatch({
        ...(whitePlayerName ? { whitePlayerName } : {})
      });
      setSession(created);
      setMatch(created.match);
      setSelectedSquare(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao criar sala online.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinRoom = useCallback(async (roomCode: string, blackPlayerName?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const joined = await chessApi.joinOnlineMatch({
        roomCode,
        ...(blackPlayerName ? { blackPlayerName } : {})
      });
      setSession(joined);
      setMatch(joined.match);
      setSelectedSquare(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao entrar na sala.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const movePiece = useCallback(
    async (request: MovePieceRequest) => {
      if (!match || !session || isSubmittingMove) {
        return;
      }

      setIsSubmittingMove(true);
      setError(null);

      try {
        const updated = await chessApi.movePiece(match.id, {
          ...request,
          playerToken: session.playerToken
        });
        setMatch(updated);
        setSelectedSquare(null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Movimento invalido.');
      } finally {
        setIsSubmittingMove(false);
      }
    },
    [isSubmittingMove, match, session]
  );

  const choosePromotion = useCallback(
    async (promotion: PromotionPieceType) => {
      if (!pendingPromotion) {
        return;
      }

      await movePiece({ ...pendingPromotion, promotion });
      setPendingPromotion(null);
    },
    [movePiece, pendingPromotion]
  );

  const onSquareClick = useCallback(
    async (square: BoardSquare) => {
      if (!match || !session || match.status !== 'active' || !match.online?.hasStarted || isSubmittingMove) {
        return;
      }

      if (match.boardState.turn !== session.playerColor) {
        return;
      }

      const clickedPiece = match.boardState.pieces.find((piece) => piece.square === square);
      if (clickedPiece?.color === session.playerColor) {
        setSelectedSquare(square);
        return;
      }

      const legalMove = selectedLegalMoves.find((move) => move.to === square);
      if (!selectedSquare || !legalMove) {
        return;
      }

      const selectedPiece = match.boardState.pieces.find((piece) => piece.square === selectedSquare);
      const shouldPromote =
        selectedPiece?.type === 'pawn' &&
        ((selectedPiece.color === 'white' && square.endsWith('8')) ||
          (selectedPiece.color === 'black' && square.endsWith('1')));

      if (shouldPromote) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }

      await movePiece({ from: selectedSquare, to: square });
    },
    [isSubmittingMove, match, movePiece, selectedLegalMoves, selectedSquare, session]
  );

  useEffect(() => {
    if (!session) {
      return undefined;
    }

    const socket = createOnlineMatchSocket();
    socketRef.current = socket;

    socket.on('online:match_updated', (event) => {
      setMatch(event.match);
      setSelectedSquare(null);
    });
    socket.on('online:error', (event) => setError(event.message));
    socket.on('connect', () => {
      socket.emit(
        'online:watch',
        {
          matchId: session.match.id,
          playerToken: session.playerToken
        },
        (event) => {
          if (event) {
            setMatch(event.match);
          }
        }
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session]);

  return {
    session,
    match,
    selectedSquare,
    selectedLegalMoves,
    pendingPromotion,
    isLoading,
    isSubmittingMove,
    error,
    onSquareClick,
    createRoom,
    joinRoom,
    choosePromotion,
    cancelPromotion: () => setPendingPromotion(null)
  };
}
