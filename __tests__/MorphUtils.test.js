jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import * as MorphUtils from '../src/js/utils/MorphUtils';

describe('MorphUtils tests', () => {
  it('Test MorphUtils.getFullMorphologicalString() - All morph strings render as expected', () => {
    const morphsPath = path.join('__tests__', 'fixtures', 'morphs', 'all-titus-morphs.json');
    const allTitusMorphs = fs.readJSONSync(morphsPath);
    Object.keys(allTitusMorphs).forEach(morph => {
      const morphStr = MorphUtils.getFullMorphologicalString(morph);
      // process.stdout.write('  "'+morph+'": "'+morphStr+'",\n');
      expect(morphStr).toEqual(allTitusMorphs[morph]);
    });
  });

  describe('Greek', () => {
    it('Test MorphUtils.getFullMorphologicalString() - Unknown codes still return in comma delimited list', () => {
      const badMorph = 'AbCZEF,HI';
      const expectedMorphStr = 'Z, E, F, H, I';
      const morphStr = MorphUtils.getFullMorphologicalString(badMorph);
      expect(morphStr).toEqual(expectedMorphStr);
    });

    it('Test MorphUtils.getFullMorphologicalString() - morph is null', () => {
      const badMorph = null;
      const expectedMorphStr = '';
      const morphStr = MorphUtils.getFullMorphologicalString(badMorph);
      expect(morphStr).toEqual(expectedMorphStr);
    });

    it('Test MorphUtils.getFullMorphologicalString() - morph is too short', () => {
      const badMorph = 'Gr,';
      const expectedMorphStr = 'Gr,';
      const morphStr = MorphUtils.getFullMorphologicalString(badMorph);
      expect(morphStr).toEqual(expectedMorphStr);
    });

    it('Test MorphUtils.getFullMorphologicalString() - morph is just a role', () => {
      const badMorph = 'Gr,A';
      const expectedMorphStr = 'adjective';
      const morphStr = MorphUtils.getFullMorphologicalString(badMorph);
      expect(morphStr).toEqual(expectedMorphStr);
    });

    it('Test MorphUtils.getFullMorphologicalString() - morph is not a string', () => {
      const badMorph = {A: 'B'};
      const expectedMorphStr = '';
      const morphStr = MorphUtils.getFullMorphologicalString(badMorph);
      expect(morphStr).toEqual(expectedMorphStr);
    });
  });

  describe('Hebrew', () => {
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew multipart noun', () => {
      const morph = "He,C:Td:Ncbsa";
      const expectedMorphStr = 'conjunction, :, particle, definite article, :, noun, common, both (noun), singular, absolute';
      const morphStr = MorphUtils.getFullMorphologicalString(morph);
      expect(morphStr).toEqual(expectedMorphStr);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew verb', () => {
      const morph = "He,Vqp3fs";
      const expectedMorphStr = "verb, qal, perfect (qatal), third, feminine, singular";
      const morphStr = MorphUtils.getFullMorphologicalString(morph);
      expect(morphStr).toEqual(expectedMorphStr);
    });
  });
});
