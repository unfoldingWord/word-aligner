/* eslint-disable no-negated-condition */
import _ from 'lodash';
import usfm from 'usfm-js';
import * as tokenizer from 'string-punctuation-tokenizer';
import * as ArrayUtils from './array';

/**
 * An object containing information about the word in a target language
 *
 * @typedef WordObject
 * @type {Object}
 * @property {number} occurrences - Total amount of ccurrences for
 *  the word in the verse.
 * @property {number} occurrence - Specific occurrence of the word
 * in the verse.
 * @property {string} text - The text that used for rendering on the screen.
 * @property {string} tag - Denotes the type of usfm tag the word originates
 * from.
 * @property {[WordObject]} [children] - Containing WordObject's
 * for pivoting WordObject's off of another
 * @property {('text'|'word'|'paragraph')} type - Denotes the category of content
 * the word holds
 * @property {string} [word] - The text that used for rendering on the screen.
 */

/**
 * An object containing information about the word
 * in the original language
 * @typedef {[WordObject]} VerseObject
 */

/**
 * get text from word type verse object or word object
 * @param {WordObject} wordObject - an object containing information about the word
 * @return {string|undefined} text from word object
 */
export const getWordText = (wordObject) => {
  if (wordObject && (wordObject.type === 'word')) {
    return wordObject.text;
  }
  return wordObject ? wordObject.word : undefined;
};

/**
 * Gets the occurrence of a subString in words by counting up to subString index
 * @param {String|Array} words - word list or string to search
 * @param {Number} currentWordIndex - index of desired word in words
 * @param {String} subString - The sub string to search for
 * @return {Integer} - the occurrence of the word at currentWordIndex
 */
export const getOccurrence = (words, currentWordIndex, subString) => {
  if (typeof words === 'string') {
    return tokenizer.occurrenceInString(words, currentWordIndex, subString);
  }

  let occurrence = 0;
  if (Array.isArray(words)) {
    for (let i = 0; i <= currentWordIndex; i++) {
      if (getWordText(words[i]) === subString) occurrence++;
    }
  }
  return occurrence;
};

/**
 * Function that count occurrences of a substring in words
 * @param {String|Array} words - word list or string to search
 * @param {String} subString - The sub string to search for
 * @return {Integer} - the count of the occurrences
 */
export const getOccurrences = (words, subString) => {
  if (typeof words === 'string') {
    return tokenizer.occurrencesInString(words, subString);
  }

  let occurrences = 0;
  if (Array.isArray(words)) {
    for (const word of words) {
      if (getWordText(word) === subString) occurrences++;
    }
  }
  return occurrences;
};

/**
 * @description verseObjects with occurrences from verseObjects
 * @param {Array} verseObjects - Word list to add occurrence(s) to
 * @return {{newVerseObjects: Array, wordMap: Array}} - clone of verseObjects and word map
 */
export const getOrderedVerseObjects = (verseObjects) => {
  const wordMap = [];
  const _verseObjects = _.cloneDeep(verseObjects);
  const length = _verseObjects.length;
  for (let i = 0; i < length; i++) {
    const verseObject = _verseObjects[i];
    if (verseObject.type === 'word') {
      verseObject.occurrence = getOccurrence(
        _verseObjects,
        i,
        verseObject.text);
      verseObject.occurrences = getOccurrences(_verseObjects, verseObject.text);
      wordMap.push({array: _verseObjects, pos: i});
    }
  }
  return {newVerseObjects: _verseObjects, wordMap};
};

/**
 * get texts from nested verse objects
 * @param {Array} verseObjects - nested verse objects to extract text from
 * @return {Array} array of texts found
 */
const getVerseObjectsText = (verseObjects) => {
  const texts = [];
  if (verseObjects) {
    const length = verseObjects.length;
    for (let i = 0; i < length; i++) {
      const vo = verseObjects[i];
      if (vo.text) {
        texts.push(vo.text);
      }
      if (vo.children) {
        const childTexts = getVerseObjectsText(vo.children);
        texts.push(...childTexts); // concat arrays
      }
    }
  }
  return texts;
};

