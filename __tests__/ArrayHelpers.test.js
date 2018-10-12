/* eslint-env jest */
import * as ArrayUtils from '../src/js/utils/array';

describe("groupConsecutiveNumbers", () => {
  it('handles all consecutive numbers', () => {
    const numbers = [1, 2, 3, 4];
    const a = [];
    const wordMap = createWordMap(5, a);
    const result = ArrayUtils.groupConsecutiveNumbers(numbers, wordMap);
    const expected = [[1, 2, 3, 4]];
    expect(result).toEqual(expected);
  });
  it('handles all non-consecutive numbers', () => {
    const numbers = [1, 3, 5, 7];
    const a = [];
    const wordMap = createWordMap(8, a);
    const result = ArrayUtils.groupConsecutiveNumbers(numbers, wordMap);
    const expected = [[1], [3], [5], [7]];
    expect(result).toEqual(expected);
  });
  it('handles mixed consecutive and non-consecutive numbers', () => {
    const numbers = [1, 2, 4, 3, 5, 6];
    const a = [];
    const wordMap = createWordMap(7, a);
    const result = ArrayUtils.groupConsecutiveNumbers(numbers, wordMap);
    const expected = [[1, 2], [4], [3], [5, 6]];
    expect(result).toEqual(expected);
  });
  it('handles out of order numbers', () => {
    const numbers = [4, 3, 2, 1];
    const a = [];
    const wordMap = createWordMap(7, a);
    const result = ArrayUtils.groupConsecutiveNumbers(numbers, wordMap);
    const expected = [[4], [3], [2], [1]];
    expect(result).toEqual(expected);
  });
  it('handles all consecutive numbers with nested verseObjects', () => {
    const numbers = [1, 2, 3, 4];
    const a = [];
    const b = [];
    const wordMap = createWordMap(3, a).concat(createWordMap(3, b));
    const result = ArrayUtils.groupConsecutiveNumbers(numbers, wordMap);
    const expected = [[1, 2], [3, 4]];
    expect(result).toEqual(expected);
  });
});

describe("deleteIndices", () => {
  it('handles deleting first', () => {
    const array = [];
    const wordMap = createWordMap(4, array);
    const index = [0];
    const result = ArrayUtils.deleteIndices(array, index, wordMap);
    const expected = [{word: 1}, {word: 2}, {word: 3}];
    expect(result).toEqual(expected);
  });
  it('handles deleting last', () => {
    const array = [];
    const wordMap = createWordMap(4, array);
    const index = [array.length - 1];
    const result = ArrayUtils.deleteIndices(array, index, wordMap);
    const expected = [{word: 0}, {word: 1}, {word: 2}];
    expect(result).toEqual(expected);
  });
  it('handles deleting middle', () => {
    const array = [];
    const wordMap = createWordMap(4, array);
    const index = [1];
    const result = ArrayUtils.deleteIndices(array, index, wordMap);
    const expected = [{word: 0}, {word: 2}, {word: 3}];
    expect(result).toEqual(expected);
  });
  it('handles deleting multiples', () => {
    const array = [];
    const wordMap = createWordMap(4, array);
    const index = [0, 2, 3];
    const result = ArrayUtils.deleteIndices(array, index, wordMap);
    const expected = [{word: 1}];
    expect(result).toEqual(expected);
  });
  it('handles deleting all', () => {
    const array = [];
    const wordMap = createWordMap(4, array);
    const index = [0, 1, 2, 3];
    const result = ArrayUtils.deleteIndices(array, index, wordMap);
    const expected = [];
    expect(result).toEqual(expected);
  });
  it('handles deleting none', () => {
    const array = [];
    const wordMap = createWordMap(4, array);
    const index = [];
    const result = ArrayUtils.deleteIndices(array, index, wordMap);
    const expected = [{word: 0}, {word: 1}, {word: 2}, {word: 3}];
    expect(result).toEqual(expected);
  });
  it('handles deleting out of range', () => {
    const array = [];
    const wordMap = createWordMap(4, array);
    const index = [10];
    const result = ArrayUtils.deleteIndices(array, index, wordMap);
    const expected = [{word: 0}, {word: 1}, {word: 2}, {word: 3}];
    expect(result).toEqual(expected);
  });
  it('handles deleting out of range -1 if element not found', () => {
    const array = [];
    const wordMap = createWordMap(4, array);
    const index = [-1];
    const result = ArrayUtils.deleteIndices(array, index, wordMap);
    const expected = [{word: 0}, {word: 1}, {word: 2}, {word: 3}];
    expect(result).toEqual(expected);
  });
});

//
// helpers
//

function createWordMap(size, array) {
  const wordMap = [];
  for (let pos = 0; pos < size; pos++) {
    wordMap.push({
      array,
      pos
    });
    array.push({word: pos});
  }
  return wordMap;
}
