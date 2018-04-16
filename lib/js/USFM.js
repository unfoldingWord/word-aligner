"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.markerSupportsNumbers = exports.markContentAsText = exports.markerRequiresTermination = exports.init = exports.MARKERS_WITH_NUMBERS_LOOKUP = exports.MARK_CONTENT_AS_TEXT_LOOKUP = exports.NEED_TERMINATION_MARKERS_LOOKUP = exports.initLookup = exports.NEED_TERMINATION_MARKERS = exports.MARK_CONTENT_AS_TEXT = exports.MARKERS_WITH_NUMBERS = exports.MARKER_TYPE = undefined;

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * USFM definitions
 */

// type descriptions for tags
var MARKER_TYPE = exports.MARKER_TYPE = {
  f: "footnote",
  p: "paragraph",
  q: "quote",
  q1: "quote",
  q2: "quote",
  q3: "quote",
  q4: "quote",
  qa: "quote",
  qac: "quote",
  qc: "quote",
  qm: "quote",
  qr: "quote",
  qs: "quote",
  qt: "quote",
  s: "section",
  s1: "section",
  s2: "section",
  s3: "section",
  s4: "section",
  s5: "section"
};

// for these tags we support number attribute
var MARKERS_WITH_NUMBERS = exports.MARKERS_WITH_NUMBERS = ["c", "v"];

// for these tags we embed the contained text as a displayable text attribute instead of content
var MARK_CONTENT_AS_TEXT = exports.MARK_CONTENT_AS_TEXT = ["add", "bd", "bdit", "bk", "dc", "em", "it", "k", "lit", "nd", "no", "ord", "p", "pn", "q", "q1", "q2", "q3", "q4", "qa", "qac", "qc", "qm", "qr", "qs", "qt", "s", "s1", "s2", "s3", "s4", "s5", "sc", "sig", "sls", "sp", "tl", "v", "w", "wa", "wg", "wh", "wj"];

// for these tags we must embed following text in content until we find an end marker,
var NEED_TERMINATION_MARKERS = exports.NEED_TERMINATION_MARKERS = ["bd", "bdit", "bk", "ca", "cat", "dc", "ef", "em", "ex", "f", "fa", "fdc", "fe", "fig", "fm", "fqa", "fv", "imte", "imte1", "imte2", "imte3", "ior", "iqt", "it", "jmp", "k", "lik", "litl", "liv", "liv1", "liv2", "liv3", "nd", "ndx", "no", "ord", "pn", "png", "pro", "qac", "qs", "qt", "rb", "rq", "rt", "sc", "sig", "sis", "tl", "va", "vp", "w", "wa", "wg", "wh", "wj", "x", "xdc", "xnt", "xop", "xot", "xta"];

/**
 * @description - initialize by putting tags in object for fast lookup
 * @param {object} lookup - target lookup dictionary
 * @param {array} keys - list of tags for lookup
 */
var initLookup = exports.initLookup = function initLookup(lookup, keys) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(keys), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;

      lookup[item] = true;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

var NEED_TERMINATION_MARKERS_LOOKUP = exports.NEED_TERMINATION_MARKERS_LOOKUP = {};
var MARK_CONTENT_AS_TEXT_LOOKUP = exports.MARK_CONTENT_AS_TEXT_LOOKUP = {};
var MARKERS_WITH_NUMBERS_LOOKUP = exports.MARKERS_WITH_NUMBERS_LOOKUP = {};

/**
 * description - initialize by putting tags in dictionary for fast lookup
 */
var init = exports.init = function init() {
  initLookup(NEED_TERMINATION_MARKERS_LOOKUP, NEED_TERMINATION_MARKERS);
  initLookup(MARK_CONTENT_AS_TEXT_LOOKUP, MARK_CONTENT_AS_TEXT);
  initLookup(MARKERS_WITH_NUMBERS_LOOKUP, MARKERS_WITH_NUMBERS);
};

var markerRequiresTermination = exports.markerRequiresTermination = function markerRequiresTermination(tag) {
  return NEED_TERMINATION_MARKERS_LOOKUP[tag] === true;
};

var markContentAsText = exports.markContentAsText = function markContentAsText(tag) {
  return MARK_CONTENT_AS_TEXT_LOOKUP[tag] === true;
};

var markerSupportsNumbers = exports.markerSupportsNumbers = function markerSupportsNumbers(tag) {
  return MARKERS_WITH_NUMBERS_LOOKUP[tag] === true;
};