import { Database, Flag, ListTree, ShieldCheck } from 'lucide-react';
import type { LedgerEventType, LedgerEventView } from '@chess-ledger/shared';

const iconByEventType: Record<LedgerEventType, typeof Database> = {
  MATCH_STARTED: Flag,
  MOVE_RECORDED: ListTree,
  PIECE_CAPTURED: ShieldCheck,
  CHECK_DECLARED: ShieldCheck,
  CASTLING_PERFORMED: ShieldCheck,
  PAWN_PROMOTED: ShieldCheck,
  MATCH_FINISHED: Flag,
  SNAPSHOT_RECORDED: Database
};

interface LedgerTimelineProps {
  readonly events: readonly LedgerEventView[];
}

export function LedgerTimeline({ events }: LedgerTimelineProps) {
  return (
    <section className="grid gap-3" aria-label="Eventos do ledger">
      {events.map((event) => (
        <LedgerTimelineItem key={event.id} event={event} />
      ))}
      {events.length === 0 ? <p className="text-stone-500">Nenhum evento registrado no ledger.</p> : null}
    </section>
  );
}

function LedgerTimelineItem({ event }: { readonly event: LedgerEventView }) {
  const Icon = iconByEventType[event.type];

  return (
    <article className="grid grid-cols-[42px_1fr] gap-3 rounded-lg border border-stone-900/10 bg-white/90 p-3.5 shadow-[0_8px_24px_rgba(23,25,24,0.08)]">
      <div className="grid h-[42px] w-[42px] place-items-center rounded-lg bg-[#edf1ea] text-[#184a34]">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <strong>{event.type}</strong>
          <span>#{event.sequence}</span>
        </div>
        <p className="my-2 text-stone-500">{event.message}</p>
        <dl className="m-0 flex flex-wrap items-center gap-x-4 gap-y-2.5">
          <div className="min-w-40">
            <dt className="text-[11px] font-extrabold text-[#184a34] uppercase">Partida</dt>
            <dd className="mt-0.5 break-all text-sm text-stone-500">{event.matchId}</dd>
          </div>
          <div className="min-w-40">
            <dt className="text-[11px] font-extrabold text-[#184a34] uppercase">Ator</dt>
            <dd className="mt-0.5 text-sm text-stone-500">{event.actor}</dd>
          </div>
          <div className="min-w-40">
            <dt className="text-[11px] font-extrabold text-[#184a34] uppercase">Horario</dt>
            <dd className="mt-0.5 text-sm text-stone-500">{new Date(event.occurredAt).toLocaleString()}</dd>
          </div>
        </dl>
        {event.boardSnapshot ? (
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-stone-950 p-3 text-xs leading-6 text-[#dbe6ce]">
            {JSON.stringify(event.boardSnapshot, null, 2)}
          </pre>
        ) : null}
      </div>
    </article>
  );
}