/**
 * Fills gaps (whitespace and text) between tokens in the verse object array.
 * Ensures whitespace between tokens is preserved by creating text verse objects.
 * If possible, appends to the previous text object if it exists at the same nesting level;
 * otherwise creates a new text verse object.
 *
 * @param {string} text - The complete string being tokenized
 * @param {Number} lastPos - Position of the end of the last processed token
 * @param {Number} pos - Position to process up to (start of next token or end of string)
 * @param {Array} newVerseObjects - Array of verse objects being populated
 * @param {Boolean} [end=false] - If true, forces creation of text object even if gap is empty (for end of line)
 * @param {Number} [parentIndex=-1] - Index of parent verse object if nested, -1 if at root level
 * @return {Number} Updated position after processing the gap (lastPos + gap.length)
 */
const fillGap = (text, lastPos, pos, newVerseObjects, end = false, parentIndex = -1) => {
  let verseObject = null;
  const gap = text.substring(lastPos, pos);
  const lastVerseObject = newVerseObjects.length && newVerseObjects[newVerseObjects.length - 1];
  const lastParentIndex = (typeof lastVerseObject.parentIndex === 'number') ? lastVerseObject.parentIndex : -1;
  const canAppendToPreviousText = lastVerseObject && (lastVerseObject.type === 'text')
    && (lastParentIndex === parentIndex);
  if (canAppendToPreviousText) { // append to previous text
    lastVerseObject.text += gap;
  } else if (end || gap) { // save gap
    verseObject = {
      type: 'text',
      text: gap,
    };

    if (parentIndex >= 0) {
      verseObject.parentIndex = parentIndex;
    }

    newVerseObjects.push(verseObject);
  }
  lastPos += gap.length;
  return lastPos;
};

/**
 * Parses text into tokens and creates word or text verse objects.
 * Tokenizes the input text and identifies words (containing word/number characters)
 * versus punctuation/text. For words, creates word objects with occurrence tracking.
 * For non-word tokens, creates text objects. Preserves whitespace between tokens.
 *
 * @param {string} text - The string to tokenize
 * @param {Array} newVerseObjects - Array to populate with newly created verse objects
 * @param {Array} wordMap - Ordered map tracking word locations in verseObjects for occurrence counting
 * @param {Number} nonWordVerseObjectCount - Counter for entries that are not words (text/punctuation)
 * @param {String} verseText - Complete text of the entire verse for occurrence calculation
 * @param {Number} [parentIndex=-1] - Index of parent verse object if this text is nested, -1 if at root level
 * @return {Number} Updated nonWordVerseObjectCount after processing
 */
const tokenizeText = (text, newVerseObjects, wordMap, nonWordVerseObjectCount, verseText, parentIndex = -1) => {
  if (text) {
    const tokens = tokenizer.tokenize({text, includePunctuation: true});
    const tokenLength = tokens.length;
    let verseObject;
    let lastPos = 0;
    for (let j = 0; j < tokenLength; j++) {
      const word = tokens[j];
      const pos = text.indexOf(word, lastPos);
      if (pos > lastPos) { // make sure we are not dropping white space
        lastPos = fillGap(text, lastPos, pos, newVerseObjects, false, parentIndex);
      }
      if (tokenizer.word.test(word) || tokenizer.number.test(word)) { // if the text has word or number characters, its a word object
        const wordIndex = wordMap.length;
        let occurrence = tokenizer.occurrenceInString(
          verseText,
          wordIndex,
          word);
        const occurrences = tokenizer.occurrencesInString(
          verseText,
          word);
        if (occurrence > occurrences) occurrence = occurrences;
        verseObject = {
          tag: 'w',
          type: 'word',
          text: word,
          occurrence,
          occurrences,
        };
        const pos = newVerseObjects.length;
        wordMap.push({array: newVerseObjects, pos, parentIndex});
      } else { // the text does not have word characters
        nonWordVerseObjectCount++;
        verseObject = {
          type: 'text',
          text: word,
        };
      }
      lastPos += word.length;

      if (parentIndex >= 0) {
        verseObject.parentIndex = parentIndex;
      }

      newVerseObjects.push(verseObject);
    }
    if (lastPos < text.length) {
      lastPos = fillGap(text, lastPos, text.length, newVerseObjects, true, parentIndex);
    }
  }
  return nonWordVerseObjectCount;
};

