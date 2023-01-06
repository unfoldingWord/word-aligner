/**
 *
 * @file   Contains the logic for aligning words.
 * @author unfoldingWord
 */

// helpers
import * as VerseObjectUtils from './utils/verseObjects';
import * as ArrayUtils from './utils/array';

/**
 * check if there were any alignments
 * @param {Array} alignments - alginments to be checked
 * @return {boolean} true if an alignment was found
 */
export const hasAlignments = (alignments) => {
  const indexFirstAlignment = alignments.findIndex((alignment) => {
    return alignment.bottomWords.length > 0;
  });
  return indexFirstAlignment >= 0;
};

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {Array} wordBank - array of topWords
 * @param {String} verseString - The string to base the bottomWords sorting
 * @param {Boolean} useVerseText - if true, then return parsed verse text if unaligned verse has changed, otherwise return null
 * @return {Array} - sorted array of verseObjects to be used for verseText of targetLanguage
 */
export const merge = (alignments, wordBank, verseString,
  useVerseText = false) => {
  // get the definitive list of verseObjects from the verse, unaligned but in order
  const {newVerseObjects: unalignedOrdered, wordMap} =
        VerseObjectUtils.getOrderedVerseObjectsFromString(verseString);
  // assign verseObjects with unaligned objects to be replaced with aligned ones
  // check each word in the verse string is also in the word bank or alignments
  const verseObjectsNotInAlignmentData = verseStringWordsContainedInAlignments(
    alignments, wordBank, wordMap);
  if (verseObjectsNotInAlignmentData.length > 0) {
    if (hasAlignments(alignments)) { // if verse has some alignments
      const verseWordsJoined = verseObjectsNotInAlignmentData.map(({text}) => text).join(', ');
      throw {
        message: `The words "${verseWordsJoined}" from the target language verse are not in the alignment data.`,
        type: 'InvalidatedAlignments',
      };
    } else { // if verse had no alignments
      return useVerseText ? unalignedOrdered : null; // use parsed verse text
    }
  }
  // each wordBank object should result in one verseObject
  const wbLen = wordBank.length;
  for (let i = 0; i < wbLen; i++) {
    const bottomWord = wordBank[i];
    const verseObject = VerseObjectUtils.wordVerseObjectFromBottomWord(
      bottomWord);
    const index = VerseObjectUtils.indexOfVerseObject(
      wordMap, verseObject);
    if (index > -1) {
      const location = wordMap[index];
      location.array[location.pos] = verseObject;
    } else if (hasAlignments(alignments)) { // if verse has some alignments
      throw {message: `Word "${bottomWord.word}" is in wordBank, but missing from target language verse.`, type: 'InvalidatedAlignments'};
    } else { // if verse had no alignments
      return useVerseText ? unalignedOrdered : null; // use parsed verse text
    }
  }
  let indicesToDelete = [];
  // each alignment should result in one verseObject
  for (let i = 0, aLen = alignments.length; i < aLen; i++) {
    const alignment = alignments[i];
    const {topWords, bottomWords} = alignment;
    // each bottomWord results in a nested verseObject of tag: w, type: word
    // located inside innermost nested topWord/k verseObject
    const replacements = {};
    for (let j = 0, bwLen = bottomWords.length; j < bwLen; j++) {
      const bottomWord = bottomWords[j];
      const verseObject = VerseObjectUtils.wordVerseObjectFromBottomWord(bottomWord);
      const index = VerseObjectUtils.indexOfVerseObject(wordMap, verseObject);
      if (index === -1) {
        throw {message: 'VerseObject not found in verseText while merging:' + JSON.stringify(verseObject), type: 'InvalidatedAlignments'};
      }
      replacements[index] = verseObject;
    }
    // each topWord results in a nested verseObject of tag: k, type: milestone
    const milestones = topWords.map((topWord) =>
      VerseObjectUtils.milestoneVerseObjectFromTopWord(topWord)
    );
    const indices = Object.keys(replacements);
    // group consecutive indexes so that they can be aggregated
    const groupedConsecutiveIndices =
      ArrayUtils.groupConsecutiveNumbers(indices, wordMap);
    // loop through groupedConsecutiveIndices to reduce and place where needed.
    for (let j = 0, gLen = groupedConsecutiveIndices.length; j < gLen; j++) {
      const consecutiveIndices = groupedConsecutiveIndices[j];
      // map the consecutiveIndices to replacement verseObjects
      const replacementVerseObjects = [];
      for (let k = 0, repLen = consecutiveIndices.length; k < repLen; k++) {
        const index = consecutiveIndices[k];
        const mapped = wordMap[index];
        if (mapped.array && (mapped.pos >= 0) && (mapped.includeBetween >= 0)) {
          replacementVerseObjects.push(mapped.array[mapped.includeBetween]);
        }
        replacementVerseObjects.push(replacements[index]);
      }
      // remove and use the first index in group to place the aligned verseObject milestone later
      const indexToReplace = consecutiveIndices.shift();
      // the rest of the consecutiveIndices need to be queued to be deleted later after shift
      indicesToDelete = indicesToDelete.concat(consecutiveIndices);
      // place the replacementVerseObjects in the last milestone as children
      milestones[milestones.length - 1].children = replacementVerseObjects;
      // nest the milestones so that the first is the parent and each subsequent is nested
      const milestone = VerseObjectUtils.nestMilestones(milestones);
      // replace the original verseObject from the verse text with the aligned milestone verseObject
      const location = wordMap[indexToReplace];
      location.array[location.pos] = milestone;
    }
  }
  // deleteIndices that were queued due to consecutive bottomWords in alignments
  const verseObjects = ArrayUtils.deleteIndices(unalignedOrdered, indicesToDelete, wordMap);
  return verseObjects;
};

