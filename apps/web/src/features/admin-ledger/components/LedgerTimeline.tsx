import {
  Braces,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Crown,
  Database,
  Flag,
  ListTree,
  RadioTower,
  ShieldAlert,
  ShieldCheck,
  Swords
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  BOARD_FILES,
  BOARD_RANKS,
  type BoardSquare,
  type BoardState,
  type CapturedPiece,
  type ChessPiece,
  type LedgerEventType,
  type LedgerEventView,
  type MatchStatus,
  type MoveRecord,
  type PieceColor,
  type PieceType
} from '@chess-ledger/shared';

import { ChessPieceIcon } from '../../chess/components/ChessPieceIcon';
import { ledgerActorLabels, ledgerEventTypeLabels } from '../utils/ledgerFilters';

interface LedgerTimelineProps {
  readonly events: readonly LedgerEventView[];
  readonly emptyMessage: string;
}

interface EventPresentation {
  readonly Icon: LucideIcon;
  readonly iconClass: string;
  readonly badgeClass: string;
}

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'medium'
});

const eventPresentationByType: Record<LedgerEventType, EventPresentation> = {
  MATCH_STARTED: {
    Icon: Flag,
    iconClass: 'bg-emerald-50 text-emerald-700',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-800'
  },
  ONLINE_ROOM_CREATED: {
    Icon: RadioTower,
    iconClass: 'bg-blue-50 text-blue-700',
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-800'
  },
  ONLINE_PLAYER_JOINED: {
    Icon: Swords,
    iconClass: 'bg-cyan-50 text-cyan-700',
    badgeClass: 'border-cyan-200 bg-cyan-50 text-cyan-800'
  },
  ONLINE_MATCH_STARTED: {
    Icon: RadioTower,
    iconClass: 'bg-[#172554] text-white',
    badgeClass: 'border-[#172554] bg-[#172554] text-white'
  },
  MOVE_RECORDED: {
    Icon: ListTree,
    iconClass: 'bg-sky-50 text-sky-700',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-800'
  },
  PIECE_CAPTURED: {
    Icon: Swords,
    iconClass: 'bg-rose-50 text-rose-700',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-800'
  },
  CHECK_DECLARED: {
    Icon: ShieldAlert,
    iconClass: 'bg-amber-50 text-amber-700',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-800'
  },
  CASTLING_PERFORMED: {
    Icon: ShieldCheck,
    iconClass: 'bg-indigo-50 text-indigo-700',
    badgeClass: 'border-indigo-200 bg-indigo-50 text-indigo-800'
  },
  PAWN_PROMOTED: {
    Icon: Crown,
    iconClass: 'bg-fuchsia-50 text-fuchsia-700',
    badgeClass: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800'
  },
  MATCH_FINISHED: {
    Icon: CheckCircle2,
    iconClass: 'bg-stone-900 text-white',
    badgeClass: 'border-stone-900 bg-stone-900 text-white'
  },
  SNAPSHOT_RECORDED: {
    Icon: Database,
    iconClass: 'bg-[#edf1ea] text-[#184a34]',
    badgeClass: 'border-[#cdd8c8] bg-[#edf1ea] text-[#184a34]'
  }
};

const pieceLabelByType: Record<PieceType, string> = {
  pawn: 'Peao',
  knight: 'Cavalo',
  bishop: 'Bispo',
  rook: 'Torre',
  queen: 'Rainha',
  king: 'Rei'
};

const statusLabelByColor: Record<PieceColor, string> = {
  white: 'Brancas',
  black: 'Pretas'
};

const matchStatusLabelByStatus: Record<MatchStatus, string> = {
  active: 'Ativa',
  checkmate: 'Checkmate',
  stalemate: 'Stalemate',
  draw: 'Empate',
  aborted: 'Abortada'
};

