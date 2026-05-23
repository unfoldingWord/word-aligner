# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

**word-aligner** is an NPM library for handling word alignment logic between original-language Bible text (Greek, Hebrew, Aramaic) and target-language translations. It converts between USFM verse strings, verse object hierarchies, and structured alignment data used across unfoldingWord tools.

## Commands

```bash
# Install (legacy-peer-deps required due to usfm-js peer dependency)
npm i --legacy-peer-deps

# Run linting + all tests
npm test

# Run tests only (skip lint)
npx jest

# Run a single test file
npx jest __tests__/align.test.js

# Run tests matching a pattern
npx jest --testNamePattern "oneToOne"

# Lint only
npx eslint ./src

# Lint with auto-fix
npm run fix

# Compile src/ → lib/ (required before publishing)
npm run build

# Rebuild test fixture JSON files
npm run build:test-data
```

## Architecture

### Entry point

`src/index.js` exports four things:
- `default` — the main aligner (`src/js/aligner.js`)
- `VerseObjectUtils` — verse object parsing helpers (`src/js/utils/verseObjects.js`)
- `MorphUtils` — morphological code parser for Greek/Hebrew/Aramaic (`src/js/utils/MorphUtils.js`)
- `ArrayUtils` — low-level array helpers (`src/js/utils/array.js`)

The compiled output lives in `lib/` (Babel 6, `babel-preset-es2015`). The `lib/` directory is what npm consumers receive; `src/` is the authoritative source.

### Core module: `src/js/aligner.js`

The heart of the library. Two inverse operations:

- **`merge(alignments, wordBank, verseString, useVerseText)`** — Takes alignment data and a target verse, rebuilds a nested verse object hierarchy with alignment milestones.
- **`unmerge(verseObjects, alignedVerse)`** — Extracts structured `alignments` and `wordBank` arrays from verse objects.

Supporting functions `restoreVerseObjects()` and `restoreHierarchy()` handle the parent-child reconstruction after array manipulation. `combineConsecutiveText()` cleans up adjacent text nodes in the output. `wordMap` (an array of `{object, parent}` pairs) is used throughout to safely navigate and mutate deeply nested structures without losing position.

### Key data shapes

**Alignment:**
```js
{
  topWords: [{ word, strong, lemma, morph, occurrence, occurrences }],  // original language
  bottomWords: [{ word, occurrence, occurrences }]                       // target language
}
```

**VerseObject:**
```js
{
  tag: 'w' | 'k' | ...,
  type: 'word' | 'text' | 'paragraph' | 'milestone',
  text?: string,
  children?: VerseObject[],
  occurrence?: number,
  occurrences?: number
}
```

Milestones (`type: 'milestone'`) act as alignment containers; their `children` hold the target-language word objects that are aligned to the `topWords` stored on the milestone itself.

### Tests and fixtures

Test files live in `__tests__/`. Fixture JSON and USFM files are in `__tests__/fixtures/pivotAlignmentVerseObjects/` — each fixture represents a real Bible verse edge case (nested milestones, punctuation, non-contiguous alignments, etc.).

`scripts/BuildTestData.js` regenerates the fixture JSON from USFM sources using `word-aligner-rcl`. Run `npm run build:test-data` after updating fixture source files.

### Morphological parsing

`MorphUtils.js` decodes morph code strings (e.g., `Gr,V,,,,,AAN,,`) into localization key arrays using language-specific maps in `src/js/utils/morphCodeLocalizationMap.js`. It branches on Greek vs. Hebrew/Aramaic and handles sub-type disambiguation within each language family.

## Dependencies to know

| Package | Role |
|---|---|
| `usfm-js` | Parses USFM Bible markup into verse object arrays |
| `string-punctuation-tokenizer` | Splits verse text, preserving punctuation as separate tokens |
| `lodash` | `cloneDeep` used when mutating verse object trees |
| `word-aligner-rcl` | React component library (dev only); used by `BuildTestData.js` |

## Publish workflow

```bash
npm i --legacy-peer-deps
npm run build     # compiles src/ → lib/
npm publish       # runs npm test + build automatically via prepublishOnly hook
                  # then auto-tags git: v$npm_package_version
```