/**
 * Determines if the given verse objects from a string are contained in
 * the given alignments
 *
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {Array} wordBank - array of unused topWords for aligning
 * @param {Array} wordMap - ordered map of word locations in verseObjects
 * @return {Array} - returns array of word verse objects from a string that are not contained in
 *                      the given alignments
 */
export function verseStringWordsContainedInAlignments(
  alignments, wordBank, wordMap) {
  const unalignedMap = wordMap.filter((wordItem) => {
    const verseObject = wordItem.array[wordItem.pos];
    const checkIfWordMatches = function(verseObject) {
      return function({word, occurrence, occurrences}) {
        const verseObjectWord = verseObject.text;
        const verseObjectOccurrence = verseObject.occurrence;
        const verseObjectOccurrences = verseObject.occurrences;
        return word === verseObjectWord &&
          occurrence === verseObjectOccurrence &&
          occurrences === verseObjectOccurrences;
      };
    };
    if (verseObject.type !== 'word') return false;
    const wordCheckerFunction = checkIfWordMatches(verseObject);
    const containedInWordBank = Boolean(wordBank.find(wordCheckerFunction));
    const containedInAlignments = Boolean(alignments.find(({bottomWords}) => {
      return Boolean(bottomWords.find(wordCheckerFunction));
    }));
    return !containedInWordBank && !containedInAlignments;
  });
  return unalignedMap.map((location) => (location.array[location.pos]));
}

/**
 * @description find the alignment to use for this milestone.  If milestone has already been given an alignment, then
 *                use that one.  Otherwise return null.  This is needed because milestones are not always
 *                contiguous.
 * @param {Array} baseMilestones - already found base milestones.
 * @param {Object} newMilestone - milestone not yet given an alignment
 * @return {Object} previous Alignment if found - else null.
 */
const getAlignmentForMilestone = (baseMilestones, newMilestone) => {
  const length = baseMilestones.length;
  for (let i = 0; i < length; i++) {
    const baseMilestone = baseMilestones[i];
    if (baseMilestone.alignment &&
      VerseObjectUtils.sameMilestone(baseMilestone.milestone, newMilestone)) {
      return baseMilestone.alignment;
    }
  }
  return null;
};

/**
 * compare occurrences of a and b, and handle conversion to int if necessary
 * @param {Object} a - first occurrences value
 * @param {Object} b - second occurrence value
 * @return {boolean} - if they are the same or not
 */
const compareOccurrences = function(a, b) {
  let sameOccurrence = (a.occurrence === b.occurrence);
  if (!sameOccurrence && a.occurrence && b.occurrence) {
    if (typeof a.occurrence !== typeof b.occurrence) { // one may be string and the other an int
      const occurrence1 = (typeof a.occurrence === 'string') ? parseInt(a.occurrence, 10) : a.occurrence;
      const occurrence2 = (typeof b.occurrence === 'string') ? parseInt(b.occurrence, 10) : b.occurrence;
      sameOccurrence = (occurrence1 === occurrence2) && (occurrence1 !== 0);
    }
  }
  return sameOccurrence;
};

/**
 * @description returns index of the verseObject in the alignments first milestone (ignores occurrences since that can be off)
 * @param {Array} alignments - array of the alignments to search in
 * @param {Object} verseObject - verseObject to search for
 * @return {Int} - the index of the verseObject
 */
export const indexOfFirstMilestone = (alignments, verseObject) => {
  let index = -1;
  if (verseObject.type === 'word') {
    index = alignments.findIndex((alignment) => {
      if (alignment.topWords.length > 0) {
        const _verseObject = alignment.topWords[0];
        if (_verseObject.word === verseObject.text) {
          return compareOccurrences(_verseObject, verseObject);
        }
      }
      return false;
    });
  }
  return index;
};

