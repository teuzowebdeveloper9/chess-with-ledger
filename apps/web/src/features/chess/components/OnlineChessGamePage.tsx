import { ArrowLeft, Clipboard, Link2, Loader2, LogIn, RadioTower } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BoardSquare, MatchView, OnlineMatchSession } from '@chess-ledger/shared';

import { CapturedPieces } from './CapturedPieces';
import { ChessBoard } from './ChessBoard';
import { GameStatusBar } from './GameStatusBar';
import { MoveHistory } from './MoveHistory';
import { PromotionDialog } from './PromotionDialog';
import { useOnlineChessMatch } from '../hooks/useOnlineChessMatch';

interface OnlineChessGamePageProps {
  readonly onBack: () => void;
}

export function OnlineChessGamePage({ onBack }: OnlineChessGamePageProps) {
  const {
    session,
    match,
    selectedSquare,
    selectedLegalMoves,
    pendingPromotion,
    isLoading,
    error,
    onSquareClick,
    createRoom,
    joinRoom,
    choosePromotion,
    cancelPromotion
  } = useOnlineChessMatch();

  const legalTargets = selectedLegalMoves.map((move) => move.to as BoardSquare);

  if (!session || !match) {
    return (
      <OnlineSetupPage
        error={error}
        isLoading={isLoading}
        onBack={onBack}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
      />
    );
  }

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-[1500px] bg-[#f5f6f1] bg-[linear-gradient(180deg,rgba(37,99,235,0.08),transparent_260px)] p-3 text-stone-950 sm:p-6">
      <button
        type="button"
        className="mb-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-900/10 bg-white px-3 font-bold text-stone-950 shadow-[0_8px_24px_rgba(23,25,24,0.08)] transition hover:-translate-y-0.5"
        onClick={onBack}
      >
        <ArrowLeft size={18} />
        Menu
      </button>
      <GameStatusBar match={match} />
      {error ? (
        <div className="mb-3 rounded-lg border border-red-700/25 bg-red-700/10 px-4 py-3 font-bold text-red-800">
          {error}
        </div>
      ) : null}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(360px,1fr)_minmax(320px,420px)]">
        <div className="relative grid min-w-0 place-items-center">
          <ChessBoard
            boardState={match.boardState}
            selectedSquare={selectedSquare}
            legalTargets={legalTargets}
            onSquareClick={onSquareClick}
          />
          {!match.online?.hasStarted ? <WaitingRoomOverlay match={match} session={session} /> : null}
        </div>
        <aside className="grid gap-3.5">
          <OnlineMatchPanel match={match} session={session} />
          <CapturedPieces boardState={match.boardState} />
          <MoveHistory history={match.boardState.history} />
        </aside>
      </div>
      {pendingPromotion ? <PromotionDialog onChoose={choosePromotion} onCancel={cancelPromotion} /> : null}
    </main>
  );
}

interface OnlineSetupPageProps {
  readonly error: string | null;
  readonly isLoading: boolean;
  readonly onBack: () => void;
  readonly onCreateRoom: (whitePlayerName?: string) => void;
  readonly onJoinRoom: (roomCode: string, blackPlayerName?: string) => void;
}

