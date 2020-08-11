jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import stringify from 'json-stringify-safe';
import {VerseObjectUtils} from '../src/';

describe('VerseObjectUtils.sortWordObjectsByString', () => {
  it('should return wordObjectsArray sorted and in order from string', function() {
    const string = 'qwerty asdf zxcv uiop jkl; bnm, qwerty asdf zxcv jkl; bnm,';
    const wordObjectArray = [
      {word: 'zxcv', occurrence: 2, occurrences: 2},
      {word: 'qwerty', occurrence: 2, occurrences: 2},
      {word: 'qwerty', occurrence: 1, occurrences: 2},
      {word: 'zxcv', occurrence: 1, occurrences: 2}
    ];
    const output = VerseObjectUtils.sortWordObjectsByString(
      wordObjectArray, string);
    const expected = [
      {word: 'qwerty', occurrence: 1, occurrences: 2},
      {word: 'zxcv', occurrence: 1, occurrences: 2},
      {word: 'qwerty', occurrence: 2, occurrences: 2},
      {word: 'zxcv', occurrence: 2, occurrences: 2}
    ];
    expect(output).toEqual(expected);
  });
  it('should return wordObjectsArray sorted and in order from stringWordObjects', function() {
    const stringData = [
      {word: 'qwerty', occurrence: 1, occurrences: 2, stringData: 0},
      {word: 'zxcv', occurrence: 1, occurrences: 2, stringData: 0},
      {word: 'qwerty', occurrence: 2, occurrences: 2, stringData: 0},
      {word: 'zxcv', occurrence: 2, occurrences: 2, stringData: 0}
    ];
    const wordObjectArray = [
      {word: 'zxcv', occurrence: 2, occurrences: 2, wordObjectData: 1},
      {word: 'qwerty', occurrence: 1, occurrences: 2, wordObjectData: 1}
    ];
    const output = VerseObjectUtils.sortWordObjectsByString(
      wordObjectArray, stringData);
    const expected = [
      {word: 'qwerty', occurrence: 1, occurrences: 2, wordObjectData: 1},
      {word: 'zxcv', occurrence: 2, occurrences: 2, wordObjectData: 1}
    ];
    expect(output).toEqual(expected);
  });
});

describe('VerseObjectUtils.getWordsFromVerseObjects', () => {
  it('should flatten out vereseObject children with single nested objects', () => {
    const {verseObjects} = require('./fixtures/pivotAlignmentVerseObjects/matt1-1b.json');
    expect(VerseObjectUtils.getWordsFromVerseObjects(verseObjects)).toEqual([{
      tag: 'w',
      type: 'word',
      text: 'son',
      occurrence: 1,
      occurrences: 2
    },
    {
      "text": " ",
      "type": "text"
    },
    {
      tag: 'w',
      type: 'word',
      text: 'of',
      occurrence: 1,
      occurrences: 2
    },
    {
      "text": " ",
      "type": "text"
    },
    {
      tag: 'w',
      type: 'word',
      text: 'David',
      occurrence: 1,
      occurrences: 1
    },
    {type: 'text', text: ', '},
    {
      tag: 'w',
      type: 'word',
      text: 'son',
      occurrence: 2,
      occurrences: 2
    },
    {
      "text": " ",
      "type": "text"
    },
    {
      tag: 'w',
      type: 'word',
      text: 'of',
      occurrence: 2,
      occurrences: 2
    },
    {
      "text": " ",
      "type": "text"
    },
    {
      tag: 'w',
      type: 'word',
      text: 'Abraham',
      occurrence: 1,
      occurrences: 1
    },
    {type: 'text', text: '.'}]);
  });

  it('should flatten out vereseObject children with double nested objects', () => {
    const {verseObjects} = require('./fixtures/pivotAlignmentVerseObjects/oneToMany.json');
    expect(VerseObjectUtils.getWordsFromVerseObjects(verseObjects)).toEqual([{
      tag: 'w',
      type: 'word',
      text: 'de',
      occurrence: 1,
      occurrences: 1
    },
    {
      "text": " ",
      "type": "text"
    },
    {
      tag: 'w',
      type: 'word',
      text: 'Jesucristo',
      occurrence: 1,
      occurrences: 1
    }]);
  });
});

