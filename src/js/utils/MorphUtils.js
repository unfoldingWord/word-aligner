/* eslint-disable no-use-before-define */
import {
  morphCodeLocalizationMapGrk,
  morphCodeLocalizationMapAr,
  morphCodeLocalizationMapHeb,
  morphCodeLocalizationMapSrGrk
} from './morphCodeLocalizationMap';

/**
 * @description - Get a list of all the localization keys for a morph string in Greek
 * @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
 * @return {Array} - List of localization keys (unknown codes are prefixed with `*`)
  */
export const getMorphLocalizationKeys = (morph) => {
  const parts = ((typeof morph === 'string') && morph.trim().split(','));
  const language = parts && parts[0].toLowerCase();
  switch (language) {
    case 'he':
    case 'ar':
      morph = parts.slice(1).join(',');
      return getMorphLocalizationKeysHebrewAramaic(morph, language);

    case 'gr':
    default:
      if (morph && morph.length === 12) {
        return getMorphLocalizationKeysGreekSR(morph);
      }
      return getMorphLocalizationKeysGreek(morph);
  }
};

/**
 * @description - Get a list of all the localization keys for a morph string in Hebrew and Aramaic
 * @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
 * @param {String} language - translation function
 * @return {Array} - List of localization keys (unknown codes are prefixed with `*`)
 */
export const getMorphLocalizationKeysHebrewAramaic = (morph, language) => {
  const lookup = (language === 'ar') ? morphCodeLocalizationMapAr : morphCodeLocalizationMapHeb;
  const words = morph.split(':');
  const morKeys = [];
  for (let i = 0, len = words.length; i < len; i++) {
    if (morKeys.length) {
      morKeys.push('*:');
    }
    const word = words[i].trim();
    const type = lookup[word[0]];
    if (type && type.key && type.params) {
      morKeys.push(type.key);
      let params = type.params;
      if (type.variations) { // iterate through variations to find match
        for (const variation of type.variations) {
          if (variation.regex && variation.params) {
            const match = word.match(variation.regex);
            if (match) {
              params = variation.params;
              break;
            }
          }
        }
      }
      const wLen = Math.min(word.length, type.params.length + 1);
      for (let k = 1; k < wLen; k++) {
        const char = word[k];
        const param = params[k - 1];
        const values = lookup[param] || [];
        const descript = values[char] || ('*' + char);
        if (char !== 'x') {
          morKeys.push(descript);
        }
      }
      if (word.length - 1 > type.params.length) {
        morKeys.push('*' + word.substr(type.params.length + 1));
      }
    } else {
      morKeys.push('*' + word);
    }
  }
  return morKeys;
};

/**
 * @description - Get a list of all the localization keys for a morph string in Greek
 * @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
 * @return {Array} - List of localization keys (unknown codes are prefixed with `*`)
 */
export const getMorphLocalizationKeysGreek = (morph) => {
  if (!morph || typeof morph !== 'string' || !morph.trim().length) {
    return [];
  }

  const morphKeys = [];
  // Will parsed out the morph string to its 12 places, the 1st being language,
  // 2nd always empty, 3rd role, 4th type, and so on
  const regex = /([A-Z0-9,][a-z]*)/g; // Delimited by boundry of a comma or uppercase letter
  const codes = morph.match(regex).map((code) => code === ',' ? null : code);
  if (codes.length < 3) {
    return morph;
  }

  if (morphCodeLocalizationMapGrk[2].hasOwnProperty(codes[2])) {
    morphKeys.push(morphCodeLocalizationMapGrk[2][codes[2]].key);
  } else {
    morphKeys.push('*' + codes[2]);
  } // no known localization key, so prefixing with '*'
  if (codes[3]) {
    if (morphCodeLocalizationMapGrk[2].hasOwnProperty(codes[2]) && morphCodeLocalizationMapGrk[2][codes[2]][3].hasOwnProperty(codes[3])) {
      morphKeys.push(morphCodeLocalizationMapGrk[2][codes[2]][3][codes[3]]);
    } else {
      morphKeys.push('*' + codes[3]);
    } // unknown type, prefixing with '*'
  }
  codes.forEach((code, index) => {
    // 0 and 1  are ignored, already did 2 and 3 above
    if (index < 4 || !code) {
      return;
    }
    if (morphCodeLocalizationMapGrk[index].hasOwnProperty(code)) {
      morphKeys.push(morphCodeLocalizationMapGrk[index][code]);
    } else {
      morphKeys.push('*' + code);
    } // unknown code, prefixing with '*'
  });
  return morphKeys;
};
/**
 * @description - Get a list of all the localization keys for a morph string in Greek
 * @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
 * @return {Array} - List of localization keys (unknown codes are prefixed with `*`)
 */
export const getMorphLocalizationKeysGreekSR = (morph) => {
  if (!morph || typeof morph !== 'string' || !morph.trim().length) {
    return [];
  }

  const morphKeys = [];
  // Will parsed out the morph string to its 12 places, the 1st being language,
  // 2nd always empty, 3rd role, 4th type, and so on
  const regex = /([A-Z0-9,.][a-z]*)/g; // Delimited by boundry of a comma or uppercase letter
  const codes = morph.match(regex).map((code) => [',', '.'].includes(code) ? null : code);
  if (codes.length < 3) {
    return morph;
  }

  const morpMapGrk = morphCodeLocalizationMapSrGrk;
  if (morpMapGrk[2].hasOwnProperty(codes[2])) {
    morphKeys.push(morpMapGrk[2][codes[2]].key);
  } else {
    morphKeys.push('*' + codes[2]); // no known localization key, so prefixing with '*'
  }
  if (codes[4]) {
    const col2 = morpMapGrk[2];
    const col2Form = col2[codes[2]];
    if (col2.hasOwnProperty(codes[2]) && col2Form[4] && col2Form[4].hasOwnProperty(codes[4])) {
      morphKeys.push(col2Form[4][codes[4]]);
    } else {
      morphKeys.push('*' + codes[4]);
    } // unknown type, prefixing with '*'
  }
  codes.forEach((code, index) => {
    // 0 and 1  are ignored, already did 2 and 3 above
    if (index < 5 || !code) {
      return;
    }
    if (morpMapGrk[index].hasOwnProperty(code)) {
      morphKeys.push(morpMapGrk[index][code]);
    } else {
      morphKeys.push('*' + code);
    } // unknown code, prefixing with '*'
  });
  return morphKeys;
};

