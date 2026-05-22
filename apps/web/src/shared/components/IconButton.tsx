import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon: ReactNode;
  readonly label: string;
}

export function IconButton({ icon, label, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      {...props}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-900/10 bg-white text-stone-950 transition hover:-translate-y-0.5 ${props.className ?? ''}`.trim()}
    >
      {icon}
    </button>
  );
}
