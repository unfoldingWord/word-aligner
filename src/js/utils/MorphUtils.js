/* eslint-disable no-use-before-define */
import {morphCodeLocalizationMapGrk, morphCodeLocalizationMapAr, morphCodeLocalizationMapHeb} from './morphCodeLocalizationMap';

/**
 * @description - Get the human readable full morphological data from a morph string that is specific for language
 * @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
 * @param {function} translate - translation function
 * @return {String} - the full mophological data string that is human readable
 */
export const getFullMorphologicalString = (morph, translate) => {
  const parts = ((typeof morph === 'string') && morph.split(','));
  const language = parts && parts[0].toLowerCase();
  switch (language) {
    case 'he':
    case 'ar':
      morph = parts.slice(1).join(',');
      return getFullMorphologicalStringHebrewAramaic(morph, language, translate);

    case 'gr':
    default:
      return getFullMorphologicalStringGreek(morph, translate);
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
 * @description - Get the human readable full morphological data from a morph string in Greek
 * @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
 * @param {function} translate - translation function
 * @return {String} - the full mophological data string that is human readable
 */
export const getFullMorphologicalStringGreek = (morph, translate) => {
  if (!morph || typeof morph !== 'string' || !morph.trim().length) {
    return '';
  }
  morph = morph.trim();
  if (!translate) {
    translate = k => k;
  }

  const morphForms = [];
  // Will parsed out the morph string to its 12 places, the 1st being language,
  // 2nd always empty, 3rd role, 4th type, and so on
  var regex = /([A-Z0-9,][a-z]*)/g; // Delimited by boundry of a comma or uppercase letter
  var codes = morph.match(regex).map(code => code === ',' ? null : code);
  if (codes.length < 3) {
    return morph;
  }

  if (morphCodeLocalizationMapGrk[2].hasOwnProperty(codes[2]))
    morphForms.push(translate(morphCodeLocalizationMapGrk[2][codes[2]].key)); // role
  else
    morphForms.push(codes[2]); // unknown role, putting on stack withtout translation
  if (codes[3]) {
    if (morphCodeLocalizationMapGrk[2].hasOwnProperty(codes[2]) && morphCodeLocalizationMapGrk[2][codes[2]][3].hasOwnProperty(codes[3]))
      morphForms.push(translate(morphCodeLocalizationMapGrk[2][codes[2]][3][codes[3]])); // type
    else
      morphForms.push(codes[3]); // unknown type, putting on stack without translation
  }
  codes.forEach((code, index) => {
    // 0 and 1  are ignored, already did 2 and 3 above
    if (index < 4 || !code)
      return;
    if (morphCodeLocalizationMapGrk[index].hasOwnProperty(code))
      morphForms.push(translate(morphCodeLocalizationMapGrk[index][code]));
    else
      morphForms.push(code); // unknown code, putting on stack without translation
  });
  return morphForms.join(', ');
};