function OnlineSetupPage({ error, isLoading, onBack, onCreateRoom, onJoinRoom }: OnlineSetupPageProps) {
  const [whitePlayerName, setWhitePlayerName] = useState('Jogador online 1');
  const [blackPlayerName, setBlackPlayerName] = useState('Jogador online 2');
  const [roomCode, setRoomCode] = useState('');

  return (
    <main className="min-h-screen bg-[#f5f6f1] bg-[linear-gradient(135deg,rgba(37,99,235,0.12),transparent_38%),linear-gradient(315deg,rgba(47,111,78,0.10),transparent_34%)] p-4 text-stone-950 sm:p-8">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-[1080px] content-center gap-5 sm:min-h-[calc(100vh-4rem)]">
        <button
          type="button"
          className="w-fit inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-900/10 bg-white px-3 font-bold text-stone-950 shadow-[0_8px_24px_rgba(23,25,24,0.08)] transition hover:-translate-y-0.5"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Menu
        </button>

        <div>
          <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-900/10 bg-white/80 px-3 py-1 text-xs font-bold text-blue-900 uppercase">
            <RadioTower size={14} />
            Partida online
          </span>
          <h1 className="max-w-[760px] text-5xl leading-[0.95] font-black tracking-normal sm:text-6xl">
            Crie ou entre em uma sala
          </h1>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-700/25 bg-red-700/10 px-4 py-3 font-bold text-red-800">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <form
            className="grid gap-4 rounded-lg border border-stone-900/10 bg-white/90 p-5 shadow-[0_18px_48px_rgba(23,25,24,0.12)]"
            onSubmit={(event) => {
              event.preventDefault();
              onCreateRoom(whitePlayerName);
            }}
          >
            <div>
              <span className="mb-1 block text-xs font-bold tracking-[0.08em] text-[#184a34] uppercase">Criar</span>
              <h2 className="text-2xl leading-tight font-black tracking-normal">Nova sala</h2>
            </div>
            <PlayerNameInput label="Seu nome" value={whitePlayerName} onChange={setWhitePlayerName} />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#184a34] px-4 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Link2 size={18} />}
              Criar sala
            </button>
          </form>

          <form
            className="grid gap-4 rounded-lg border border-stone-900/10 bg-[#172554] p-5 text-white shadow-[0_18px_48px_rgba(23,25,24,0.16)]"
            onSubmit={(event) => {
              event.preventDefault();
              onJoinRoom(roomCode, blackPlayerName);
            }}
          >
            <div>
              <span className="mb-1 block text-xs font-bold tracking-[0.08em] text-blue-100 uppercase">Entrar</span>
              <h2 className="text-2xl leading-tight font-black tracking-normal">Sala existente</h2>
            </div>
            <label className="grid gap-1.5 text-sm font-bold text-blue-100">
              Codigo da sala
              <input
                className="min-h-11 rounded-lg border border-white/15 bg-white px-3 font-black tracking-normal text-[#172554] outline-none transition focus:ring-3 focus:ring-blue-200/40"
                value={roomCode}
                onChange={(event) => setRoomCode(event.currentTarget.value.toUpperCase())}
                maxLength={25}
              />
            </label>
            <PlayerNameInput dark label="Seu nome" value={blackPlayerName} onChange={setBlackPlayerName} />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 font-bold text-[#172554] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              disabled={isLoading || roomCode.trim().length === 0}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
              Entrar na sala
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function PlayerNameInput({
  dark = false,
  label,
  value,
  onChange
}: {
  readonly dark?: boolean;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className={`grid gap-1.5 text-sm font-bold ${dark ? 'text-blue-100' : 'text-stone-500'}`}>
      {label}
      <input
        className={`min-h-11 rounded-lg border px-3 outline-none transition focus:ring-3 ${
          dark
            ? 'border-white/15 bg-white text-[#172554] focus:ring-blue-200/40'
            : 'border-stone-900/10 bg-white text-stone-950 focus:ring-[#184a34]/15'
        }`}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        maxLength={80}
      />
    </label>
  );
}

function WaitingRoomOverlay({ match, session }: { readonly match: MatchView; readonly session: OnlineMatchSession }) {
  const [copied, setCopied] = useState(false);
  const roomCode = match.online?.roomCode ?? session.roomCode;

  async function copyRoomCode() {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="absolute inset-2 z-20 grid place-items-center rounded-lg bg-stone-950/72 p-4 backdrop-blur-sm sm:inset-3">
      <section className="grid w-full max-w-[560px] gap-4 rounded-lg border border-white/15 bg-white p-5 text-center shadow-[0_24px_72px_rgba(0,0,0,0.22)]">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#172554] text-white">
          <RadioTower size={24} />
        </span>
        <div>
          <span className="mb-1 block text-xs font-bold tracking-[0.08em] text-blue-900 uppercase">
            Aguardando oponente
          </span>
          <h2 className="text-3xl leading-tight font-black tracking-normal text-stone-950">Sala criada</h2>
        </div>
        <code className="block break-all rounded-lg border border-stone-900/10 bg-stone-950 px-4 py-3 text-2xl font-black tracking-normal text-[#dbe6ce]">
          {roomCode}
        </code>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#184a34] px-4 font-bold text-white transition hover:-translate-y-0.5"
          onClick={() => void copyRoomCode()}
        >
          <Clipboard size={18} />
          {copied ? 'Copiado' : 'Copiar codigo'}
        </button>
      </section>
    </div>
  );
}

function OnlineMatchPanel({ match, session }: { readonly match: MatchView; readonly session: OnlineMatchSession }) {
  const players = useMemo(
    () => [
      match.online?.whitePlayer,
      match.online?.blackPlayer ?? {
        id: 'waiting',
        color: 'black' as const,
        name: 'Aguardando oponente',
        joinedAt: ''
      }
    ],
    [match.online?.blackPlayer, match.online?.whitePlayer]
  );

  return (
    <section
      className="grid gap-3 rounded-lg border border-stone-900/10 bg-white/90 p-4 shadow-[0_18px_48px_rgba(23,25,24,0.12)]"
      aria-label="Sala online"
    >
      <div>
        <span className="mb-1 block text-xs font-bold tracking-[0.08em] text-blue-900 uppercase">Sala online</span>
        <h2 className="text-lg leading-tight font-bold tracking-normal text-stone-950">{match.online?.roomCode}</h2>
      </div>
      <div className="grid gap-2">
        {players.map((player) =>
          player ? (
            <div
              key={player.id}
              className="grid grid-cols-[12px_1fr_auto] items-center gap-2 rounded-lg border border-stone-900/10 bg-white px-3 py-2"
            >
              <span
                className={`h-3 w-3 rounded-full ${player.color === session.playerColor ? 'bg-[#184a34]' : 'bg-blue-700'}`}
              />
              <span className="font-bold text-stone-800">{player.name}</span>
              <span className="text-xs font-bold text-stone-500 uppercase">{player.color === 'white' ? 'Brancas' : 'Pretas'}</span>
            </div>
          ) : null
        )}
      </div>
      <div className="rounded-lg border border-stone-900/10 bg-[#f8faf5] px-3 py-2 text-sm font-bold text-stone-600">
        {match.online?.hasStarted ? 'Partida iniciada' : 'Aguardando segundo jogador'}
      </div>
    </section>
  );
}