/**
 * @description returns index of the verseObject in the alignments milestone (ignores occurrences since that can be off)
 * @param {Array} alignments - array of the alignments to search in
 * @param {Object} verseObject - verseObject to search for
 * @return {Number} - the index of the verseObject
 */
export const indexOfMilestone = (alignments, verseObject) => {
  let index = -1;
  if (verseObject.type === 'word') {
    index = alignments.findIndex((alignment) => {
      const length = alignment.topWords.length;
      for (let i = 0; i < length; i++) {
        const _verseObject = alignment.topWords[i];
        if (_verseObject.word === verseObject.text) {
          if (compareOccurrences(_verseObject, verseObject)) {
            return true;
          }
        }
      }
      return false;
    });
  }
  return index;
};

/**
 * @description uses the alignedVerseString to order alignments
 * @param {String|Array} alignmentVerse - optional alignment verse
 * @param {Array} alignmentUnOrdered - alignments to order
 * @return {Array} ordered alignments if alignment string given, else unordered alignments
 */
export const orderAlignments = function(alignmentVerse, alignmentUnOrdered) {
  let orderedObjects = null;
  if (typeof alignmentVerse === 'string') {
    orderedObjects = VerseObjectUtils.getOrderedVerseObjectsFromString(
      alignmentVerse);
  } else {
    orderedObjects = VerseObjectUtils.getOrderedVerseObjects(alignmentVerse);
  }
  const wordMap = orderedObjects.wordMap;
  if (Array.isArray(wordMap)) {
    const alignment = [];
    // order alignments
    const wmLen = wordMap.length;
    for (let i = 0; i < wmLen; i++) {
      const location = wordMap[i];
      const nextWord = location.array[location.pos];
      let index = indexOfFirstMilestone(alignmentUnOrdered, nextWord);
      if ((index < 0) && (nextWord.type === 'word') && (i < wmLen - 1)) {
        const verseObjectAfter = location.array[location.pos + 1];
        if (verseObjectAfter.type === 'text') { // maybe this was punctuation split from word
          const originalText = nextWord.text;
          nextWord.text += verseObjectAfter.text.substr(0, 1); // add possible punctuation
          index = indexOfFirstMilestone(alignmentUnOrdered, nextWord); // try again
          if (index < 0) {
            nextWord.text = originalText; // restore original text if not a match
          } else {
            verseObjectAfter.text = verseObjectAfter.text.substr(1, 0); // remove punctuation
          }
        }
      }
      if (index >= 0) {
        alignment.push(alignmentUnOrdered[index]);
        alignmentUnOrdered.splice(index, 1); // remove item
      } else if (nextWord.type === 'word') {
        // if not found, may be either an unaligned topWord or merged topWord
        index = indexOfMilestone(alignmentUnOrdered, nextWord);
        if (index < 0) { // if not found in unordered list, try already ordered
          index = indexOfMilestone(alignment, nextWord);
        }
        if (index < 0) { // if still not found in topWords, it's an unaligned topWord
          const wordObject = VerseObjectUtils.alignmentObjectFromVerseObject(
            nextWord);
          alignment.push({topWords: [wordObject], bottomWords: []});
        }
      }
    }
    if (alignmentUnOrdered.length > 0) {
      alignment.push(...alignmentUnOrdered); // fast concat
    }
    return alignment;
  }
  return alignmentUnOrdered;
};

/**
 * @description adds verse object to alignment
 * @param {Object} verseObject - The verse obejct to add to alignmer
 * @param {Object} alignment - pre-existing alignments
 */
export const addVerseObjectToAlignment = (verseObject, alignment) => {
  if (verseObject.type === 'milestone' && verseObject.children.length > 0) {
    const wordObject = VerseObjectUtils.alignmentObjectFromVerseObject(
      verseObject);
    const duplicate = alignment.topWords.find(function(obj) {
      return (obj.word === wordObject.word) &&
        (obj.occurrence === wordObject.occurrence);
    });
    if (!duplicate) {
      alignment.topWords.push(wordObject);
    }
    verseObject.children.forEach((_verseObject) => {
      addVerseObjectToAlignment(_verseObject, alignment);
    });
  } else if (verseObject.type === 'word' && !verseObject.children) {
    const wordObject = VerseObjectUtils.alignmentObjectFromVerseObject(
      verseObject);
    alignment.bottomWords.push(wordObject);
  }
};

/**
 * extracts alignment from verse object and adds to baseMilestones and alignments
 * @param {Array} baseMilestones - array of milestones found
 * @param {Object} verseObject - to add to arrays
 * @param {Array} alignments - array of alignments found
 */
