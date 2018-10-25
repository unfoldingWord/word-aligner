// These reflect the columns on page 55 of https://greekcntr.org/downloads/project.pdf
// This helps us translate codes starting and the 3rd place (the 2nd index) of a morph string
// The numbered keys are the index of that code in the string, where the letter index is the code
// Each role's 3rd index (the type code) is different, so we nest index 3 in the role's entry
export const morphCodeLocalizationMap = {
  2: { // role
    N: {
      key: 'noun',
      3: { // noun types
        S: 'substatitive_adj',
        P: 'predicate_adj'
      }
    },
    A: {
      key: 'adjective',
      3: { // adjective types
        A: 'ascriptive',
        R: 'restrictive'
      }
    },
    E: {
      key: 'determiner',
      3: { // determiner types
        A: 'article',
        D: 'demonstrative',
        F: 'differential',
        P: 'possessive',
        Q: 'quantifier',
        N: 'number',
        O: 'ordinal',
        R: 'relative',
        T: 'interrogative'
      }
    },
    R: {
      key: 'pronoun',
      3: { // pronoun types
        D: 'demonstrative',
        P: 'personal',
        E: 'reflexive',
        C: 'reciprocal',
        I: 'indefinite',
        R: 'relative',
        T: 'interrogative'
      }
    },
    V: {
      key: 'verb',
      3: { // verb types
        T: 'transitive',
        I: 'intransitive',
        L: 'linking',
        M: 'modal',
        P: 'periphrastic'
      }
    },
    I: {
      key: 'interjection',
      3: { // interjection types
        E: 'exclamation',
        D: 'directive',
        R: 'response'
      }
    },
    P: {
      key: 'preposition',
      3: { // preposition types
        I: 'improper'
      }
    },
    D: {
      key: 'adverb',
      3: { // adverb types
        O: 'correlative'
      }
    },
    C: {
      key: 'conjunction',
      3: { // conjuction types
        C: 'coordinating',
        S: 'subordinating',
        O: 'correlative'
      }
    },
    T: {
      key: 'particle',
      3: { // particle types
        F: 'foreign',
        E: 'error'
      }
    }
  },
  4: { // mood
    I: 'indicative',
    M: 'imperative',
    S: 'subjunctive',
    O: 'optative',
    N: 'infinitive',
    P: 'participle'
  },
  5: { // tense
    P: 'present',
    I: 'imperfect',
    F: 'future',
    A: 'aorist',
    E: 'perfect',
    L: 'pluperfect'
  },
  6: { // voice
    A: 'active',
    M: 'middle',
    P: 'passive'
  },
  7: { // person
    1: 'first',
    2: 'second',
    3: 'third'
  },
  8: { // case
    N: 'nominative',
    G: 'genitive',
    D: 'dative',
    A: 'accusative',
    V: 'vocative'
  },
  9: { // gender
    M: 'masculine',
    F: 'feminine',
    N: 'neuter'
  },
  10: { // number
    S: 'singular',
    P: 'plural'
  },
  11: { // other
    C: 'comparative',
    S: 'superlatives',
    D: 'diminutive',
    I: 'indeclinable'
  }
};
