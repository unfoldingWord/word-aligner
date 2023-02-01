jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
const assert = require('assert');
import * as MorphUtils from '../src/js/utils/MorphUtils';
import ospath from 'ospath';

const RESOURCE_PATH = path.join(ospath.home(), 'translationCore', 'resources');
const OT_PATH = path.join(RESOURCE_PATH, 'hbo/bibles/uhb/v1.4.1');
const outputFolder = path.join(__dirname, 'fixtures/morphs');

export const BIBLE_BOOKS = {
  oldTestament: {
    'gen': 'Genesis',
    'exo': 'Exodus',
    'lev': 'Leviticus',
    'num': 'Numbers',
    'deu': 'Deuteronomy',
    'jos': 'Joshua',
    'jdg': 'Judges',
    'rut': 'Ruth',
    '1sa': '1 Samuel',
    '2sa': '2 Samuel',
    '1ki': '1 Kings',
    '2ki': '2 Kings',
    '1ch': '1 Chronicles',
    '2ch': '2 Chronicles',
    'ezr': 'Ezra',
    'neh': 'Nehemiah',
    'est': 'Esther',
    'job': 'Job',
    'psa': 'Psalms',
    'pro': 'Proverbs',
    'ecc': 'Ecclesiastes',
    'sng': 'Song of Solomon',
    'isa': 'Isaiah',
    'jer': 'Jeremiah',
    'lam': 'Lamentations',
    'ezk': 'Ezekiel',
    'dan': 'Daniel',
    'hos': 'Hosea',
    'jol': 'Joel',
    'amo': 'Amos',
    'oba': 'Obadiah',
    'jon': 'Jonah',
    'mic': 'Micah',
    'nam': 'Nahum',
    'hab': 'Habakkuk',
    'zep': 'Zephaniah',
    'hag': 'Haggai',
    'zec': 'Zechariah',
    'mal': 'Malachi',
  },
  newTestament: {
    'mat': 'Matthew',
    'mrk': 'Mark',
    'luk': 'Luke',
    'jhn': 'John',
    'act': 'Acts',
    'rom': 'Romans',
    '1co': '1 Corinthians',
    '2co': '2 Corinthians',
    'gal': 'Galatians',
    'eph': 'Ephesians',
    'php': 'Philippians',
    'col': 'Colossians',
    '1th': '1 Thessalonians',
    '2th': '2 Thessalonians',
    '1ti': '1 Timothy',
    '2ti': '2 Timothy',
    'tit': 'Titus',
    'phm': 'Philemon',
    'heb': 'Hebrews',
    'jas': 'James',
    '1pe': '1 Peter',
    '2pe': '2 Peter',
    '1jn': '1 John',
    '2jn': '2 John',
    '3jn': '3 John',
    'jud': 'Jude',
    'rev': 'Revelation',
  },
};


