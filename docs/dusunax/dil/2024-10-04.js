const arr = [1, 2, 3];

/**
 * [Symbol.iterator]() { return this; }
 *
 * 함수 내에서 this 키워드를 사용하여 순회 가능 객체의 속성에 접근할 수 있다.
 * 함수를 실행하기 위해서 arr context가 필요
 * arr object에 바인딩된 Symbol.iterator 함수를 반환한다.
 * 또는 아래 2️⃣와 같이 Symbol.iterator 함수를 직접 호출할 수 있다.
 * */
const iteratorSymbol = arr[Symbol.iterator].bind(this); // 1️⃣

const iterator = arr[Symbol.iterator](); // 2️⃣
// const iterator = iteratorSymbol();

console.log("Symbol.iterator:");
console.log("[Symbol.iterator] 👉", iteratorSymbol);
console.log("IterableIterator 👉", iterator);
console.log("return 👉", iterator.next()); // { value: 1, done: false }

// 규약에 맞게 선택적으로 구현할 수 있다.
// https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Iteration_protocols#returnvalue
// console.log(iterator.return());
// console.log(iterator.throw());

// -------------------------------------------------------------------
/**
 * MapIterator
 */
console.log("\nMapIterator:");
const map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);
const mapIterator = map[Symbol.iterator]();
mapIterator.next(); // { value: ["a", 1], done: false }
for (const a of mapIterator) console.log(a); // ["b", 2] ["c", 3] (key, value)

const mapKeys = map.keys(); // MapIterator { "a", "b", "c" }
console.log(mapKeys); // value의 key만 반환

const mapValues = map.values(); // MapIterator { 1, 2, 3 }
console.log(mapValues); // value만 반환

const mapEntries = map.entries();
// 브라우저: MapIterator {'a' => 1, 'b' => 2, 'c' => 3}
// Node.js: [Map Entries] { [ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ] }
// 디버깅 도구가 객체를 시각화하는 방식에 차이가 있음
console.log(mapEntries); // key, value 반환

// Symbol.iterator는 다시 Symbol.iterator를 반환한다. (자기 자신)

// -------------------------------------------------------------------

/**
 * 커스텀 이터러블
 *
 * [Symbol.iterator]를 구현한 객체 = 이터러블
 * - symbol.iterator는 next() 메서드를 가지고 있는 객체를 반환한다.
 * - next() 메서드는 value와 done 속성을 가진 객체를 반환한다.
 */
const customIterable = {
  [Symbol.iterator]() {
    let i = 3;
    return {
      next() {
        return i == 0 ? { done: true } : { value: i--, done: false };
      },
      // 자기 자신을 return, well-formed iterator
      // iterable protocol을 준수하는 iterator는 자기 자신을 반환해야 한다.
      // iterator도 iterable이다.
      [Symbol.iterator]() {
        return this;
      },
    };
  },
};
let customIterator = customIterable[Symbol.iterator]();

console.log("\nCustom iterator:");
for (const a of customIterator) console.log(a); // 3 2 1

console.log(customIterator[Symbol.iterator]().next()); // { value: 3, done: false }
console.log(customIterator[Symbol.iterator]().next()); // { value: 2, done: false }
console.log(customIterator[Symbol.iterator]().next()); // { value: 1, done: false }
console.log(customIterator[Symbol.iterator]().next()); // { done: true }

for (const a of customIterator) console.log(a); // 아무것도 출력되지 않는다.

// -------------------------------------------------------------------
// DOM
// console.log("\nDOM iterator:");
// const all = document?.querySelectorAll("*")[Symbol.iterator]();
// console.log(all.next()); // { value: html, done: false }
// console.log(all.next()); // { value: head, done: false }
// console.log(all.next()); // { value: meta, done: false } ...

// -------------------------------------------------------------------
// spread operator
console.log("\nSpread operator:");
const a = [1, 2];
console.log([...a]); // [1, 2]

// a[Symbol.iterator] = null;
// console.log([...a]); // TypeError: a is not iterable
