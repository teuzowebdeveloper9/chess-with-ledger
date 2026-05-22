import { InvalidChessMoveError } from '../../application/errors/application.error';
import { ChessJsRulesEngine } from './chess-js-rules.engine';

describe('ChessJsRulesEngine', () => {
  it('creates the initial local match board state', () => {
    const engine = new ChessJsRulesEngine();

    const state = engine.createInitialState();

    expect(state.turn).toBe('white');
    expect(state.status).toBe('active');
    expect(state.pieces).toHaveLength(32);
    expect(state.legalMoves.length).toBeGreaterThan(0);
  });

  it('applies a legal move and returns ledger events with a snapshot', () => {
    const engine = new ChessJsRulesEngine();
    const initialState = engine.createInitialState();

    const result = engine.applyMove(initialState, { from: 'e2', to: 'e4' }, '2026-05-21T12:00:00.000Z');

    expect(result.boardState.turn).toBe('black');
    expect(result.boardState.history).toHaveLength(1);
    expect(result.boardState.history[0]?.san).toBe('e4');
    expect(result.ledgerEvents.map((event) => event.type)).toContain('MOVE_RECORDED');
    expect(result.ledgerEvents.map((event) => event.type)).toContain('SNAPSHOT_RECORDED');
  });

  it('rejects an illegal move', () => {
    const engine = new ChessJsRulesEngine();
    const initialState = engine.createInitialState();

    expect(() => engine.applyMove(initialState, { from: 'e2', to: 'e5' }, '2026-05-21T12:00:00.000Z')).toThrow(
      InvalidChessMoveError
    );
  });
});
