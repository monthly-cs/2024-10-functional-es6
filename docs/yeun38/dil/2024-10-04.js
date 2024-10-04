// 일급 예시

const a = 10;
const add10 = (a) => a + 10;

console.log(add10(3));

// 일급은 함수의 결과로 사용될 수 있다

const f1 = () => () => 1;
const f2 = f1();
console.log(f2);
console.log(f2());

// 고차 함수 예시
// (1) 함수를 인자로 받아서 실행하는 함수
const apply1 = (f) => f(1);
const add2 = (a) => a + 2;

console.log(apply1(add2));

// (2) 함수를 만들어 리턴하는 함수
const addMaker = (a) => (b) => a + b;
const add5 = addMaker(5);

console.log(add5(2));

// 이터러블/이터레이터 프로토콜
const arr2 = [1, 2, 3];
let iter2 = arr2[Symbol.iterator]();
iter2.next();

const iterable = {
  [Symbol.iterator]() {
    let i = 3;
    return {
      next() {
        return i == 0 ? { done: true } : { value: i--, done: false };
      },
      // 자기 자신 또한 이터러블이면서 자기 자신을 return하도록
      [Symbol.iterator]() {
        return this;
      },
    };
  },
};
let iterator = iterable[Symbol.iterator]();
iterator.next();
