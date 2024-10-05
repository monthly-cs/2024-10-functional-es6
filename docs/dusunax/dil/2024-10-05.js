// ES6+
/**
 * 제너레이터 Generator와 이터레이터 Iterator
 * - 순회할 수 있는 데이터를 만든다.
 */
function* generator() {
  yield 1;
  yield 2;
  yield 3;
  return "🥹";
}
const iter = generator();

console.log("Generator:");
console.log("generator", generator); // generator: [GeneratorFunction: generator]
console.log(iter.next()); // { value: 1, done: false }
console.log(iter.next()); // { value: 2, done: false }
console.log(iter.next()); // { value: 3, done: false }
console.log(iter.next()); // { value: "🥹", done: true }

for (const value of generator()) {
  console.log(value); // 1 2 3 (🥹는 출력되지 않음)
}

/**
 * Odds
 * - l(limit)까지의 홀수를 만든다.
 * - 값의 발생을 제어할 수 있다.
 */
console.log("\nOdds:");
function* odds(l) {
  for (let i = 0; i < l; i++) {
    if (i % 2) yield i;
  }
}
for (const value of odds(10)) {
  console.log(value); // 1 3 5 7 9
}

/**
 * Infinity
 * - 무한한 수열을 만든다. 값의 시퀀스를 생성
 * - yeild는 값을 반환하고 함수를 일시 중단한다.
 * - iterator의 next()를 평가할 때마다 값이 1씩 증가
 */
console.log("\nInfinity:");
function* infinity(i = 0) {
  while (true) yield i++;
}
const iter2 = infinity();
console.log(iter2.next()); // { value: 0, done: false }
console.log(iter2.next()); // { value: 1, done: false } ...

/** Generator를 합쳐서 사용 */
console.log("\nInfinity in Odds:");
function* oddsCombination(l) {
  // for (const value of infinity(1)) {
  //   if (value % 2) yield value;
  //   if (value === l) return;
  // }
  for (const value of limit(l, infinity(1))) {
    if (value % 2) yield value;
  }
}
function* limit(l, iter) {
  // limit와 iterable을 받아서 limit까지만 값을 반환
  for (const value of iter) {
    yield value;
    if (value === l) return;
  }
}
for (const value of oddsCombination(10)) {
  console.log(value); // 1 3 5 7 9
}
// -------------------------------------------------------------------
/**
 * Spread 연산자, Destructuring, Rest 파라미터
 */
console.log("\nSpread Operator, Destructuring, Rest Parameter:");

// spread
console.log(...oddsCombination(5)); // 1 3 5
console.log([...oddsCombination(5), ...oddsCombination(10)]); // [1, 3, 5, 1, 3, 5, 7, 9]

// destructuring
const [head, ...tail] = oddsCombination(10);
console.log(head); // 1
console.log(tail); // [3, 5, 7, 9]

// rest parameter
const [a, b, ...rest] = oddsCombination(10);
console.log(a); // 1
console.log(b); // 3
console.log(rest); // [5, 7, 9]

// -------------------------------------------------------------------
const products = [
  { name: "반팔티", price: 15000 },
  { name: "긴팔티", price: 20000 },
  { name: "핸드폰케이스", price: 15000 },
  { name: "후드티", price: 30000 },
  { name: "바지", price: 25000 },
];

/**
 * Map
 */
const map = (f, iter) => {
  let res = []; // 함수형 프로그래밍에서는 인자와 리턴값을 가지고 소통, 외부의 상태를 변경하지 않는 것을 권장
  // 부수효과를 일으키지 않고 순수함수로 만들어야 한다.

  for (const value of iter) {
    res.push(f(value)); // 어떤 값을 수집할지 콜백함수에게 완전히 위임
  }
  return res;
};
console.log("\nMap:");
console.log(map((a) => a.name, products)); // ["반팔티", "긴팔티", "핸드폰케이스", "후드티", "바지"]

/**
 * 다형성
 * - iterable 프로토콜을 따르는 모든 값에 대해 상단에 작성한 map 함수를 사용할 수 있다.
 * - generator 함수의 결과물도 iterable 프로토콜을 따르므로 map을 사용할 수 있다.
 * - web API인 document.querySelectorAll()의 결과물도 iterable 프로토콜을 따르므로 map을 사용할 수 있다.
 * - 외부 헬퍼 함수들과 조합하여 유연하고 다형성이 높은 코드를 작성할 수 있다.
 */
