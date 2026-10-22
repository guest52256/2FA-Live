import { beforeEach, describe, expect, it } from 'vitest';

import {
  HISTORY_STORAGE_KEY,
  MAX_HISTORY,
  addToHistory,
  clearHistory,
  loadHistory,
  maskSecret,
  saveHistory,
} from './history';

describe('history cache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty', () => {
    expect(loadHistory()).toEqual([]);
  });

  it('stores the newest secret first', () => {
    addToHistory('AAAAAAAAAAAAAAAA');
    addToHistory('BBBBBBBBBBBBBBBB');
    expect(loadHistory()).toEqual(['BBBBBBBBBBBBBBBB', 'AAAAAAAAAAAAAAAA']);
  });

  it('de-duplicates and moves an existing secret back to the front', () => {
    addToHistory('AAAAAAAAAAAAAAAA');
    addToHistory('BBBBBBBBBBBBBBBB');
    addToHistory('AAAAAAAAAAAAAAAA');
    expect(loadHistory()).toEqual(['AAAAAAAAAAAAAAAA', 'BBBBBBBBBBBBBBBB']);
  });

  it('keeps only the three most recent secrets', () => {
    addToHistory('AAAAAAAA');
    addToHistory('BBBBBBBB');
    addToHistory('CCCCCCCC');
    addToHistory('DDDDDDDD');
    expect(loadHistory()).toHaveLength(MAX_HISTORY);
    expect(loadHistory()).toEqual(['DDDDDDDD', 'CCCCCCCC', 'BBBBBBBB']);
  });

  it('ignores an empty secret', () => {
    addToHistory('');
    expect(loadHistory()).toEqual([]);
  });

  it('persists under the expected localStorage key', () => {
    addToHistory('ABCDEFGH');
    expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toBe('["ABCDEFGH"]');
  });

  it('survives corrupted storage', () => {
    localStorage.setItem(HISTORY_STORAGE_KEY, 'not json');
    expect(loadHistory()).toEqual([]);
    localStorage.setItem(HISTORY_STORAGE_KEY, '{"a":1}');
    expect(loadHistory()).toEqual([]);
  });

  it('ignores non-string entries', () => {
    localStorage.setItem(HISTORY_STORAGE_KEY, '["OK", 42, null]');
    expect(loadHistory()).toEqual(['OK']);
  });

  it('clears the cache', () => {
    addToHistory('ABCDEFGH');
    clearHistory();
    expect(loadHistory()).toEqual([]);
    expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toBeNull();
  });

  it('trims on save', () => {
    saveHistory(['A', 'B', 'C', 'D', 'E']);
    expect(loadHistory()).toHaveLength(MAX_HISTORY);
  });
});

describe('maskSecret', () => {
  it('shows only the first and last four characters', () => {
    expect(maskSecret('JBSWY3DPEHPK3PXP')).toBe('JBSW •••• 3PXP');
  });

  it('masks very short secrets entirely', () => {
    expect(maskSecret('ABC')).toBe('A ••••');
  });
});
