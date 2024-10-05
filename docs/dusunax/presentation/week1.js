// #2. 일급 함수
/**
 * example 1:
 * 기본적인 고차 함수 예제
 */
const sayHello = () => console.log("Hello!");
const executeFunction = (fn) => fn();
executeFunction(sayHello); // Hello!

// #3. 고차 함수
/**
 * example 2:
 * 함수를 인자로 받아서 실행하는 함수
 */
const num = 10;
const apply = (fn) => fn(num);
// 함수 fn에 num 값을 전달하여 실행
const add10 = (a) => a + 10;
const addSmile = (a) => a + "😀";

/**
 * example 3:
 * applicative function
 * 함수와 값을 받아서, 내부에서 인자를 적용해 여러 번 실행하는 함수
 */
const times = (fn, n) => {
  for (let i = 0; i < n; i++) {
    fn(i);
  }
};

/**
 * example 4:
 * 함수를 리턴하는 함수 (클로저)
 */
const addMaker = (a) => (b) => a + b;
// 매개변수 a를 기억하고, b를 더하는 함수 리턴
const add20 = addMaker(20);

console.log(add20); // (b) => 20 + b
console.log(add20(10)); // 30

// #4. 이터러블과 이터레이터
const arr = [1, 2, 3];
const iter = arr[Symbol.iterator]();
console.log(iter.next());
// { value: 1, done: false }

// arr[Symbol.iterator] = null;
// console.log(iter.next()); // 1️⃣
// for (const num of arr) console.log(num); // 2️⃣

// #5. 이터레이터의 동작
// [Symbol.iterator]() { return this; }
const iteratorSymbol = arr[Symbol.iterator].bind(this); // 1️⃣
const iterator = arr[Symbol.iterator](); // 2️⃣

const newMap = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);
const mapIterator = newMap[Symbol.iterator]();
mapIterator.next(); // { value: ["a", 1], done: false }
for (const a of mapIterator) console.log(a);
// ["b", 2] ["c", 3] (key, value)

newMap.keys(); // MapIterator { "a", "b", "c" }
newMap.values(); // MapIterator { 1, 2, 3 }
newMap.entries(); // MapIterator {'a' => 1, 'b' => 2, 'c' => 3}

// #6. 제너레이터
const customIterable = {
  [Symbol.iterator]() {
    let i = 1;
    return {
      next() {
        return i == 3 ? { done: true } : { value: i++, done: false };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  },
};
let wellFormIterator = customIterable[Symbol.iterator]();

function* generator() {
  yield 1;
  yield 2;
  yield 3;
  return "🥹";
}
const iterGenerated = generator();

// #7. 전개 연산자와 이터러블

function* infinity(i = 0) {
  while (true) yield i++;
}

function* limit(l, iter) {
  for (const value of iter) {
    yield value;
    if (value === l) return;
  }
}

function* odds(l) {
  for (const value of limit(l, infinity(1))) {
    if (value % 2) yield value;
  }
}

for (const value of odds(10)) {
  console.log(value); // 1 3 5 7 9
}

// Spread operator
console.log(...odds(5)); // 1 3 5
console.log([...odds(1), ...odds(10)]);
// [1, 1, 3, 5, 7, 9]

// Destructuring
const [head, ...tail] = odds(10);
console.log(head); // 1
console.log(tail); // [3, 5, 7, 9]

// Rest parameter
const [a, b, ...rest] = odds(10);
console.log(a); // 1
console.log(b); // 3
console.log(rest); // [5, 7, 9]

// #8. 다형성과 함수형 프로그래밍

const map = (f, iter) => {
  let res = []; // 순수함수
  for (const value of iter) {
    res.push(f(value));
    // 어떤 값을 수집할지 콜백함수에게 완전히 위임
  }
  return res;
};

console.log(map((a) => a + "⭐️", odds(5)));
// ["1⭐️", "3⭐️", "5⭐️"]

const m = new Map();
m.set("점심", "🥩");
m.set("저녁", "🥔");
console.log(map(([k, v]) => [k, v + " 조림"], m));
// [["점심", "🥩 조림"], ["저녁", "🥔 조림"]]

// #9. 함수형 프로그래밍의 패턴들
const filter = (f, iter) => {
  let res = [];
  for (const value of iter) {
    if (f(value)) res.push(value);
  }
  return res;
};

const reduce = (f, acc, iter) => {
  if (!iter) {
    iter = acc[Symbol.iterator]();
    // 3번째 인자가 없으면 (initialValue가 없으면)
    // iter에 acc의 이터레이터를 할당
    acc = iter.next().value; // 1번째 값
  }
  for (const value of iter) {
    acc = f(acc, value);
    // callback 함수는 acc와 value를 받아서
    // acc에 누적된 값을 반환한다.
  }
  return acc;
};

// 함수형 사고
const menu = [
  { name: "랍스터 마라 크림 짬뽕", price: 42000 },
  { name: "캐비아 모둠전", price: 26000 },
  { name: "마라 크림 새우 딤섬", price: 24000 },
  { name: "대통령 명장 텐동", price: 22000 },
];
console.log(
  "가격만 뽑아낸 배열",
  map((p) => p.price, menu)
); // [42000, 26000, 24000, 22000]
console.log(
  "가격이 25000 이상인 제품의 가격을 모두 더한 값",
  reduce(
    add,
    filter(
      (p) => p > 25000, // [42000, 26000, 24000, 22000]
      newMap((p) => p.price, menu) // [42000, 26000]
    )
  )
); // 68000
