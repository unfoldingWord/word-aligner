/* eslint-disable no-use-before-define */
/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path';
import usfmjs from 'usfm-js';
jest.unmock('fs-extra');
import wordaligner, {VerseObjectUtils} from '../src/';
const RESOURCES = path.join('__tests__', 'fixtures', 'pivotAlignmentVerseObjects');

describe("Merge Alignment into Verse Objects", () => {
  it('handles one to one', () => {
    mergeTest('oneToOne');
  });
  it('handles one to many', () => {
    mergeTest('oneToMany');
  });
  it('handles many to one', () => {
    mergeTest('manyToOne');
  });
  it('handles many to many', () => {
    mergeTest('manyToMany');
  });
  it('handles one to none', () => {
    mergeTest('oneToNone');
  });
  it('handles out of order', () => {
    mergeTest('outOfOrder');
  });
  it('handles matt 1-1a', () => {
    mergeTest('matt1-1a');
  });
  it('handles matt 1-1b', () => {
    mergeTest('matt1-1b');
  });
  it('handles matt 1-1', () => {
    mergeTest('matt1-1');
  });
  it('handles mat-4-6', () => {
    mergeTest('mat-4-6');
  });
  it('handles mat-4-6.whitespace', () => {
    mergeTest('mat-4-6.whitespace');
  });
  it('handles noncontiguous', () => {
    mergeTest('noncontiguous');
  });
  it('handles contiguousAndNonContiguous', () => {
    mergeTest('contiguousAndNonContiguous');
  });
  it('handles titus 1-1', () => {
    mergeTest('tit1-1');
  });
  it('handles 1 timothy 3-16', () => {
    mergeTest('v_1ti3-16');
  });
  it('handles acts 1-11', () => {
    mergeTest('acts-1-11');
  });
  it('handles acts 1-4', () => {
    mergeTest('acts-1-4');
  });
  it('handles acts 19-41', () => {
    mergeTest('acts-19-41');
  });
  it('handles acts-1-4-unaligned-nested', () => {
    let fail = false;
    try {
      mergeTest('acts-1-4-unaligned-nested');
      fail = false;
    } catch (e) {
      console.log(e);
      fail = true;
    }
    expect(fail).toBeTruthy();
  });
  it('handles titus 1-12', () => {
    mergeTest('tit1-12');
  });
  it('handles gal 3-17', () => {
    mergeTest('gal-3-17');
  });
});

describe("UnMerge Alignment from Verse Objects", () => {
  it('handles one to one', () => {
    unmergeTest('oneToOne');
  });
  it('handles one to many', () => {
    unmergeTest('oneToMany');
  });
  it('handles many to one', () => {
    unmergeTest('manyToOne');
  });
  it('handles many to many', () => {
    unmergeTest('manyToMany');
  });
  it('handles one to none', () => {
    unmergeTest('oneToNone');
  });
  it('handles matt 1-1a', () => {
    unmergeTest('matt1-1a');
  });
  it('handles matt 1-1b', () => {
    unmergeTest('matt1-1b');
  });
  it('handles matt 1-1', () => {
    unmergeTest('matt1-1');
  });
  it('handles mat-4-6', () => {
    unmergeTest('mat-4-6');
  });
  it('handles mat-4-6.whitespace', () => {
    unmergeTest('mat-4-6.whitespace');
  });
  it('handles noncontiguous', () => {
    unmergeTest('noncontiguous');
  });
  it('handles contiguousAndNonContiguous', () => {
    unmergeTest('contiguousAndNonContiguous');
  });
  it('handles titus 1-1', () => {
    unmergeTest('tit1-1');
  });
  it('handles titus 1-1 nested milestones', () => {
    unmergeTest('tit1-1.nested_milestones');
  });
  it('handles titus 1-1 nested milestones, merged greek', () => {
    unmergeTest('tit1-1.nested_milestones_merged_greek');
  });
  it('handles 1 timothy 3-16', () => {
    unmergeTest('v_1ti3-16');
  });
  it('handles acts 1-11', () => {
    unmergeTest('acts-1-11');
  });
  it('handles acts 1-4', () => {
    unmergeTest('acts-1-4');
  });
  it('handles titus 1-12', () => {
    unmergeTest('tit1-12');
  });
  it('handles gal 3-17', () => {
    unmergeTest('gal-3-17');
  });
});

