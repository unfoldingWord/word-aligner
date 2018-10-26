import {morphCodeLocalizationMap} from './morphCodeLocalizationMap';

/**
 * @description - Get the human readable full morphological data from a morph string
 * @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
 * @param {function} translate - translation function
 * @return {String} - the full mophological data string that is human readable
 */
export const getFullMorphologicalString = (morph, translate) => {
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

  if (morphCodeLocalizationMap[2].hasOwnProperty(codes[2]))
    morphForms.push(translate(morphCodeLocalizationMap[2][codes[2]].key)); // role
  else
    morphForms.push(codes[2]); // unknown role, putting on stack withtout translation
  if (codes[3]) {
    if (morphCodeLocalizationMap[2].hasOwnProperty(codes[2]) && morphCodeLocalizationMap[2][codes[2]][3].hasOwnProperty(codes[3]))
      morphForms.push(translate(morphCodeLocalizationMap[2][codes[2]][3][codes[3]])); // type
    else
      morphForms.push(codes[3]); // unknown type, putting on stack without translation
  }
  codes.forEach((code, index) => {
    // 0 and 1  are ignored, already did 2 and 3 above
    if (index < 4 || !code)
      return;
    if (morphCodeLocalizationMap[index].hasOwnProperty(code))
      morphForms.push(translate(morphCodeLocalizationMap[index][code]));
    else
      morphForms.push(code); // unknown code, putting on stack without translation
  });
  return morphForms.join(', ');
};
