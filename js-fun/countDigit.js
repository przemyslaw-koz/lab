// countDigits.js
// Exercise: Count digits in a string

/**
 * Counts how many numeric digits are in a given string.
 *
 * @param {string} text - The input string
 * @returns {number} - Number of digits found
 */
function countDigits(text) {
  let count = 0;

  for (let char of text) {
    if (char >= "0" && char <= "9") {
      count++;
    }
  }
  return count;
}

const isDigit = (char) => char >= "0" && char <= "9";
const countDigitsSpread = (text) => [...text].filter(isDigit).length;

const countLetters = (text) =>
  [...text].filter((char) => !isDigit(char)).length;

const countUppercase = (text) =>
  [...text]
    .filter((char) => !isDigit(char))
    .filter((char) => char.toUpperCase() === char).length;

// Example usage
const input = "abc123xyz45";
const input2 = "aBVc123xyz45";
const result = countDigits(input);
const res2 = countDigitsSpread(input);

console.log(`Input: ${input}`);
console.log(`Number of digits: ${result}`);
console.log(`Number of digits: ${res2}`);
console.log(`Number of letters: ${countLetters(input)}`);
console.log(`Number of uppercase letters: ${countUppercase(input)}`);
console.log(`Number of uppercase letters: ${countUppercase(input2)}`);