describe("getOrderedVerseObjectsFromString", () => {
  it('handles words without punctuation', () => {
    const string = "hello world";
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "hello",
        occurrence: 1,
        occurrences: 1
      },
      {
        "text": " ",
        "type": "text"
      },
      {
        tag: "w",
        type: "word",
        text: "world",
        occurrence: 1,
        occurrences: 1
      }
    ];
    const expectedWordCount = expected.filter(item => (item.type === "word")).length;
    const {newVerseObjects, wordMap} = VerseObjectUtils.getOrderedVerseObjectsFromString(string);
    expect(newVerseObjects).toEqual(expected);
    expect(wordMap.length).toEqual(expectedWordCount);
  });

  it('handles words with punctuation', () => {
    const string = "hello, world.";
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "hello",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: ", "
      },
      {
        tag: "w",
        type: "word",
        text: "world",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: "."
      }
    ];
    const expectedWordCount = expected.filter(item => (item.type === "word")).length;
    const {newVerseObjects, wordMap} = VerseObjectUtils.getOrderedVerseObjectsFromString(string);
    expect(newVerseObjects).toEqual(expected);
    expect(wordMap.length).toEqual(expectedWordCount);
  });

  it('handles multiple occurrences of words and punctuation', () => {
    const string = "son of David, son of Abraham.";
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 1,
        occurrences: 2
      },
      {
        "text": " ",
        "type": "text"
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 1,
        occurrences: 2
      },
      {
        "text": " ",
        "type": "text"
      },
      {
        tag: "w",
        type: "word",
        text: "David",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: ", "
      },
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 2,
        occurrences: 2
      },
      {
        "text": " ",
        "type": "text"
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 2,
        occurrences: 2
      },
      {
        "text": " ",
        "type": "text"
      },
      {
        tag: "w",
        type: "word",
        text: "Abraham",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: "."
      }
    ];
    const expectedWordCount = expected.filter(item => (item.type === "word")).length;
    const {newVerseObjects, wordMap} = VerseObjectUtils.getOrderedVerseObjectsFromString(string);
    expect(newVerseObjects).toEqual(expected);
    expect(wordMap.length).toEqual(expectedWordCount);
  });

  it('handles embeded markers like footnotes', () => {
    const string = "son of David, son of Abraham. \\f Footnotes shouldn't be rendered as text but as content in their own object.\\f*";
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 1,
        occurrences: 2
      },
      {
        "text": " ",
        "type": "text"
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 1,
        occurrences: 2
      },
      {
        "text": " ",
        "type": "text"
      },
      {
        tag: "w",
        type: "word",
        text: "David",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: ", "
      },
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 2,
        occurrences: 2
      },
      {
        "text": " ",
        "type": "text"
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 2,
        occurrences: 2
      },
      {
        "text": " ",
        "type": "text"
      },
      {
        tag: "w",
        type: "word",
        text: "Abraham",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: ". "
      },
      {
        tag: "f",
        type: "footnote",
        endTag: "f*",
        content: "Footnotes shouldn't be rendered as text but as content in their own object."
      }
    ];
    const expectedWordCount = expected.filter(item => (item.type === "word")).length;
    const {newVerseObjects, wordMap} = VerseObjectUtils.getOrderedVerseObjectsFromString(string);
    expect(newVerseObjects).toEqual(expected);
    expect(wordMap.length).toEqual(expectedWordCount);
  });
});

describe("getWordListFromVerseObjectArray", () => {
  it('handles arrays with nested milestones and text', () => {
    // given
    const testFile = path.join('__tests__', 'fixtures', 'verseObjects', 'tit1-4.json');
    const testData = fs.readJSONSync(testFile);
    const expected = "Τίτῳ γνησίῳ τέκνῳ κατὰ κοινὴν πίστιν χάρις καὶ εἰρήνη ἀπὸ Θεοῦ Πατρὸς καὶ Χριστοῦ Ἰησοῦ τοῦ Σωτῆρος ἡμῶν";

    // when
    const results = VerseObjectUtils.getWordListFromVerseObjectArray(testData);

    // then
    const verseWords = VerseObjectUtils.mergeVerseData(results);
    expect(verseWords).toEqual(expected);
  });

  it('handles en ULT', () => {
    // given
    const testFile = path.join('__tests__', 'fixtures', 'verseObjects', 'mat-4-6.json');
    const testData = fs.readJSONSync(testFile);
    const expected = "and said to him If you are the Son of God throw yourself down for it is written He will command his angels to take care of you and They will lift you up in their hands so that you will not hit your foot against a stone";

    // when
    const results = VerseObjectUtils.getWordListFromVerseObjectArray(testData);

    // then
    const verseWords = VerseObjectUtils.mergeVerseData(results);
    expect(verseWords).toEqual(expected);
  });

  it('handles numbers', () => {
    // given
    const testFile = path.join('__tests__', 'fixtures', 'verseObjects', 'gal-3-17.json');
    const testData = fs.readJSONSync(testFile);
    const expected = "Now what I mean is this The law which came 430 years afterward does not set aside the covenant previously established by God so as to nullify the promise";

    // when
    const results = VerseObjectUtils.getWordListFromVerseObjectArray(testData);

    // then
    const verseWords = VerseObjectUtils.mergeVerseData(results);
    expect(verseWords).toEqual(expected);
  });
});

describe("getWordListForVerse", () => {
  it('handles arrays with punctuation', () => {
    // given
    const testFile = path.join('__tests__', 'fixtures', 'verseObjects', 'heb-12-27.grc.json');
    const testData = fs.readJSONSync(testFile);

    // when
    const results = VerseObjectUtils.getWordListForVerse(testData.verseObjects);

    // then
    expect(results).toEqual(testData.wordList);
  });

  it('handles multiple original language words in alignment', () => {
    // given
    const testFile = path.join('__tests__', 'fixtures', 'verseObjects', 'est-8-6.ust.json');
    const testData = fs.readJSONSync(testFile);

    // when
    const results = VerseObjectUtils.getWordListForVerse(testData.verseObjects);

    // then
    // TRICKY: handle circular references
    expect(stringify(results, null, 2)).toEqual(stringify(testData.wordList, null, 2));
  });
});
