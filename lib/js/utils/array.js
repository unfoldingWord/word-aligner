"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flattenArray = exports.deleteIndices = exports.groupConsecutiveNumbers = undefined;

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @description - Groups consecutive numbers in an array
 * @param {Array} numbers - array of numbers to be grouped
 * @param {Array} wordMap - ordered map of word locations in verseObjects
 * @return {Array} - grouped array of array of consecutive numbers
 */
var groupConsecutiveNumbers = exports.groupConsecutiveNumbers = function groupConsecutiveNumbers(numbers, wordMap) {
  return numbers.reduce(function (accumulator, currentValue, currentIndex, originalArray) {
    if (currentValue >= 0) {
      // ignore undefined entries
      var current = wordMap[currentValue];
      var last = currentIndex > 0 ? wordMap[originalArray[currentIndex - 1]] : {};
      // if this iteration is consecutive to the last, add it to the previous run
      if (current.array === last.array && // make sure they are stored in the same array
      current.pos - last.pos === 1) {
        accumulator[accumulator.length - 1].push(currentValue);
      } else {
        // the start of a new run including first element
        // create a new subarray with this as the start
        accumulator.push([currentValue]);
      }
    }
    return accumulator; // return state for next iteration
  }, []);
};

/**
 * @description - Deletes indices from an array safely
 * @param {Array} array - array elements to delete from
 * @param {Array} indices - array of indicies to delete
 * @param {Array} wordMap - ordered map of word locations in verseObjects
 * @return {Array} - the resulting array after indexes were safely removed
 */
var deleteIndices = exports.deleteIndices = function deleteIndices(array, indices, wordMap) {
  indices.sort(function (a, b) {
    return b - a;
  });
  var length = indices.length;
  for (var i = 0; i < length; i++) {
    var index = indices[i];
    if (index >= 0) {
      var location = wordMap[index];
      if (location) {
        location.array.splice(location.pos, 1);
      }
    }
  }
  return array;
};

/**
 * Helper function to flatten a double nested array
 * @param {array} arr - Array to be flattened
 * @return {array} - Flattened array
 */
var flattenArray = exports.flattenArray = function flattenArray(arr) {
  var _ref;

  return (_ref = []).concat.apply(_ref, (0, _toConsumableArray3.default)(arr));
};