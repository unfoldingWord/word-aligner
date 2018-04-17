'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _aligner = require('./js/aligner');

var aligner = _interopRequireWildcard(_aligner);

var _verseObjects = require('./js/utils/verseObjects');

var VerseUtils = _interopRequireWildcard(_verseObjects);

var _array = require('./js/utils/array');

var ArrayUtils = _interopRequireWildcard(_array);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _assign2.default)(aligner, VerseUtils, ArrayUtils);