/**
 * Recursively processes nested verse objects to extract and tokenize words.
 * Traverses through verse objects, preserving non-text objects (like milestones) while
 * extracting and tokenizing any text content. Handles nested children recursively.
 * Maintains parent-child relationships through parentIndex tracking.
 *
 * @param {Array} verseObjects - Original array of verse objects to process (may contain nested structures)
 * @param {Array} newVerseObjects - Output array to populate with processed verse objects with words split
 * @param {Array} wordMap - Ordered map tracking word locations in verseObjects for occurrence counting
 * @param {String} verseText - Complete text of the entire verse for occurrence calculation
 * @param {Number} nonWordVerseObjectCount - Counter for entries that are not words (text/punctuation)
 * @param {Number} [parentIndex=-1] - Index of parent verse object for nested elements, -1 if at root level
 * @return {Number} Updated nonWordVerseObjectCount after processing all verse objects
 */
const getWordsFromNestedVerseObjects = (
  verseObjects,
  newVerseObjects,
  wordMap,
  verseText,
  nonWordVerseObjectCount,
  parentIndex = -1
) => {
  const voLength = verseObjects.length;
  for (let i = 0; i < voLength; i++) {
    const verseObject = verseObjects[i];

    if (parentIndex >= 0) { // keep track of where the parent is
      verseObject.parentIndex = parentIndex;
    }

    let vsObjText = verseObject.text;
    if ((verseObject.type !== 'text')) {
      // preseserve non-text verseObject except for text part which will be split into words
      delete verseObject.text;
      if (vsObjText) {
        if (verseObject.nextChar) {
          vsObjText += verseObject.nextChar; // preserve next char
        }
        verseObject.nextChar = ' '; // preserve space before text
      }
      newVerseObjects.push(verseObject);
      const indexOfThisObject = newVerseObjects.length - 1;
      if (verseObject.children) {
        const newChildVerseObjects = [];
        nonWordVerseObjectCount = tokenizeText(vsObjText, newChildVerseObjects, wordMap, nonWordVerseObjectCount, verseText, indexOfThisObject);
        nonWordVerseObjectCount = getWordsFromNestedVerseObjects(verseObject.children, newChildVerseObjects,
          wordMap, verseText, nonWordVerseObjectCount,
          indexOfThisObject);
        verseObject.children = newChildVerseObjects;
      } else {
        nonWordVerseObjectCount = tokenizeText(vsObjText, newVerseObjects, wordMap, nonWordVerseObjectCount, verseText, indexOfThisObject);
      }
    } else {
      nonWordVerseObjectCount = tokenizeText(vsObjText, newVerseObjects, wordMap, nonWordVerseObjectCount, verseText, parentIndex);
    }
  }
  return nonWordVerseObjectCount;
};

/**
 * @description verseObjects with occurrences via string
 * @param {String} string - The string to search in
 * @return {{newVerseObjects: Array, wordMap: Array}} - clone of verseObjects and word map
 */
export const getOrderedVerseObjectsFromString = (string) => {
  const newVerseObjects = [];
  const wordMap = [];
  if (string) {
    // convert string using usfm to JSON
    const _verseObjects = usfm.toJSON('\\v 1 ' + string, {chunk: true}).verses['1'].verseObjects;
    const _verseObjectsWithTextString = getVerseObjectsText(_verseObjects).join(' ');

    getWordsFromNestedVerseObjects(_verseObjects, newVerseObjects, wordMap, _verseObjectsWithTextString, 0);
  }
  return {newVerseObjects, wordMap};
};

/**
 * @description Nests the milestons so that the first is the root and each after is nested
 * @param {Array} milestones - an array of milestone objects
 * @return {Object} - the nested milestone
 */
