import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  BoardSquare,
  MatchView,
  MovePieceRequest,
  PromotionPieceType,
  StartLocalMatchRequest
} from '@chess-ledger/shared';

import { chessApi } from '../services/chess-api';

interface PendingPromotion {
  readonly from: BoardSquare;
  readonly to: BoardSquare;
}

export function useChessMatch() {
  const [match, setMatch] = useState<MatchView | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<BoardSquare | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedLegalMoves = useMemo(() => {
    if (!match || !selectedSquare) {
      return [];
    }

    return match.boardState.legalMoves.filter((move) => move.from === selectedSquare);
  }, [match, selectedSquare]);

  const startMatch = useCallback(async (whitePlayerName?: string, blackPlayerName?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: StartLocalMatchRequest = {
        ...(whitePlayerName ? { whitePlayerName } : {}),
        ...(blackPlayerName ? { blackPlayerName } : {})
      };
      const created = await chessApi.startMatch(request);
      setMatch(created);
      setSelectedSquare(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao iniciar partida.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const movePiece = useCallback(
    async (request: MovePieceRequest) => {
      if (!match) {
        return;
      }

      setError(null);

      try {
        const updated = await chessApi.movePiece(match.id, request);
        setMatch(updated);
        setSelectedSquare(null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Movimento invalido.');
      }
    },
    [match]
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
      if (!match || match.status !== 'active') {
        return;
      }

      const clickedPiece = match.boardState.pieces.find((piece) => piece.square === square);
      if (clickedPiece?.color === match.boardState.turn) {
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
    [match, movePiece, selectedLegalMoves, selectedSquare]
  );

  useEffect(() => {
    void startMatch();
  }, [startMatch]);

  return {
    match,
    selectedSquare,
    selectedLegalMoves,
    pendingPromotion,
    isLoading,
    error,
    onSquareClick,
    startMatch,
    choosePromotion,
    cancelPromotion: () => setPendingPromotion(null)
  };
}
