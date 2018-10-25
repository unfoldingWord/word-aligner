jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import * as MorphologyHelpers from '../src/js/helpers/MorphologyHelpers';

describe('MorphologyHelpers tests', () => {
  it('Test MorphologyHelpers.getFullMorphologicalString() - All morph strings render as expected', () => {
    const morphsPath = path.join('__tests__', 'fixtures', 'morphs', 'all-titus-morphs.json');
    const allTitusMorphs = fs.readJSONSync(morphsPath);
    Object.keys(allTitusMorphs).forEach(morph => {
      const morphStr = MorphologyHelpers.getFullMorphologicalString(morph, k=>k.split('.')[1]);
      // process.stdout.write('  "'+morph+'": "'+morphStr+'",\n');
      expect(morphStr).toEqual(allTitusMorphs[morph]);
    });
  });
});
