/**
 * @description - Groups consecutive numbers in an array
 * @param {Array} numbers - array of numbers to be grouped
 * @param {Array} wordMap - ordered map of word locations in verseObjects
 * @return {Array} - grouped array of array of consecutive numbers
 */
export const groupConsecutiveNumbers = (numbers, wordMap) => (
  numbers.reduce(function(
      accumulator, currentValue, currentIndex, originalArray) {
    if (currentValue >= 0) { // ignore undefined entries
      const current = wordMap[currentValue];
      const last = (currentIndex > 0) ? wordMap[originalArray[currentIndex - 1]] : {};
      // if this iteration is consecutive to the last, add it to the previous run
      if ((current.array === last.array) && // make sure they are stored in the same array
            (current.pos - last.pos === 1)) {
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
 * @param {Array} wordMap - ordered map of word locations in verseObjects
 * @return {Array} - the resulting array after indexes were safely removed
 */
export const deleteIndices = (array, indices, wordMap) => {
  indices.sort((a, b) => b - a);
  const length = indices.length;
  for (let i = 0; i < length; i++) {
    const index = indices[i];
    if (index >= 0) {
      const location = wordMap[index];
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
export const flattenArray = (arr) => {
  return [].concat(...arr);
};
