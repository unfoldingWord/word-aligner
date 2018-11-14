jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import * as MorphUtils from '../src/js/utils/MorphUtils';

describe('MorphUtils tests', () => {
  it('Test MorphUtils.getMorphLocalizationKeys() - All morph strings render as expected', () => {
    const morphsPath = path.join('__tests__', 'fixtures', 'morphs', 'all-titus-morphs.json');
    const allTitusMorphs = fs.readJSONSync(morphsPath);
    Object.keys(allTitusMorphs).forEach(morph => {
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      // process.stdout.write('  "'+morph+'": "'+morphKeys+'",\n');
      expect(morphKeys).toEqual(allTitusMorphs[morph]);
    });
  });

  it('Test MorphUtils.getMorphLocalizationKeys() - Unknown codes still return in comma delimited list', () => {
    const badMorph = 'AbCZEF,HI';
    const expectedMorphKeys = ['*Z', '*E', '*F', '*H', '*I'];
    const morphKeys = MorphUtils.getMorphLocalizationKeys(badMorph);
    expect(morphKeys).toEqual(expectedMorphKeys);
  });

  it('Test MorphUtils.getMorphLocalizationKeys() - morph is null', () => {
    const badMorph = null;
    const expectedMorphKeys = [];
    const morphKeys = MorphUtils.getMorphLocalizationKeys(badMorph);
    expect(morphKeys).toEqual(expectedMorphKeys);
  });

  it('Test MorphUtils.getMorphLocalizationKeys() - morph is too short', () => {
    const badMorph = 'Gr,';
    const expectedMorphKeys = 'Gr,';
    const morphKeys = MorphUtils.getMorphLocalizationKeys(badMorph);
    expect(morphKeys).toEqual(expectedMorphKeys);
  });

  it('Test MorphUtils.getMorphLocalizationKeys() - morph is just a role', () => {
    const badMorph = 'Gr,A';
    const expectedMorphKeys = ['adjective'];
    const morphKeys = MorphUtils.getMorphLocalizationKeys(badMorph);
    expect(morphKeys).toEqual(expectedMorphKeys);
  });

  it('Test MorphUtils.getMorphLocalizationKeys() - morph is not a string', () => {
    const badMorph = {A: 'B'};
    const expectedMorphKeys = [];
    const morphKeys = MorphUtils.getMorphLocalizationKeys(badMorph);
    expect(morphKeys).toEqual(expectedMorphKeys);
  });
});
