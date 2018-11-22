/* eslint-disable no-use-before-define */
import {morphCodeLocalizationMapGrk, morphCodeLocalizationMapAr, morphCodeLocalizationMapHeb} from './morphCodeLocalizationMap';

/**
 * @description - Get the human readable full morphological data from a morph string that is specific for language
 * @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
 * @param {function} translate - translation function
 * @return {String} - the full mophological data string that is human readable
 */
* @description - Get a list of all the localization keys for a morph string in Greek
* @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
* @return {Array} - List of localization keys (unknown codes are prefixed with `*`)
  */
export const getMorphLocalizationKeys = morph => {
  const parts = ((typeof morph === 'string') && morph.split(','));
  const language = parts && parts[0].toLowerCase();
  switch (language) {
    case 'he':
    case 'ar':
      morph = parts.slice(1).join(',');
      return getMorphLocalizationKeysHebrewAramaic(morph, language, translate);

    case 'gr':
    default:
      return getMorphLocalizationKeysGreek(morph, translate);
  }
};

/**
 * @description - Get the human readable full morphological data from a morph string in Hebrew or Aramaic
 * @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
 * @param {String} language - translation function
 * @return {String} - the full mophological data string that is human readable
 */
export const getFullMorphologicalStringHebrewAramaic = (morph, language) => {
  const lookup = (language === 'ar') ? morphCodeLocalizationMapAr : morphCodeLocalizationMapHeb;
  const words = morph.split(':');
  const morfForms = [];
  for (let i = 0, len = words.length; i < len; i++) {
    if (morfForms.length) {
      morfForms.push(':');
    }
    const word = words[i];
    let type = lookup[word[0]];
    if (type && type.key && type.params) {
      morfForms.push(type.key);
      let params = type.params;
      const wLen = Math.min(word.length, type.params.length + 1);
      for (let k = 1; k < wLen; k++) {
        const char = word[k];
        const param = params[k - 1];
        const values = lookup[param] || [];
        const descript = values[char] || char;
        morfForms.push(descript);
      }
      if (word.length - 1 > type.params.length) {
        morfForms.push(word.substr(type.params.length + 1));
      }
    } else {
      morfForms.push(word);
    }
  }
  return morfForms.join(', ');
};


/**
 * @description - Get a list of all the localization keys for a morph string in Greek
 * @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
 * @return {Array} - List of localization keys (unknown codes are prefixed with `*`)
 */
export const getMorphLocalizationKeysGreek = morph => {
  if (!morph || typeof morph !== 'string' || !morph.trim().length) {
    return [];
  }
  morph = morph.trim();

  const morphKeys = [];
  // Will parsed out the morph string to its 12 places, the 1st being language,
  // 2nd always empty, 3rd role, 4th type, and so on
  var regex = /([A-Z0-9,][a-z]*)/g; // Delimited by boundry of a comma or uppercase letter
  var codes = morph.match(regex).map(code => code === ',' ? null : code);
  if (codes.length < 3) {
    return morph;
  }

  if (morphCodeLocalizationMap[2].hasOwnProperty(codes[2]))
    morphKeys.push(morphCodeLocalizationMap[2][codes[2]].key); // role
  else
    morphKeys.push('*' + codes[2]); // no known localization key, so prefixing with '*'
  if (codes[3]) {
    if (morphCodeLocalizationMap[2].hasOwnProperty(codes[2]) && morphCodeLocalizationMap[2][codes[2]][3].hasOwnProperty(codes[3]))
      morphKeys.push(morphCodeLocalizationMap[2][codes[2]][3][codes[3]]); // type
    else
      morphKeys.push('*' + codes[3]); // unknown type, prefixing with '*'
  }
  codes.forEach((code, index) => {
    // 0 and 1  are ignored, already did 2 and 3 above
    if (index < 4 || !code)
      return;
    if (morphCodeLocalizationMap[index].hasOwnProperty(code))
      morphKeys.push(morphCodeLocalizationMap[index][code]);
    else
      morphKeys.push('*' + code); // unknown code, prefixing with '*'
  });
  return morphKeys;
};
