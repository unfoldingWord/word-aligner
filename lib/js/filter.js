'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeMarker = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Method to filter specified usfm marker from a string
 * @param {string} string - The string to remove specfic marker from
 * @param {string} type - The type of marker to remove i.e. f | h. If no type is given all markers are removed
 * @return {string}
 */
var removeMarker = exports.removeMarker = function removeMarker() {
  var string = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var types = arguments[1];

  if (typeof types === 'string') types = [types];
  if (!types || types.includes('f')) {
    var regString = '\\\\f[\\S\\s]*\\\\f[^a-z|A-Z|0-9|\\s]*';
    var regex = new RegExp(regString, 'g');
    string = string.replace(regex, '');
  }
  if (!types || types.includes('q')) {
    var _regex = new RegExp('\\\\q', 'g');
    string = string.replace(_regex, '');
  }
  if (types) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(types), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var type = _step.value;

        if (type === 'f' || type === 'q') {
          // if this type was already handled, skip
          continue;
        }
        if (!string.includes('\\')) {
          // if no more USFM tags, then done
          break;
        }
        var _regString = '\\\\' + type;
        var _regex2 = new RegExp(_regString, 'g');
        string = string.replace(_regex2, '');
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
  }
  return string;
};