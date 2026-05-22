import { BOARD_FILES, BOARD_RANKS, isBoardSquare, oppositeColor } from './index';

describe('shared chess contracts', () => {
  it('validates algebraic board squares', () => {
    expect(isBoardSquare('a1')).toBe(true);
    expect(isBoardSquare('h8')).toBe(true);
    expect(isBoardSquare('i9')).toBe(false);
    expect(isBoardSquare('A1')).toBe(false);
  });

  it('keeps board coordinates explicit', () => {
    expect(BOARD_FILES).toHaveLength(8);
    expect(BOARD_RANKS).toHaveLength(8);
  });

  it('switches player color deterministically', () => {
    expect(oppositeColor('white')).toBe('black');
    expect(oppositeColor('black')).toBe('white');
  });
});