describe("export USFM3 with merged alignments", () => {
  it('handles acts-1-11', () => {
    exportTest('acts-1-11');
  });
  it('handles acts 1-4', () => {
    exportTest('acts-1-4');
  });
  it('handles mat-4-6.whitespace', () => {
    exportTest('mat-4-6.whitespace');
  });
});

describe('wordaligner.generateBlankAlignments', () => {
  const createEmptyAlignment = function(verseObjects) {
    let wordList = VerseObjectUtils.getWordList(verseObjects);
    wordList = VerseObjectUtils.populateOccurrencesInWordObjects(wordList);
    const nullAlignments = wordList.map(word => {
      return {
        topWords: [
          {
            word: word.text,
            strong: word.strong,
            lemma: word.lemma,
            morph: word.morph,
            occurrence: word.occurrence,
            occurrences: word.occurrences
          }
        ],
        bottomWords: []
      };
    });
    return nullAlignments;
  };
  it('should generate blank alignment from nested objects', () => {
    // given
    const testData = require('./fixtures/pivotAlignmentVerseObjects/tit1-1.nested_milestones.json');
    const nullAlignments = createEmptyAlignment(testData.alignedVerseString);

    // when
    const results = wordaligner.generateBlankAlignments(
      testData.alignedVerseString);

    // then
    expect(results).toEqual(nullAlignments);
  });

  it('should generate blank alignment from string', () => {
    // given
    const testData = require('./fixtures/pivotAlignmentVerseObjects/tit1-1.nested_milestones.json');
    const nullAlignments = createEmptyAlignment(testData.verseString);

    // when
    const results = wordaligner.generateBlankAlignments(testData.verseString);

    // then
    expect(results).toEqual(nullAlignments);
  });

  //
  // helpers
  //
});

describe('wordaligner.generateWordBank', () => {
  const createEmptyWordBank = function(verseObjects) {
    let wordList = VerseObjectUtils.getWordList(verseObjects);
    wordList = VerseObjectUtils.populateOccurrencesInWordObjects(wordList);
    const wordBank = wordList.map(word => {
      return {
        word: word.text,
        occurrence: word.occurrence,
        occurrences: word.occurrences
      };
    });
    return wordBank;
  };
  it('should generate blank alignment from string', () => {
    // given
    const testData = require('./fixtures/pivotAlignmentVerseObjects/tit1-1.nested_milestones.json');
    const wordBank = createEmptyWordBank(testData.verseString);

    // when
    const results = wordaligner.generateWordBank(testData.verseString);

    // then
    expect(results).toEqual(wordBank);
  });

  it('should generate blank alignment from nested objects', () => {
    // given
    const testData = require('./fixtures/pivotAlignmentVerseObjects/tit1-1.nested_milestones.json');
    const wordBank = createEmptyWordBank(testData.alignedVerseString);

    // when
    const results = wordaligner.generateWordBank(testData.alignedVerseString);

    // then
    expect(results).toEqual(wordBank);
  });
});

//
// helpers
//

/**
 * Reads a json file from the resources dir
 * @param {string} filename relative path to usfm file
 * @return {Object} - The read JSON object
 */
const readJSON = filename => {
  const fullPath = path.join(RESOURCES, filename);
  if (fs.existsSync(fullPath)) {
    const json = fs.readJsonSync(fullPath);
    return json;
  }
  console.log('File not found.');
  return false;
};

/**
 * Reads a usfm file from the resources dir
 * @param {string} filename relative path to usfm file
 * @return {Object} - The read JSON object
 */
const readUSFM = filename => {
  const fullPath = path.join(RESOURCES, filename);
  if (fs.existsSync(fullPath)) {
    const usfm = fs.readFileSync(fullPath, 'UTF-8').toString();
    return usfm;
  }
  console.log('File not found.');
  return false;
};