const addAlignment = (baseMilestones, verseObject, alignments) => {
  let alignment = getAlignmentForMilestone(baseMilestones, verseObject);
  if (!alignment) {
    alignment = {topWords: [], bottomWords: []};
    alignments.push(alignment);
    baseMilestones.push({alignment: alignment, milestone: verseObject});
  }
  addVerseObjectToAlignment(verseObject, alignment);
  if (verseObject.children && verseObject.type !== 'milestone') {
    const length = verseObject.children.length;
    for (let i = 0; i < length; i++) {
      addAlignment(baseMilestones, verseObject.children[i], alignments);
    }
  }
};

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} verseObjects - array of aligned verseObjects [{milestone children={verseObject}}, ...]
 * @param {Array|Object|String} alignedVerse - optional verse to use for ordering alignments
 * @return {Object} - object of alignments (array of alignments) and wordbank (array of unused words)
 */
export const unmerge = (verseObjects, alignedVerse) => {
  const baseMilestones = [];
  let wordBank = [];
  const alignments = [];
  if (verseObjects && verseObjects.verseObjects) {
    verseObjects = verseObjects.verseObjects;
  }
  if (typeof alignedVerse !== 'string') {
    alignedVerse = VerseObjectUtils.getWordList(alignedVerse);
  }
  let len = verseObjects.length;
  for (let i = 0; i < len; i++) {
    const verseObject = verseObjects[i];
    addAlignment(baseMilestones, verseObject, alignments);
  }
  const alignmentUnOrdered = [];
  len = alignments.length;
  for (let i = 0; i < len; i++) {
    const _alignment = alignments[i];
    if (_alignment.topWords.length > 0) {
      alignmentUnOrdered.push(_alignment);
    } else {
      wordBank = wordBank.concat(_alignment.bottomWords);
    }
  }
  const alignment = orderAlignments(alignedVerse, alignmentUnOrdered);
  return {alignment, wordBank};
};

/**
 * Helper method to find if the given alignments object actually
 * has aligned data. If not we do not want to show the reset dialog
 *
 * @param {array} alignments - alignments object with array of top words/bottom words
 * @return {boolean} - Whether or not the verse has alignments
 */
export const verseHasAlignments = ({alignments}) => {
  if (alignments) {
    return alignments.filter(({bottomWords}) => {
      return bottomWords.length > 0;
    }).length > 0;
  }
};

/**
 * @description - generates the word alignment tool alignmentData from the UGNT verseData
 * @param {String|Array|Object} verseData - array of verseObjects
 * @return {Array} alignmentObjects from verse text
 */
export const generateBlankAlignments = (verseData) => {
  const wordList = VerseObjectUtils.getWordList(verseData);
  const alignments = wordList.map((wordData, index) => {
    const word = wordData.word || wordData.text;
    const occurrences = VerseObjectUtils.getOccurrences(wordList, word);
    const occurrence = VerseObjectUtils.getOccurrence(wordList, index, word);
    const alignment = {
      topWords: [
        {
          word: word,
          strong: (wordData.strong || wordData.strongs),
          lemma: wordData.lemma,
          morph: wordData.morph,
          occurrence,
          occurrences,
        },
      ],
      bottomWords: [],
    };
    return alignment;
  });
  return alignments;
};

/**
 * @description - generates the word alignment tool word bank from targetLanguage verse
 * @param {String|Array|Object} verseData - string of the verseText in the targetLanguage
 * @return {Array} alignmentObjects from verse text
 */
export const generateWordBank = (verseData) => {
  const verseWords = VerseObjectUtils.getWordList(verseData);
  const wordBank = verseWords.map((object, index) => {
    const word = object.text;
    const occurrences = VerseObjectUtils.getOccurrences(verseWords, word);
    const occurrence = VerseObjectUtils.getOccurrence(verseWords, index, word);
    return {
      word,
      occurrence,
      occurrences,
    };
  });
  return wordBank;
};

/**
 * Wrapper method for resetting alignments in verse to being blank alignments
 * i.e. (all words in word bank and not joined with alignments data)
 * Note: This method does not overwrite any data
 * @param {string} ugntVerse - Array of verse objects containing ugnt words
 * @param {string} targetLanguageVerse - Current target language string from the bibles reducer
 * @return {{alignments, wordBank}} - Reset alignments data
 */
export const getBlankAlignmentDataForVerse = (
  ugntVerse, targetLanguageVerse) => {
  const alignments = generateBlankAlignments(ugntVerse);
  const wordBank = generateWordBank(targetLanguageVerse);
  return {alignments, wordBank};
};