export function LedgerTimeline({ events, emptyMessage }: LedgerTimelineProps) {
  if (events.length === 0) {
    return (
      <section className="grid min-h-52 place-items-center rounded-lg border border-dashed border-stone-900/20 bg-white/70 p-6 text-center">
        <div>
          <Database className="mx-auto mb-3 h-8 w-8 text-stone-400" />
          <p className="font-bold text-stone-700">{emptyMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-3" aria-label="Eventos filtrados do ledger">
      {events.map((event) => (
        <LedgerTimelineItem key={event.id} event={event} />
      ))}
    </section>
  );
}

function LedgerTimelineItem({ event }: { readonly event: LedgerEventView }) {
  const presentation = eventPresentationByType[event.type];
  const Icon = presentation.Icon;
  const move = event.payload.move;
  const capturedPiece = event.payload.capturedPiece;

  return (
    <article className="grid gap-3 rounded-lg border border-stone-900/10 bg-white/95 p-4 shadow-[0_8px_24px_rgba(23,25,24,0.08)] sm:grid-cols-[46px_1fr]">
      <div className={`grid h-11 w-11 place-items-center rounded-lg ${presentation.iconClass}`}>
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${presentation.badgeClass}`}>
              {ledgerEventTypeLabels[event.type]}
            </span>
            <span className="rounded-full border border-stone-900/10 bg-stone-50 px-2.5 py-1 text-xs font-bold text-stone-600">
              #{event.sequence}
            </span>
          </div>

          <time className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500" dateTime={event.occurredAt}>
            <CalendarClock size={15} />
            {dateTimeFormatter.format(new Date(event.occurredAt))}
          </time>
        </div>

        <p className="mt-3 text-base leading-7 font-semibold text-stone-950">{event.message}</p>

        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-3">
          <LedgerMetadata label="Partida" value={shortenIdentifier(event.matchId)} title={event.matchId} />
          <LedgerMetadata label="Ator" value={ledgerActorLabels[event.actor]} />
          <LedgerMetadata label="Evento" value={event.type} />
        </dl>

        {move ? <MoveSummary move={move} /> : null}
        {capturedPiece ? <CapturedPieceSummary capturedPiece={capturedPiece} /> : null}
        {event.boardSnapshot ? <BoardSnapshotPanel boardState={event.boardSnapshot} /> : null}
        <LedgerJsonDetails event={event} />
      </div>
    </article>
  );
}

function LedgerMetadata({ label, value, title }: { readonly label: string; readonly value: string; readonly title?: string }) {
  return (
    <div className="min-w-0 rounded-md border border-stone-900/10 bg-stone-50 px-3 py-2">
      <dt className="text-[11px] font-bold text-[#184a34] uppercase">{label}</dt>
      <dd className="mt-0.5 truncate font-semibold text-stone-700" title={title ?? value}>
        {value}
      </dd>
    </div>
  );
}

function MoveSummary({ move }: { readonly move: MoveRecord }) {
  const flags = createMoveFlags(move);

  return (
    <div className="mt-3 rounded-md border border-stone-900/10 bg-[#f8faf5] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#24382a]">
            <ChessPieceIcon piece={{ type: move.piece, color: move.color }} className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-stone-950">
              {pieceLabelByType[move.piece]} {statusLabelByColor[move.color].toLowerCase()}
            </p>
            <p className="text-sm font-medium text-stone-500">
              {move.from.toUpperCase()} -&gt; {move.to.toUpperCase()}
            </p>
          </div>
        </div>

        <code className="w-fit rounded-md bg-stone-950 px-3 py-2 text-sm font-bold text-[#dbe6ce]">{move.san}</code>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <MoveMetric label="Origem" value={move.from.toUpperCase()} />
        <MoveMetric label="Destino" value={move.to.toUpperCase()} />
        <MoveMetric label="Movida em" value={dateTimeFormatter.format(new Date(move.movedAt))} />
      </div>

      {flags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {flags.map((flag) => (
            <span key={flag} className="rounded-full border border-stone-900/10 bg-white px-2.5 py-1 text-xs font-bold text-stone-700">
              {flag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MoveMetric({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-md border border-stone-900/10 bg-white px-3 py-2">
      <p className="text-[11px] font-bold text-stone-500 uppercase">{label}</p>
      <p className="mt-0.5 font-bold text-stone-950">{value}</p>
    </div>
  );
}

function CapturedPieceSummary({ capturedPiece }: { readonly capturedPiece: CapturedPiece }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
      <Swords size={16} />
      {pieceLabelByType[capturedPiece.type]} {ledgerActorLabels[capturedPiece.color].toLowerCase()} capturada em{' '}
      {capturedPiece.capturedAt.toUpperCase()} por {ledgerActorLabels[capturedPiece.capturedBy].toLowerCase()}
    </div>
  );
}

function BoardSnapshotPanel({ boardState }: { readonly boardState: BoardState }) {
  const boardStats = [
    { label: 'Status', value: matchStatusLabelByStatus[boardState.status] },
    { label: 'Vez', value: ledgerActorLabels[boardState.turn] },
    { label: 'Lance', value: String(boardState.fullMoveNumber) },
    { label: 'Pecas', value: String(boardState.pieces.length) },
    { label: 'Capturas', value: String(boardState.capturedPieces.length) },
    { label: 'Jogadas legais', value: String(boardState.legalMoves.length) }
  ];

  return (
    <div className="mt-3 rounded-md border border-stone-900/10 bg-stone-50 p-3">
      <div className="grid gap-4 lg:grid-cols-[minmax(170px,220px)_1fr]">
        <MiniBoard boardState={boardState} />
        <div className="min-w-0">
          <div className="grid gap-2 sm:grid-cols-3">
            {boardStats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-stone-900/10 bg-white px-3 py-2">
                <p className="text-[11px] font-bold text-stone-500 uppercase">{stat.label}</p>
                <p className="mt-0.5 truncate font-bold text-stone-950">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-md border border-stone-900/10 bg-white p-3">
            <p className="mb-2 text-[11px] font-bold text-stone-500 uppercase">FEN</p>
            <code className="block max-h-24 overflow-auto break-all rounded-md bg-stone-950 p-2 text-[11px] leading-5 text-[#dbe6ce]">
              {boardState.fen}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniBoard({ boardState }: { readonly boardState: BoardState }) {
  const piecesBySquare = new Map<BoardSquare, ChessPiece>(boardState.pieces.map((piece) => [piece.square, piece]));
  const ranks = [...BOARD_RANKS].reverse();

  return (
    <div
      className="grid aspect-square w-full max-w-[220px] grid-cols-8 grid-rows-8 overflow-hidden rounded-md border border-stone-900/20 bg-[#24382a]"
      aria-label="Snapshot visual do tabuleiro"
    >
      {ranks.map((rank) =>
        BOARD_FILES.map((file) => {
          const square = `${file}${rank}` as BoardSquare;
          const piece = piecesBySquare.get(square);
          const toneClass =
            (BOARD_FILES.indexOf(file) + BOARD_RANKS.indexOf(rank)) % 2 === 0 ? 'bg-[#4f7b58]' : 'bg-[#dbe6ce]';

          return (
            <div key={square} className={`relative grid min-h-0 min-w-0 place-items-center ${toneClass}`}>
              {piece ? <ChessPieceIcon piece={piece} className="pointer-events-none h-[76%] w-[76%]" /> : null}
            </div>
          );
        })
      )}
    </div>
  );
}

function LedgerJsonDetails({ event }: { readonly event: LedgerEventView }) {
  return (
    <details className="group mt-3 rounded-md border border-stone-900/10 bg-white">
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-bold text-stone-700">
        <span className="inline-flex items-center gap-2">
          <Braces size={16} />
          JSON completo
        </span>
        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
      </summary>
      <pre className="max-h-80 overflow-auto border-t border-stone-900/10 bg-stone-950 p-3 text-xs leading-6 text-[#dbe6ce]">
        {JSON.stringify(createPrettyLedgerJson(event), null, 2)}
      </pre>
    </details>
  );
}

function createMoveFlags(move: MoveRecord): readonly string[] {
  return [
    move.captured ? `Capturou ${pieceLabelByType[move.captured]}` : null,
    move.promotion ? `Promoveu para ${pieceLabelByType[move.promotion]}` : null,
    move.isCastling ? 'Roque' : null,
    move.isCheckmate ? 'Checkmate' : null,
    move.isCheck && !move.isCheckmate ? 'Xeque' : null
  ].filter(isString);
}

function createPrettyLedgerJson(event: LedgerEventView) {
  return {
    ledger: {
      id: event.id,
      matchId: event.matchId,
      sequence: event.sequence,
      type: event.type,
      actor: event.actor,
      occurredAt: event.occurredAt,
      message: event.message
    },
    payload: event.payload,
    boardSnapshot: event.boardSnapshot ?? null
  };
}

function shortenIdentifier(value: string): string {
  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function isString(value: string | null): value is string {
  return typeof value === 'string';
}
