jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import * as morphHelpers from '../src/js/utils/morphHelpers';

describe('MorphologyHelpers tests', () => {
  it('Test MorphologyHelpers.getFullMorphologicalString() - All morph strings render as expected', () => {
    const morphsPath = path.join('__tests__', 'fixtures', 'morphs', 'all-titus-morphs.json');
    const allTitusMorphs = fs.readJSONSync(morphsPath);
    Object.keys(allTitusMorphs).forEach(morph => {
      const morphStr = morphHelpers.getFullMorphologicalString(morph, k=>k);
      // process.stdout.write('  "'+morph+'": "'+morphStr+'",\n');
      expect(morphStr).toEqual(allTitusMorphs[morph]);
    });
  });
});
