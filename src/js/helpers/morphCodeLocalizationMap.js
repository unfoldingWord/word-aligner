// These reflect the columns on page 55 of https://greekcntr.org/downloads/project.pdf
// This helps us translate codes starting and the 3rd place (the 2nd index) of a morph string
// The numbered keys are the index of that code in the string, where the letter index is the code
// Each role's 3rd index (the type code) is different, so we nest index 3 in the role's entry
export const morphCodeLocalizationMap = {
  2: { // role
    N: {
      key: 'tools.noun',
      3: { // noun types
        S: 'tools.substatitive_adj',
        P: 'tools.predicate_adj'
      }
    },
    A: {
      key: 'tools.adjective',
      3: { // adjective types
        A: 'tools.ascriptive',
        R: 'tools.restrictive'
      }
    },
    E: {
      key: 'tools.determiner',
      3: { // determiner types
        A: 'tools.article',
        D: 'tools.demonstrative',
        F: 'tools.differential',
        P: 'tools.possessive',
        Q: 'tools.quantifier',
        N: 'tools.number',
        O: 'tools.ordinal',
        R: 'tools.relative',
        T: 'tools.interrogative'
      }
    },
    R: {
      key: 'tools.pronoun',
      3: { // pronoun types
        D: 'tools.demonstrative',
        P: 'tools.personal',
        E: 'tools.reflexive',
        C: 'tools.reciprocal',
        I: 'tools.indefinite',
        R: 'tools.relative',
        T: 'tools.interrogative'
      }
    },
    V: {
      key: 'tools.verb',
      3: { // verb types
        T: 'tools.transitive',
        I: 'tools.intransitive',
        L: 'tools.linking',
        M: 'tools.modal',
        P: 'tools.periphrastic'
      }
    },
    I: {
      key: 'tools.interjection',
      3: { // interjection types
        E: 'tools.exclamation',
        D: 'tools.directive',
        R: 'tools.response'
      }
    },
    P: {
      key: 'tools.preposition',
      3: { // preposition types
        I: 'tools.improper'
      }
    },
    D: {
      key: 'tools.adverb',
      3: { // adverb types
        O: 'tools.correlative'
      }
    },
    C: {
      key: 'tools.conjunction',
      3: { // conjuction types
        C: 'tools.coordinating',
        S: 'tools.subordinating',
        O: 'tools.correlative'
      }
    },
    T: {
      key: 'tools.particle',
      3: { // particle types
        F: 'tools.foreign',
        E: 'tools.error'
      }
    }
  },
  4: { // mood
    I: 'tools.indicative',
    M: 'tools.imperative',
    S: 'tools.subjunctive',
    O: 'tools.optative',
    N: 'tools.infinitive',
    P: 'tools.participle'
  },
  5: { // tense
    P: 'tools.present',
    I: 'tools.imperfect',
    F: 'tools.future',
    A: 'tools.aorist',
    E: 'tools.perfect',
    L: 'tools.pluperfect'
  },
  6: { // voice
    A: 'tools.active',
    M: 'tools.middle',
    P: 'tools.passive'
  },
  7: { // person
    1: 'tools.first',
    2: 'tools.second',
    3: 'tools.third'
  },
  8: { // case
    N: 'tools.nominative',
    G: 'tools.genitive',
    D: 'tools.dative',
    A: 'tools.accusative',
    V: 'tools.vocative'
  },
  9: { // gender
    M: 'tools.masculine',
    F: 'tools.feminine',
    N: 'tools.neuter'
  },
  10: { // number
    S: 'tools.singular',
    P: 'tools.plural'
  },
  11: { // other
    C: 'tools.comparative',
    S: 'tools.superlatives',
    D: 'tools.diminutive',
    I: 'tools.indeclinable'
  }
};