export const nestMilestones = (milestones) => {
  const _milestones = JSON.parse(JSON.stringify(milestones));
  let milestone;
  _milestones.reverse();
  _milestones.forEach((_milestone) => {
    if (milestone) { // if the milestone was already there
      _milestone.children = [milestone]; // nest the existing milestone as children
      milestone = _milestone; // replace the milestone with this one
    } else { // if this is the first milestone, populate it
      milestone = _milestone;
    }
    // next loop will use the resulting milestone to nest until no more milestones
  });
  return milestone;
};

/**
 * @description Converts a bottomWord to a verseObject of tag: w, type: word
 * @param {WordObject} bottomWord - a wordObject to convert
 * @param {string} textKey - key of the text in the bottom word object
 * @return {Object} - a verseObject of tag: w, type: word
 */
export const wordVerseObjectFromBottomWord = (bottomWord, textKey = 'word') => (
  {
    tag: 'w',
    type: 'word',
    text: bottomWord[textKey],
    occurrence: bottomWord.occurrence,
    occurrences: bottomWord.occurrences,
  }
);

/**
 * @description Converts a topWord to a verseObject of tag: w, type: word
 * @param {WordObject} topWord - a wordObject to convert
 * @return {Object} - a verseObject of tag: w, type: word
 */
export const milestoneVerseObjectFromTopWord = (topWord) => {
  const verseObject = JSON.parse(JSON.stringify(topWord));
  verseObject.tag = 'zaln';
  verseObject.type = 'milestone';
  verseObject.content = topWord.word;
  delete verseObject.word;
  delete verseObject.endTag;
  delete verseObject.tw;
  return verseObject;
};

/**
 * @description Converts a verseObject of tag: w, type: word into an alignmentObject
 * @param {WordObject} verseObject - a wordObject to convert
 * @return {Object} - an alignmentObject
 */
export const alignmentObjectFromVerseObject = (verseObject) => {
  const wordObject = JSON.parse(JSON.stringify(verseObject));
  wordObject.word = wordObject.text || wordObject.content;
  delete wordObject.content;
  delete wordObject.text;
  delete wordObject.tag;
  delete wordObject.type;
  delete wordObject.children;
  delete wordObject.endTag;
  return wordObject;
};

/**
 * @description Returns index of the verseObject in the verseObjects (ignores occurrences since that can be off)
 * @param {Array} wordMap - ordered map of word locations in verseObjects
 * @param {Object} verseObject - verseObject to search for
 * @return {Int} - the index of the verseObject
 */
export const indexOfVerseObject = (wordMap, verseObject) => (
  wordMap.findIndex((wordItem) => {
    const _verseObject = wordItem.array[wordItem.pos];
    return (_verseObject.text === verseObject.text) &&
    (_verseObject.occurrence === verseObject.occurrence) &&
    (_verseObject.type === verseObject.type) &&
    (_verseObject.tag === verseObject.tag);
  })
);

/**
 * extracts word objects from verse object. If verseObject is word type, return that in array, else if it is a
 * milestone, then add words found in children to word array.  If no words found return empty array.
 * @param {object} verseObject - verse objects to have words extracted from
 * @return {Array} words found
 */
export const extractWordsFromVerseObject = (verseObject) => {
  const words = [];
  if (typeof verseObject === 'object') {
    if (verseObject.word || verseObject.type === 'word') {
      words.push(verseObject);
    } else if (verseObject.children) {
      for (const child of verseObject.children) {
        const childWords = extractWordsFromVerseObject(child);
        words.push(...childWords); // fast concat arrays
      }
    }
  }
  return words;
};

/**
 * @description merge verse data into a string
 * @param {Object|Array} verseData - verse objects to be merged
 * @param {array} filter - Optional filter to get a specific type of word object type.
 * @return {String} - the merged verse object string
 */
export const mergeVerseData = (verseData, filter) => {
  if (verseData.verseObjects) {
    verseData = verseData.verseObjects;
  }
  const verseArray = [];
  verseData.forEach((part) => {
    if (typeof part === 'string') {
      verseArray.push(part);
    }
    let words = [part];
    if (part.type === 'milestone') {
      words = extractWordsFromVerseObject(part);
    }
    words.forEach((word) => {
      if (!filter || (word.text && word.type && filter.includes(word.type))) {
        verseArray.push(word.text);
      }
    });
  });
  let verseText = '';
  for (const verse of verseArray) {
    if (verse) {
      if (verseText && (verseText[verseText.length - 1] !== '\n')) {
        verseText += ' ';
      }
      verseText += verse;
    }
  }
  return verseText;
};

