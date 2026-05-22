export class ApplicationError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode = 400,
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class MatchNotFoundError extends ApplicationError {
  constructor(matchId: string) {
    super('MATCH_NOT_FOUND', `Match ${matchId} was not found.`, 404);
  }
}

export class MatchAlreadyFinishedError extends ApplicationError {
  constructor(matchId: string) {
    super('MATCH_ALREADY_FINISHED', `Match ${matchId} is already finished.`, 409);
  }
}

export class InvalidChessMoveError extends ApplicationError {
  constructor(details: unknown) {
    super('INVALID_CHESS_MOVE', 'The requested chess move is not legal for the current board state.', 422, details);
  }
}

export class InvalidAdminPasswordError extends ApplicationError {
  constructor() {
    super('INVALID_ADMIN_PASSWORD', 'Invalid admin password.', 401);
  }
}
