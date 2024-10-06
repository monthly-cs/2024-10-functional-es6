// 제너레이터 예시

function* gen() {
  /**
   * yield
   * - 값 반환: 제너레이터 함수의 실행을 일시 중지하고, 특정 값을 호출자에게 반환
   * - 상태 저장: 제너레이트 함수는 yield를 만날 때 까지 실행되며, 그 지점에서 일시 중지되어 상태를 저장
   *      그 이후 next() 메서드를 호출하면 저장된 상태부터 다시 실행
   * */
  yield 1;
  if (false) yield 2;
  yield 3;
}

let iter = gen();
console.log(iter[Symbol.iterator]() == iter); // true
console.log(iter.next());
console.log(iter.next());
console.log(iter.next()); // 더 이상 yield가 없기 때문에 제너레이터 함수가 완료되고, done은 true가 console.error('된다',된다)

console.log(iter);
for (const a of gen()) console.log(a);

function* infinity(i = 0) {
  while (true) yield i++;
}

// 기본적인 odd 제너레이터 (순회하는 값)
// function *odds(l) {
//     for (let i = 0; i < l; i++) {
//       if (i % 2) yield i;
//     }
// }

// limit을 이용한 odd 제너레이터
function* odds(l) {
  for (const a of infinity(1)) {
    if (a % 2) yield a;
    if (a === l) return;
  }
}

/**
 * limit
 * - 제너레이터를 받아서 l까지만 순회하도록 제한
 * */
function* limit(l, iter) {
  for (const a of iter) {
    yield a;
    if (a === l) return;
  }
}

function* odds(l) {
  for (const a of limit(l, infinity(1))) {
    if (a % 2) yield a;
  }
}

let iter2 = odds(10);

console.log("여기", odds(10));

console.log(iter2.next());
console.log(iter2.next());
console.log(iter2.next());

// for (const a of odds(40)) console.log(a); // 1~40까지의 홀수 출력

// 전개 연산자, 구조 분해, 나머지 연산자 예시
console.log(...odds(10));
// log([...odds(10), ...odds(20)]);

// log(...odds(5)) // 1 3 5

// const [head, ...tail] = odds(5);
// log(head); // 1
// log(tail); // [3, 5]

// const [a, b, ...rest] = odds(10);
// log(a); // 1
// log(b); // 3
// log(rest); // [5, 7, 9]

// 함수형 프로래밍에서는 인자와 리턴값으로 소통하는 것을 권장함
// 보조함수를 전달하여 사용
const map = (f, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(f(a));
  }
  return res;
};

// document.querySelectorAll('*').map(el => el.nodeName); // Error
// console.log(document.querySelectorAll('*').map); // undefined => 순회 가능할 것 같으나 map 메서드가 없음

// array를 상속받은게 아니기 때문에 map 함수가 없음
const it = document.querySelectorAll("*")[Symbol.iterator]();
console.log(it); // ArrayIterator{}

/**
 * document.querySelectorAll('*')는 이터러블 프로토콜을 따르고 있고,
 * 위에서 생성한 map 함수는 이터러블 프로토콜을 따르는 for-of 구문을 사용하기 때문에 순회 가능
 */
log(map((el) => el.nodeName, document.querySelectorAll("*"))); // ['HTML', 'HEAD', 'META', ...]
// log(it.next());
// log(it.next());
// log(it.next());
// log(it.next());
// log(it.next());

// 모든 형태가 map이 가능해짐
function* gen() {
  yield 2;
  if (false) yield 3;
  yield 4;
}

log(map((a) => a * a, gen())); // [4, 16]

// key,value 쌍을 표현함
let m = new Map();
m.set("a", 10);
m.set("b", 20);
console.log(m); // Map { 'a' => 10, 'b' => 20 } -> map의 기본 형태

for (const a of m) log(a); // 2 3

log(new Map(map(([k, a]) => [k, a * 2], m))); // Map { 'a' => 20, 'b' => 40 } => 값에 2를 곱하게 됨

const filter = (f, iter) => {
  let res = [];
  for (const a of iter) {
    if (f(a)) res.push(a);
  }
  return res;
};

// let under20000 = [];
// for (const p of products) {
//   if (p.price < 20000) under20000.push(p);
// }
// log(...under20000);

log(...filter((p) => p.price < 20000, products));

// let over20000 = [];
// for (const p of products) {
//   if (p.price >= 20000) over20000.push(p);
// }
// log(...over20000);

log(...filter((p) => p.price >= 20000, products));

log(filter((n) => n % 2, [1, 2, 3, 4])); // [1, 3]

log(
  filter(
    (n) => n % 2,
    (function* () {
      yield 1;
      yield 2;
      yield 3;
      yield 4;
      yield 5;
    })()
  )
); // [1, 3, 5]

// 순회하면서 하나의 값으로 도출할 때 주로 사용
// const nums = [1, 2, 3, 4, 5];

// let total = 0;
// for (const n of nums) {
//   total = total + n;
// }
// log(total);

const reduce = (f, acc, iter) => {
  if (!iter) {
    iter = acc[Symbol.iterator]();
    // 1번째 값으로 초기화
    acc = iter.next().value;
  }
  // 누적값이 acc에 저장되고 있음
  for (const a of iter) {
    acc = f(acc, a);
  }
  return acc;
};

const add = (a, b) => a + b;

// log(reduce(add, 0, [1, 2, 3, 4, 5]));
// // 15

// log(add(add(add(add(add(0, 1), 2), 3), 4), 5));
// // 15

log(reduce(add, [1, 2, 3, 4, 5]));
/*
  f는 add 함수입니다.
acc는 [1, 2, 3, 4, 5] 배열입니다.
iter는 전달되지 않았으므로 undefined입니다.
  */
