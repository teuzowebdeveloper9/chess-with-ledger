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

export class OnlineRoomNotFoundError extends ApplicationError {
  constructor(roomCode: string) {
    super('ONLINE_ROOM_NOT_FOUND', `Online room ${roomCode} was not found.`, 404);
  }
}

export class OnlineRoomAlreadyStartedError extends ApplicationError {
  constructor(roomCode: string) {
    super('ONLINE_ROOM_ALREADY_STARTED', `Online room ${roomCode} already has two players.`, 409);
  }
}

export class OnlineMatchNotStartedError extends ApplicationError {
  constructor(matchId: string) {
    super('ONLINE_MATCH_NOT_STARTED', `Online match ${matchId} is waiting for the second player.`, 409);
  }
}

export class InvalidOnlinePlayerError extends ApplicationError {
  constructor(details: unknown) {
    super('INVALID_ONLINE_PLAYER', 'This online player cannot make the requested move.', 403, details);
  }
}

export class InvalidAdminPasswordError extends ApplicationError {
  constructor() {
    super('INVALID_ADMIN_PASSWORD', 'Invalid admin password.', 401);
  }
}