/**
 * extract list of word objects from array of verseObjects (will also search children of milestones).
 * @param {Array} verseObjects - verse objects to search for word list from
 * @return {Array} - words found
 */
export const getWordListFromVerseObjectArray = (verseObjects) => {
  const wordList = [];
  const length = verseObjects.length;
  for (let i = 0; i < length; i++) {
    const verseObject = verseObjects[i];
    const words = extractWordsFromVerseObject(verseObject);
    wordList.push(...words); // fast concat arrays
  }
  return wordList;
};

/**
 * maps original language content to each child and flattens them into array, recursive processing
 * @param {Array} childrens - list to process
 * @param {Array} ancestors - ordered list of all original language ancestors
 * @return {[]} returns flat array of all children
 */
const addContentAttributeToChildren = (childrens, ancestors) => {
  const childrensWithAttribute = [];

  for (let i = 0, lc = childrens.length; i < lc; i++) {
    let child = childrens[i];
    if (child.children) {
      child = addContentAttributeToChildren(child.children, [child, ...ancestors]);
    } else if (ancestors[0].content) {
      if (!child.content) {
        child.content = [];
      }
      for (let j = 0, la = ancestors.length; j < la; j++) {
        const ancestor = ancestors[j];
        if (ancestor.content) {
          child.content.push(ancestor);
        }
      }
    }
    childrensWithAttribute.push(child);
  }

  return childrensWithAttribute;
};

/**
 * @description flatten verse objects from nested format to flat array
 * @param {array} verse - source array of nested verseObjects
 * @param {array} words - output array that will be filled with flattened verseObjects
 */
const flattenVerseObjects = (verse, words) => {
  for (let i = 0, l = verse.length; i < l; i++) {
    const object = verse[i];
    if (object) {
      if (object.type === 'word') {
        object.strong = object.strong || object.strongs;
        words.push(object);
      } else if (object.type === 'milestone') { // get children of milestone
        // add content attibute to children
        const newObject = addContentAttributeToChildren(object.children, [object]);
        flattenVerseObjects(newObject, words);
      } else {
        words.push(object);
      }
    }
  }
};

/**
 * @description returns a flat array of VerseObjects (currently needed for rendering UGNT since words may be nested in milestones)
 * @param {Object|Array} verse - verseObjects that need to be flattened.
 * @return {array} wordlist - flat array of VerseObjects
 */
export const getWordListForVerse = (verse) => {
  let words = [];
  if (verse.verseObjects) {
    flattenVerseObjects(verse.verseObjects, words);
  } else { // already a flat word list
    words = verse;
  }
  return words;
};

/** Method to filter usfm markers from a string or verseObjects array
  * @param {String|Array|Object} verseObjects - The string to remove markers from
  * @return {Array} - Array without usfm markers
  */
export const getWordList = (verseObjects) => {
  let wordList = [];
  if (typeof verseObjects === 'string') {
    const {newVerseObjects} = getOrderedVerseObjectsFromString(verseObjects);
    verseObjects = newVerseObjects;
  }
  if (verseObjects && verseObjects.verseObjects) {
    verseObjects = verseObjects.verseObjects;
  }

  if (verseObjects) {
    wordList = getWordListFromVerseObjectArray(verseObjects);
  }
  return wordList;
};

/**
 * @description test to see if this is the same milestone (needed when milestones are not contiguous)
 * @param {Object} a - First milestone to test
 * @param {Object} b - Second milestone to test
 * @return {boolean} true if same milestone
 */
export const sameMilestone = (a, b) => {
  const same = (a.type === b.type) &&
    (a.content === b.content) &&
    (a.occurrence === b.occurrence);
  return same;
};

/**
 * @description adds verse object to alignment
 * @param {Object} verseObject - Verse object to be added
 * @param {Object} alignment - The alignment object that will be added to
 */