describe('MorphUtils tests', () => {
  for (const bookId of Object.keys(BIBLE_BOOKS.newTestament)) {
    const outputFolder = path.join(__dirname, 'fixtures/morphs/SR');
    it.skip(`test book ${bookId}`, () => { // reads all the words from book and saves parsed morphs to file
      const morphs = {};
      // const bookPath = path.join(OT_PATH, bookId);
      const bookPath = path.join(RESOURCE_PATH, 'el-x-koine/bibles/ugnt/v0.35-SR_photonomad0', bookId);
      const files = fs.readdirSync(bookPath);
      for (const file of files) {
        const chapter = fs.readJsonSync(path.join(bookPath, file));
        const verses = Object.keys(chapter);
        for (const verseNum of verses) {
          const verse = chapter[verseNum];
          const objects = verse.verseObjects;
          getMorphs(objects, morphs);
        }
      }
      let output = "";
      const morphEntry = Object.keys(morphs).sort();
      for (const morph of morphEntry) {
        const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
        for (const key of morphKeys) {
          if (key.startsWith('*') && (key !== '*:')) {
            console.log("In '" + morph + "', '" + key + "' is not translated!");
          }
        }
        morphs[morph] = morphKeys;
        if (output) {
          output += ',\n';
        }
        output += '  "' + morph + '": ' + JSON.stringify(morphKeys);
      }
      output = '{\n' + output + '\n}\n';
      const outFile = path.join(outputFolder, bookId + '-morphs.json');
      fs.outputFileSync(outFile, output);
    });
  }

  const morphsPath = path.join('__tests__', 'fixtures', 'morphs');
  const files = fs.readdirSync(morphsPath);
  for (const file of files) {
    const parse = path.parse(file);
    if (parse.ext !== '.json') {
      continue;
    }

    it('Test MorphUtils.getMorphLocalizationKeys() - All morph strings render as expected for ' + file, () => {
      const filePath = path.join(morphsPath, file);
      const allMorphs = fs.readJSONSync(filePath);
      Object.keys(allMorphs).forEach(morph => {
        const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
        // process.stdout.write('  "'+morph+'": "'+morphKeys+'",\n');
        expect(morphKeys).toEqual(allMorphs[morph]);
        for (const key of morphKeys) {
          if (key.startsWith('*') && (key !== '*:')) {
            assert.fail("Invalid parsed morph '" + key + "' in " + JSON.stringify(morphKeys));
          }
        }
      });
    });
  }

  describe('Greek', () => {
    it('Test MorphUtils.getMorphLocalizationKeys() - test paul', () => {
      const goodMorph = 'Gr,N,,,,,NMS,'; // width 13
      const expectedMorphKeys = ["noun", "nominative", "masculine", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(goodMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - test SR paul', () => {
      const goodMorph = 'Gr,N,....NMS'; // width 12
      const expectedMorphKeys = ["noun", "nominative", "masculine", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(goodMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - test SR Οὐκ', () => {
      const goodMorph = 'Gr,T,.......'; // width 12
      const expectedMorphKeys = ["particle"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(goodMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - test ἐπιδιορθώσῃ', () => {
      const goodMorph = 'Gr,V,SAM2..S'; // width 12
      const expectedMorphKeys = ["verb", "subjunctive", "aorist", "middle", "second", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(goodMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - test διεταξάμην', () => {
      const goodMorph = 'Gr,V,IAM1..S'; // width 12
      const expectedMorphKeys = ["verb", "indicative", "aorist", "middle", "first", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(goodMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - test ἔλεγχε', () => {
      const goodMorph = 'Gr,V,MPA2..S'; // width 12
      const expectedMorphKeys = ["verb", "imperative", "present", "active", "second", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(goodMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - test εἶναι', () => {
      const goodMorph = 'Gr,V,NPA....'; // width 12
      const expectedMorphKeys = ["verb", "infinitive", "present", "active"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(goodMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - test λείποντα', () => {
      const goodMorph = 'Gr,V,PPA.ANP'; // width 12
      const expectedMorphKeys = ["verb", "participle", "present", "active", "accusative", "neuter", "plural"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(goodMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - test πρὸς', () => {
      const goodMorph = 'Gr,P,.......'; // width 12
      const expectedMorphKeys = ["preposition"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(goodMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - test καθαρὰ', () => {
      const goodMorph = 'Gr,S,....NNP'; // width 12
      const expectedMorphKeys = ["substantive_adjective", "nominative", "neuter", "plural"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(goodMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
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

  describe('Hebrew', () => {
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew adjective', () => {
      const morph = "He,Acmsa";
      const expectedMorphKeys = ["adjective", "cardinal_number", "masculine", "singular", "absolute"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew adverb', () => {
      const morph = "He,D";
      const expectedMorphKeys = ["adverb"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew multipart noun', () => {
      const morph = "He,C:Td:Ncbsa";
      const expectedMorphKeys = ["conjunction", "*:", "particle", "definite_article", "*:", "noun", "common", "both_genders", "singular", "absolute"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew Preposition', () => {
      const morph = "He,R";
      const expectedMorphKeys = ["preposition"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew verb', () => {
      const morph = "He,Vqp3fs";
      const expectedMorphKeys = ["verb", "qal", "perfect_qatal", "third", "feminine", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - invalid type', () => {
      const morph = "He,Xqp3fs";
      const expectedMorphKeys = ["*Xqp3fs"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - invalid verb stem', () => {
      const morph = "He,V1p3fs";
      const expectedMorphKeys = ["verb", "*1", "perfect_qatal", "third", "feminine", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew morph too long', () => {
      const morph = "He,Vqp3fsaa";
      const expectedMorphKeys = ["verb", "qal", "perfect_qatal", "third", "feminine", "singular", "absolute", "*a"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
  });

  describe('Aramaic', () => {
    it('Test MorphUtils.getFullMorphologicalString() - Aramaic verb', () => {
      const morph = "Ar,Vqp3ms";
      const expectedMorphKeys = ["verb", "peal", "perfect_qatal", "third", "masculine", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Aramaic pronoun', () => {
      const morph = "Ar,Pf3bs";
      const expectedMorphKeys = ["pronoun", "indefinite", "third", "both_genders", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Aramaic preposition, suffix', () => {
      const morph = "Ar,R:Sp3ms";
      const expectedMorphKeys = ["preposition", "*:", "suffix", "pronominal", "third", "masculine", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
  });
});

//
// helpers
//

function getMorphs(objects, morphs) {
  for (let object of objects) {
    if (object.morph) {
      morphs[object.morph] = object.morph;
    }
    if (object.children) {
      getMorphs(object.children, morphs);
    }
  }
}