// const doms = document.querySelectorAll("*");
// console.log(map((node) => node.nodeName, doms)); // ["HTML", "HEAD", "META", ...]

console.log("\nMap with Generator:");
console.log(map((a) => a + "🤹‍♀️", oddsCombination(5))); // ["1🤹‍♀️", "3🤹‍♀️", "5🤹‍♀️"]

console.log("\nMap with Map:");
const m = new Map();
m.set("a", 10);
m.set("b", 20);
console.log(map(([k, v]) => [k, v + "🔥"], m)); // [["a", "10🔥"], ["b", "20🔥"]]

// -------------------------------------------------------------------
/**
 * Filter
 */
let under20000 = [];
for (const p of products) {
  if (p.price < 20000) under20000.push(p);
}
console.log("\nFilter:");
console.log(...under20000); // { name: "반팔티", price: 15000 }, { name: "핸드폰케이스", price: 15000 }

const filter = (f, iter) => {
  let res = [];
  for (const value of iter) {
    if (f(value)) res.push(value);
    // 조건을 만족하는 값만 수집
    // 조건은 외부에서 주입받는다. (다형성)
  }
  return res;
};
console.log(filter((a) => a.price < 20000, products)); // [{ name: "반팔티", price: 15000 }, { name: "핸드폰케이스", price: 15000 }]

console.log(filter((a) => a % 3 === 0, oddsCombination(10))); // [3, 9]
console.log(
  filter(
    (a) => a % 2,
    (function* () {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    })()
  )
); // [1, 3, 5]

// -------------------------------------------------------------------
/**
 * Reduce
 * - 값을 축약하는 함수
 */
const nums = [1, 2, 3, 4, 5];

// 명령형 프로그래밍 ver, Imperative Programming
let total = 0;
for (const n of nums) {
  total += n;
}

// 함수형 프로그래밍 ver, Functional Programming
console.log("\nReduce:");
const add = (a, b) => a + b;

console.log(nums.reduce(add, 0)); // 15
console.log(nums.reduce(add)); // 15, initialValue가 없으면 iterable의 첫번째 값이 initialValue가 된다.

/**
 * Reduce의 기본 동작
 *
 * nums.reduce(add, 0);
 * - reduce(add(add(add(add(add(0, 1), 2), 3), 4), 5);
 * - 하나의 값으로 축약(누적), 재귀적으로 동작
 *
 * nums.reduce(add);
 * - reduce(add(add(add(add(1, 2), 3), 4), 5);
 * - initialValue가 없으면 iterable의 첫번째 값이 initialValue가 된다.
 */
const reduce = (f, acc, iter) => {
  if (!iter) {
    iter = acc[Symbol.iterator](); // 3번째 인자가 없으면 (initialValue가 없으면) iter에 acc의 이터레이터를 할당
    acc = iter.next().value; // 1번째 값
  }
  for (const value of iter) {
    acc = f(acc, value);
    // callback 함수는 acc와 value를 받아서 acc에 누적된 값을 반환한다.
  }
  return acc;
};
console.log(reduce(add, 0, nums)); // 15

/**
 * Reduce와 다형성
 * - iterable 프로토콜을 따르는 모든 값에 대해 상단에 작성한 reduce 함수를 사용할 수 있다.
 */
console.log("\nReduce with Map:");
console.log(
  reduce((totalPrice, product) => totalPrice + product.price, 0, products)
); // 105000

// -------------------------------------------------------------------
/**
 * Map, Filter, Reduce 중첩 사용과 함수형 사고
 */
console.log("\nMap, Filter, Reduce:");
console.log(
  "가격만 뽑아낸 배열",
  map((p) => p.price, products)
); // [15000, 20000, 15000, 30000, 25000]
console.log(
  "가격이 20000 미만인 제품의 가격만 뽑아낸 배열",
  map(
    (p) => p.price,
    filter((p) => p.price < 20000, products)
  )
); // [15000, 15000]
console.log(
  "가격이 20000 미만인 제품의 가격을 모두 더한 값",
  reduce(
    add,
    map(
      (p) => p.price, // [15000, 20000, 15000, 30000, 25000]
      filter((p) => p.price < 20000, products) // [15000, 15000]
    )
  ),
  reduce(
    add,
    filter(
      (p) => p < 20000, // [15000, 15000]
      map((p) => p.price, products) // [15000, 20000, 15000, 30000, 25000]
    )
  )
); // 30000 30000