export const addVerseObjectToAlignment = (verseObject, alignment) => {
  if (verseObject.type === 'milestone' && verseObject.children.length > 0) {
    /** @type{WordObject} */
    const wordObject = alignmentObjectFromVerseObject(
      verseObject
    );
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
    /** @type{WordObject} */
    const wordObject = alignmentObjectFromVerseObject(
      verseObject
    );
    alignment.bottomWords.push(wordObject);
  }
};

/**
 * Concatenates an array of words into a verse.
 * @param {array} verseArray - array of strings in a verse.
 * @return {string} combined verse
 */
export const combineVerseArray = (verseArray) => {
  return verseArray.map((o) => getWordText(o)).join(' ');
};

/**
 * create an array of word objects with occurrence(s)
 * @param {[WordObject]} words - List of words without occurrences
 * @return {[WordObject]} - array of wordObjects
 */
export const populateOccurrencesInWordObjects = (words) => {
  words = getWordList(words);
  let index = 0; // only count verseObject words
  return words.map((wordObject) => {
    const wordText = getWordText(wordObject);
    if (wordText) { // if verseObject is word
      wordObject.occurrence = getOccurrence(words, index++, wordText);
      wordObject.occurrences = getOccurrences(words, wordText);
      return wordObject;
    }
    return null;
  }).filter((wordObject) => (wordObject !== null));
};

/**
 * @description wordObjectArray via string
 * @param {String} string - The string to search in
 * @return {[WordObject]} - array of wordObjects
 */
export const wordObjectArrayFromString = (string) => {
  const wordObjectArray = tokenizer.tokenize({text: string}).map((word, index) => {
    const occurrence = tokenizer.occurrenceInString(string, index, word);
    const occurrences = tokenizer.occurrencesInString(string, word);
    return {
      word,
      occurrence: occurrence,
      occurrences: occurrences,
    };
  });
  return wordObjectArray;
};

/**
 * @description sorts wordObjectArray via string
 * @param {[WordObject]} wordObjectArray - array of wordObjects
 * @param {string|[VerseObject]|VerseObject} stringData - The string to search in
 * @return {[WordObject]} - sorted array of wordObjects
 */
export const sortWordObjectsByString = (wordObjectArray, stringData) => {
  if (stringData.verseObjects) {
    stringData = populateOccurrencesInWordObjects(
      stringData.verseObjects);
  } else if (Array.isArray(stringData)) {
    stringData = populateOccurrencesInWordObjects(stringData);
  } else {
    stringData = wordObjectArrayFromString(stringData);
  }
  let _wordObjectArray = wordObjectArray.map((wordObject) => {
    const {word, occurrence, occurrences} = wordObject;
    const _wordObject = {
      word,
      occurrence,
      occurrences,
    };
    const indexInString = stringData.findIndex((object) => {
      const equal = (
        getWordText(object) ===
        getWordText(_wordObject) &&
        object.occurrence === _wordObject.occurrence &&
        object.occurrences === _wordObject.occurrences
      );
      return equal;
    });
    wordObject.index = indexInString;
    return wordObject;
  });
  _wordObjectArray = _wordObjectArray.sort((a, b) => {
    return a.index - b.index;
  });
  _wordObjectArray = _wordObjectArray.map((wordObject) => {
    delete wordObject.index;
    return wordObject;
  });
  return _wordObjectArray;
};

/**
 * Helper method to grab only verse objects or childen of verse objects but
 * not grab verse objects containing children.
 * i.e. given {a:1, b:{2, children:{2a, 2b}} returns 1, 2a, 2b (skips 2)
 *
 * @param {[VerseObject]} verseObjects - Objects containing data for the words such as
 * occurences, occurence, tag, text and type
 * @return {[WordObject]} - same format as input, except objects containing childern
 * get flatten to top level
 */
export const getWordsFromVerseObjects = (verseObjects) => {
  const wordObjects = verseObjects.map((versebject) => {
    if (versebject.children) {
      return getWordsFromVerseObjects(versebject.children);
    }
    return versebject;
  });
  return ArrayUtils.flattenArray(wordObjects);
};
