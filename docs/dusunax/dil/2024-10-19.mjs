import { pipe, go, curry, take, L, log, flatten, range, find } from "./fx.mjs";

// ------------------------------------------------------------
// map
log("\nMap:");
L.map = curry(function* (f, iter) {
  iter = iter[Symbol.iterator]();
  let cur;
  while (!(cur = iter.next()).done) {
    // 이테레이션이 종료(이터레이터의 반환값 done이 true가됨) 되기 전까지 루프
    console.log(cur);

    const v = cur.value;
    yield go(v, f);
  }
});

/**
 * 위 L.map과 동일
 * L.map = curry(function* (f, iter) {
 *   for (const a of iter) {
 *     yield go(a, f);
 *   }
 * });
 */

const map = curry(pipe(L.map, take(Infinity)));

const add1 = (a) => a + 1;
map(log, [1, 2, 3, 4]);
log(map(add1, [1, 2, 3, 4]));
map(add1, [1, 2, 3, 4]).map(log);

// ------------------------------------------------------------
// filter
log("\nFilter:");
L.filter = curry(function* (f, iter) {
  iter = iter[Symbol.iterator]();
  let cur;
  while (!(cur = iter.next()).done) {
    const v = cur.value;
    if (f(v)) yield v;
  }
});

/**
 * 위 L.filter와 동일
 * L.filter = curry(function* (f, iter) {
 *   for (const a of iter) {
 *     if (f(a)) yield a;
 *   }
 * });
 */

// ------------------------------------------------------------
// flatten, L.flatten
log("\nFlatten:");
const isIterable = (a) => a && a[Symbol.iterator]; // null이나 undefined가 아니고 이터레이터 프로토콜을 따르는 값이면 true

L.flatten = function* (iter) {
  for (const a of iter) {
    if (isIterable(a)) for (const b of a) yield b; // 이터러블이면 이터러블 다시 순회하면서 yield 
    else yield a;
  }
};

const it = L.flatten([1, 2, [3, 4], 5]);
log(it.next()); // { value: 1, done: false }
log(it.next()); // { value: 2, done: false }
log(it.next()); // { value: 3, done: false }
log(it.next()); // { value: 4, done: false }
log(it.next()); // { value: 5, done: false }
log(it.next()); // { value: undefined, done: true }

// 즉, log(...it)는 값 1, 2, 3, 4, 5를 출력함. 
// 즉, 이터레이터를 사용해 배열의 depth를 펼칠 수 있다(flatten) 

// 지연 평가 실행 방법: for...of 루프, 전개 연산자(...), take 함수
// 이터레이터를 소비하며 지연 평가를 실행

/**
 * 위 L.flatten과 동일
 * L.flatten = function* (iter) {
 *   for (const a of iter) {
 *     if (isIterable(a)) yield* a;
 *     else yield a;
 *   }
 * };
*/

L.deepFlat = function* f(iter) {
  for (const a of iter) {
    if (isIterable(a)) yield* f(a);
    else yield a;
  }
};
log([...L.deepFlat([1, [2, [3, 4], 5]])]);

// ------------------------------------------------------------
// flatMap
log("\nFlatMap:");
log([...flatten([1, 2, [3, 4], 5]).map(a => a * a)]); // 평탄화와 맵핑을 따로 진행, 약간의 비효울 O(n), 그런데 O(2n)을 곁들인
log([1, 2, [3, 4], 5].flatMap(a => Array.isArray(a) ? a.map(b => b * b) : a * a)); // ES6 flatMap은 O(n) 하지만 어차피 전부 순회하기 떄문에, 위와 시간복잡도의 차이는 없다.

L.flatMap = curry(pipe(L.map, L.flatten)); // 지연 평가 flatMap
const takeAll = take(Infinity); // 즉시 평가 flatMap
const flatMap = curry(pipe(L.map, L.flatten, takeAll));
/**
 * 위 flatMap과 동일
 * flatMap = curry(pipe(L.map, flatten));
 */

// const it2 = L.flatMap((a) => a, [1, 2, [3, 4], 5]);
// log([...it2]);
// log(it2.next()); // { value: 1, done: false }
// log(it2.next()); // { value: 4, done: false }
// log(it2.next()); // { value: 9, done: false }
// log(it2.next()); // { value: 16, done: false }
// log(it2.next()); // { value: 25, done: false }
// log(L.flatMap((a) => a, [1, 2, [3, 4], 5]));


// ------------------------------------------------------------
const users = [
  { name: "a", age: 21, family: [{ name: "a1", age: 53 }, { name: "a2", age: 52 }] },
  { name: "b", age: 22, family: [{ name: "b1", age: 15 }] },
  { name: "c", age: 23, family: [{ name: "c1", age: 17 }, { name: "c2", age: 56 }] },
];

go(
  users,
  L.flatMap((user) => user.family),
  L.filter((person) => person.age > 20),
  L.map((person) => person.name),
  take(2),
  log
);

// ------------------------------------------------------------
// Promise를 값으로 다루기
const go1 = (a, f) => f(a)
log(go1(Promise.resolve(1), (a) => a + 1)); // [object Promise]1

const go1Resolve = (a, f) => a instanceof Promise ? a.then(f) : f(a);
const result = go1Resolve(Promise.resolve(1), a => a + 1); // Promise {<pending>}
result.then(log); // 2

go1Resolve(Promise.resolve(1), a => a + 1).then(log) // 지속적인 연결

// ------------------------------------------------------------
// Kleisli Composition
const userList = [
  {id: 1, name: "a", age: 21},
  {id: 2, name: "b", age: 22},
  {id: 3, name: "c", age: 23},
];
// const getUserById = id => find(user => user.id === id) || Promise.reject(new Error(`User id: ${id} not found`));
// getUserById(2).then(log).catch(log);


// 비동기 함수 예시
const fetchUserById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
      ];

      const user = users.find((u) => u.id === id);
      if (user) {
        resolve(user); // 성공 시 유저 데이터 반환
      } else {
        reject(new Error("User not found")); // 실패 시 오류 반환
      }
    }, 1000);
  });
};

// 유저 이름을 출력하는 함수
const printUserName = (user) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`User Name: ${user.name}`);
      resolve(user.name);
    }, 500);
  });
};

// 🤔 Kleisli Composition을 사용하여 비동기 함수 합성
const getUserNameById =  (id) => {
  return fetchUserById(id) // 반환값 Promise
    .then(printUserName) // resolve된 값을 받아 실행
    .catch((error) => { // reject된 값을 받아 실행
      console.error(error.message);
      return null; // 오류 없이 빈 값 반환
    });
};

// 성공 시
getUserNameById(2); // "User Name: Bob"

// 실패 시 (없는 유저)
getUserNameById(5); // "User not found"


// ------------------------------------------------------------
// go, pipe, reduce
const reduce = curry((f, acc, iter) => {
  if (!iter) {
    iter = acc[Symbol.iterator]();
    acc = iter.next().value;
  } else {
    iter = iter[Symbol.iterator]();
  }
  return function recur() { 
    let cur;
    while (!(cur = iter.next()).done) {
      const a = cur.value;
      acc = f(acc, a);
      if(acc instanceof Promise) return acc.then(recur); // promise를 만났을 때, 유명함수 재귀하도록 작성
    }
    return acc;
  }
});