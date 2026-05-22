export interface AdminTokenPayload {
  readonly subject: 'admin-ledger';
  readonly expiresAt: string;
}

export interface AdminTokenPort {
  readonly issue: () => AdminTokenPayload & { readonly token: string };
  readonly verify: (token: string) => AdminTokenPayload | null;
}

export const ADMIN_TOKEN_PORT = Symbol('ADMIN_TOKEN_PORT');
