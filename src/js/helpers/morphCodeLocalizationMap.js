// These reflect the columns on page 55 of https://greekcntr.org/downloads/project.pdf
// This helps us translate codes starting and the 3rd place (the 2nd index) of a morph string
// The numbered keys are the index of that code in the string, where the letter index is the code
// Each role's 3rd index (the type code) is different, so we nest index 3 in the role's entry
export const morphCodeLocalizationMap = {
  2: { // role
    N: {
      key: 'pane.noun',
      3: { // noun types
        S: 'pane.substatitive_adj',
        P: 'pane.predicate_adj'
      }
    },
    A: {
      key: 'pane.adjective',
      3: { // adjective types
        A: 'pane.ascriptive',
        R: 'pane.restrictive'
      }
    },
    E: {
      key: 'pane.determiner',
      3: { // determiner types
        A: 'pane.article',
        D: 'pane.demonstrative',
        F: 'pane.differential',
        P: 'pane.possessive',
        Q: 'pane.quantifier',
        N: 'pane.number',
        O: 'pane.ordinal',
        R: 'pane.relative',
        T: 'pane.interrogative'
      }
    },
    R: {
      key: 'pane.pronoun',
      3: { // pronoun types
        D: 'pane.demonstrative',
        P: 'pane.personal',
        E: 'pane.reflexive',
        C: 'pane.reciprocal',
        I: 'pane.indefinite',
        R: 'pane.relative',
        T: 'pane.interrogative'
      }
    },
    V: {
      key: 'pane.verb',
      3: { // verb types
        T: 'pane.transitive',
        I: 'pane.intransitive',
        L: 'pane.linking',
        M: 'pane.modal',
        P: 'pane.periphrastic'
      }
    },
    I: {
      key: 'pane.interjection',
      3: { // interjection types
        E: 'pane.exclamation',
        D: 'pane.directive',
        R: 'pane.response'
      }
    },
    P: {
      key: 'pane.preposition',
      3: { // preposition types
        I: 'pane.improper'
      }
    },
    D: {
      key: 'pane.adverb',
      3: { // adverb types
        O: 'pane.correlative'
      }
    },
    C: {
      key: 'pane.conjunction',
      3: { // conjuction types
        C: 'pane.coordinating',
        S: 'pane.subordinating',
        O: 'pane.correlative'
      }
    },
    T: {
      key: 'pane.particle',
      3: { // particle types
        F: 'pane.foreign',
        E: 'pane.error'
      }
    }
  },
  4: { // mood
    I: 'pane.indicative',
    M: 'pane.imperative',
    S: 'pane.subjunctive',
    O: 'pane.optative',
    N: 'pane.infinitive',
    P: 'pane.participle'
  },
  5: { // tense
    P: 'pane.present',
    I: 'pane.imperfect',
    F: 'pane.future',
    A: 'pane.aorist',
    E: 'pane.perfect',
    L: 'pane.pluperfect'
  },
  6: { // voice
    A: 'pane.active',
    M: 'pane.middle',
    P: 'pane.passive'
  },
  7: { // person
    1: 'pane.first',
    2: 'pane.second',
    3: 'pane.third'
  },
  8: { // case
    N: 'pane.nominative',
    G: 'pane.genitive',
    D: 'pane.dative',
    A: 'pane.accusative',
    V: 'pane.vocative'
  },
  9: { // gender
    M: 'pane.masculine',
    F: 'pane.feminine',
    N: 'pane.neuter'
  },
  10: { // number
    S: 'pane.singular',
    P: 'pane.plural'
  },
  11: { // other
    C: 'pane.comparative',
    S: 'pane.superlatives',
    D: 'pane.diminutive',
    I: 'pane.indeclinable'
  }
};