/**
 * Generator for testing merging of alignment into verseObjects
 * @param {string} name - the name of the test files to use. e.g. `valid` will test `valid.usfm` to `valid.json`
 */
const mergeTest = (name = {}) => {
  const json = readJSON(`${name}.json`);
  expect(json).toBeTruthy();
  const {alignment, verseObjects, verseString, wordBank} = json;
  const output = wordaligner.merge(alignment, wordBank, verseString);
  expect(output).toEqual(verseObjects);
};

/**
 * Generator for testing unmerging of alignment from verseObjects
 * @param {string} name - the name of the test files to use. e.g. `valid` will test `valid.usfm` to `valid.json`
 */
const unmergeTest = (name = {}) => {
  const json = readJSON(`${name}.json`);
  expect(json).toBeTruthy();
  const {verseObjects, alignment, wordBank, alignedVerseString} = json;
  const output = wordaligner.unmerge(verseObjects, alignedVerseString);
  expect(output).toEqual({alignment, wordBank});
};

function normalizeAtributesAlign(tag, source) {
  let parts = source.split(tag);
  const length = parts.length;
  for (let i = 1; i < length; i++) {
    const part = parts[i];
    let endMarker = "\n";
    const posEndMarker = part.indexOf("\\*");
    if (posEndMarker >= 0) {
      const posNewLine = part.indexOf('\n');
      if ((posNewLine < 0) || (posNewLine > posEndMarker)) {
        endMarker = "\\*"; // old format ended at new line
      }
    }
    let lines = part.split(endMarker);
    let attributes = lines[0].split(' ');
    attributes = attributes.sort();
    const newAttributes = attributes.join(' ');
    lines[0] = newAttributes;
    parts[i] = lines.join(endMarker);
  }
  const normalized = parts.join(tag);
  return normalized;
}

function normalizeAtributesWord(tag, source) {
  let parts = source.split(tag);
  const length = parts.length;
  for (let i = 1; i < length; i++) {
    const item = parts[i];
    if (item.substr(0, 1) !== '*') {
      let sections = item.split('|');
      if (sections <= 1) {
        console.log("Broken word tag: " + item);
      } else {
        const text = sections[0];
        let attributes = sections[1].split(' ');
        attributes = attributes.sort();
        while (attributes.length && (attributes[0] === '')) {
          attributes.splice(0, 1);
        }
        attributes = attributes.join(' ');
        parts[i] = text + '|' + attributes;
      }
    }
  }
  const normalized = parts.join(tag);
  return normalized;
}



/**
 * Generator for testing merging of alignment into verseObjects
 * @param {string} name - the name of the test files to use. e.g. `valid` will test `valid.usfm` to `valid.json`
 */
const exportTest = (name = {}) => {
  const json = readJSON(`${name}.json`);
  expect(json).toBeTruthy();
  const expectedUsfm = readUSFM(`${name}.usfm`);
  expect(expectedUsfm).toBeTruthy();
  const {alignment, verseString, wordBank} = json;
  const output = wordaligner.merge(alignment, wordBank, verseString);
  const outputData = {
    chapters: {},
    headers: [],
    verses: {
      1: output
    }
  };
  let usfm = usfmjs.toUSFM(outputData, {chunk: true, forcedNewLines: true});
  const split = usfm.split("\\v 1");
  usfm = split.length > 1 ? split[1] : "";
  if (usfm.substr(0, 1) === ' ') {
    usfm = usfm.substr(1);
  }
  const tag = "\\zaln-s | ";
  let outputNormal = normalizeAtributesAlign(tag, usfm);
  let expectedNormal = normalizeAtributesAlign(tag, expectedUsfm);
  const wordTag = '\\w';
  outputNormal = normalizeAtributesWord(wordTag, outputNormal);
  expectedNormal = normalizeAtributesWord(wordTag, expectedNormal);
  expect(outputNormal).toEqual(expectedNormal);
};

