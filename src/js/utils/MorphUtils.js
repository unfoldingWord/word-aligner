import {morphCodeLocalizationMap} from './morphCodeLocalizationMap';

/**
 * @description - Get a list of all the localiation keys for a morph string
 * @param {String} morph - the morph string, e.g. Gr,N,,,,,GMS,
 * @return {Array} - List of localization keys (unknown codes are prefixed with `*`)
 */
export const getMorphLocalizationKeys = morph => {
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
