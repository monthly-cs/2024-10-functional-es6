// `for...of` with Array, Set, and Map

/**
 * 1. for...of with an Array
 */
console.log("Iterating through Array:");
const array = [1, 2, 3];
for (const value of array) console.log(value);

/**
 * 2. for...of with a Set
 */
console.log("\nIterating through Set:");
const set = new Set([1, 2, 3]);
for (const value of set) console.log(value);

/**
 * 3. for...of with a Map
 */
console.log("\nIterating through Map (keys and values):");
const map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);
for (const a of map) console.log(a);
for (const [key, value] of map) console.log(`Key: ${key}, Value: ${value}`);
