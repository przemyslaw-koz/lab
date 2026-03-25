// countDigits.js
// Exercise: Count digits in a string

/**
 * Counts how many numeric digits are in a given string.
 *
 * @param {string} text - The input string
 * @returns {number} - Number of digits found
 */
function countDigits(text) {
  let count=0;

  for (let char of text){
    if(char >= '0' && char <= '9'){
      count++;
    }
  }
  return count;
}

// Example usage
const input = "abc123xyz45";
const result = countDigits(input);

console.log(`Input: ${input}`);
console.log(`Number of digits: ${result}`);
