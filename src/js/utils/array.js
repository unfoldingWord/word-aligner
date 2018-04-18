/**
 * @description - Groups consecutive numbers in an array
 * @param {Array} numbers - array of numbers to be grouped
 * @return {Array} - grouped array of array of consecutive numbers
 */
export const groupConsecutiveNumbers = numbers => (
  numbers.reduce(function(
    accumulator, currentValue, currentIndex, originalArray) {
    if (currentValue) { // ignore undefined entries
      // if this iteration is consecutive to the last, add it to the previous run
      if (currentValue - originalArray[currentIndex - 1] === 1) {
        accumulator[accumulator.length - 1].push(currentValue);
      } else { // the start of a new run including first element
        // create a new subarray with this as the start
        accumulator.push([currentValue]);
      }
    }
    return accumulator; // return state for next iteration
  }, [])
);

/**
 * @description - Deletes indices from an array safely
 * @param {Array} array - array elements to delete from
 * @param {Array} indices - array of indicies to delete
 * @return {Array} - the resulting array after indexes were safely removed
 */
export const deleteIndices = (array, indices) => {
  let _array = JSON.parse(JSON.stringify(array));
  indices.sort((a, b) => b - a);
  indices.forEach(index => {
    if (index >= 0) _array.splice(index, 1);
  });
  return _array;
};

/**
 * Helper function to flatten a double nested array
 * @param {array} arr - Array to be flattened
 * @return {array} - Flattened array
 */
export const flattenArray = arr => {
  return [].concat(...arr);
};
