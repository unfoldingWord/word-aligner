const path = require('path');
const fs = require('fs-extra');
const {AlignmentHelpers, UsfmFileConversionHelpers, usfmHelpers} = require('word-aligner-rcl');

const RESOURCES = path.join('__tests__', 'fixtures', 'pivotAlignmentVerseObjects');
// const folder = fs.readdirSync(RESOURCES);
// console.log(folder);

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
 * Writes a JSON object to a file in the resources dir
 * @param {string} filename relative path to json file
 * @param {Object} json - The JSON object to write
 */
const writeJSON = (filename, json) => {
  const fullPath = path.join(RESOURCES, filename);
  fs.writeJsonSync(fullPath, json, {spaces: 2});
};

/**
 * Converts an aligned verse string to verse objects
 * @param {string} alignedVerseString - The USFM aligned verse string to convert
 * @return {Array} - Array of verse objects
 */
function getVerseObjects(alignedVerseString) {
  const verseObjects = usfmHelpers.usfmVerseToJson(alignedVerseString);
  return verseObjects;
}

/**
 * Builds test data by reading a template JSON file and populating missing fields
 * Generates verseObjects from alignedVerseString if not present
 * Generates alignment and wordBank from alignedVerseString if alignment is empty
 */
function buildTestData() {
  const testData = readJSON('template.json');
  console.log(testData.comment);

  if (testData.alignedVerseString) {
    console.log(`found alignedVerseString: ${testData.alignedVerseString.length} chars`);

    if (!testData.verseObjects.length) {
      console.log('Generating verseObjects from alignedVerseString');
      const verseObjects = getVerseObjects(testData.alignedVerseString);
      if (verseObjects) {
        testData.verseObjects = verseObjects;
      }
    }

    if (!testData.alignment.length) {
      console.log('Generating alignment and wordBank from alignedVerseString');
      AlignmentHelpers.extractAlignmentsFromTargetVerse(testData.alignedVerseString);
      const {
        targetWords: wordBank,
        verseAlignments: alignments,
      } = AlignmentHelpers.parseUsfmToWordAlignerData(testData.alignedVerseString, null);
      const cleanedAlignments = AlignmentHelpers.getCleanedAlignments(wordBank, alignments);
      testData.alignment = cleanedAlignments.alignments;
      testData.wordBank = cleanedAlignments.wordBank;
    }

    if (!testData.verseString) {
      console.log('Generating verseString from verseObjects');
      const verseString = UsfmFileConversionHelpers.getUsfmForVerseContent(testData.verseObjects);
      console.log(`verseString: ${verseString}`);
      testData.verseString = verseString;
    }

  }

  delete testData.comment;
  console.log('New test data:', testData);
  writeJSON('new-test-data.json', testData);
}
buildTestData();
