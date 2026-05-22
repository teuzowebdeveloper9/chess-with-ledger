import type { PromotionPieceType } from '@chess-ledger/shared';

import { PieceTypeIcon } from './ChessPieceIcon';

const promotionOptions: readonly PromotionPieceType[] = ['queen', 'rook', 'bishop', 'knight'];

interface PromotionDialogProps {
  readonly onChoose: (promotion: PromotionPieceType) => void;
  readonly onCancel: () => void;
}

export function PromotionDialog({ onChoose, onCancel }: PromotionDialogProps) {
  return (
    <div className="fixed inset-0 grid place-items-center bg-stone-950/55 p-5" role="presentation">
      <div
        className="w-full max-w-[460px] rounded-lg border border-stone-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(23,25,24,0.18)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="promotion-title"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="promotion-title" className="text-lg leading-tight font-bold tracking-normal text-stone-950">
            Promocao de peao
          </h2>
          <button type="button" className="font-bold text-[#184a34] transition hover:-translate-y-0.5" onClick={onCancel}>
            Cancelar
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {promotionOptions.map((promotion) => (
            <button
              key={promotion}
              type="button"
              className="grid min-h-22 cursor-pointer place-items-center gap-1 rounded-lg border border-stone-900/10 bg-[#edf1ea] text-xs font-extrabold text-stone-950 transition hover:-translate-y-0.5 hover:border-[#2f6f4e]/40"
              onClick={() => onChoose(promotion)}
            >
              <PieceTypeIcon type={promotion} color="white" />
              <span>{promotion}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
