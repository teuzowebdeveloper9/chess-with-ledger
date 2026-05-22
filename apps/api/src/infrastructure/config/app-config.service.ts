import { Injectable } from '@nestjs/common';

interface EnvReader {
  readonly get: (key: string) => string | undefined;
}

@Injectable()
export class AppConfigService {
  readonly nodeEnv: string;
  readonly port: number;
  readonly frontendOrigin: string;
  readonly databaseUrl: string;
  readonly dynamoDbEndpoint: string;
  readonly dynamoDbRegion: string;
  readonly dynamoDbLedgerTable: string;
  readonly adminLedgerPassword: string;
  readonly adminSessionSecret: string;

  constructor(env: EnvReader = { get: (key) => process.env[key] }) {
    this.nodeEnv = env.get('NODE_ENV') ?? 'development';
    this.port = this.readNumber(env, 'API_PORT', 3000);
    this.frontendOrigin = env.get('FRONTEND_ORIGIN') ?? 'http://localhost:5173';
    this.databaseUrl = this.readRequired(env, 'DATABASE_URL');
    this.dynamoDbEndpoint = env.get('DYNAMODB_ENDPOINT') ?? 'http://localhost:8000';
    this.dynamoDbRegion = env.get('DYNAMODB_REGION') ?? 'us-east-1';
    this.dynamoDbLedgerTable = env.get('DYNAMODB_LEDGER_TABLE') ?? 'ChessLedgerEvents';
    this.adminLedgerPassword = this.readRequired(env, 'ADMIN_LEDGER_PASSWORD');
    this.adminSessionSecret =
      env.get('ADMIN_SESSION_SECRET') ?? `${this.adminLedgerPassword}:local-session-secret`;
  }

  private readRequired(env: EnvReader, key: string): string {
    const value = env.get(key);
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
  }

  private readNumber(env: EnvReader, key: string, fallback: number): number {
    const value = env.get(key);
    if (!value) {
      return fallback;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error(`Environment variable ${key} must be a positive integer.`);
    }

    return parsed;
  }
}
