"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flattenArray = exports.deleteIndices = exports.groupConsecutiveNumbers = undefined;

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @description - Groups consecutive numbers in an array
 * @param {Array} numbers - array of numbers to be grouped
 * @return {Array} - grouped array of array of consecutive numbers
 */
var groupConsecutiveNumbers = exports.groupConsecutiveNumbers = function groupConsecutiveNumbers(numbers) {
  return numbers.reduce(function (accumulator, currentValue, currentIndex, originalArray) {
    if (currentValue) {
      // ignore undefined entries
      // if this iteration is consecutive to the last, add it to the previous run
      if (currentValue - originalArray[currentIndex - 1] === 1) {
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
 * @return {Array} - the resulting array after indexes were safely removed
 */
var deleteIndices = exports.deleteIndices = function deleteIndices(array, indices) {
  var _array = JSON.parse((0, _stringify2.default)(array));
  indices.sort(function (a, b) {
    return b - a;
  });
  indices.forEach(function (index) {
    if (index >= 0) _array.splice(index, 1);
  });
  return _array;
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