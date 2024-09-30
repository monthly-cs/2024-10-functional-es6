// Higher Order Functions

/**
 * example 1:
 * 기본적인 고차 함수 예제
 */
const sayHello = () => console.log("Hello!");
const executeFunction = (fn) => fn();
// executeFunction(sayHello); // Hello!

/**
 * example 2:
 * 함수를 인자로 받아서 실행하는 함수
 */
const numberTen = 10;
const apply = (fn) => fn(numberTen); // 함수 fn에 numberTen 값을 전달하여 실행
const add10 = (a) => a + 10;
const addSmile = (a) => a + "😀";

// console.log(apply(add10)); // 20
// console.log(apply(addSmile)); // 10😀
// console.log(apply((a) => a + 1)); // 11

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
// times((i) => console.log(i + 1), 5);
// times((i) => console.log("⭐️".repeat(i + 1)), 5);

/**
 * example 4:
 * 함수를 리턴하는 함수 (클로저)
 */
const addMaker = (a) => (b) => a + b; // // 매개변수 a를 기억하고, b를 더하는 함수 리턴
const add20 = addMaker(20);
console.log(add20); // addMaker에서 리턴된 함수, 즉 (b) => a + b
console.log(add20(10)); // 30

// addMaker와 클로저
// - addMaker의 실행이 종료되고, 리턴된 함수가 실행되더라도 addMaker의 변수 a는 유지된다.
// - addMaker가 종료된 후에도 a에 접근할 수 있고, 리턴된 함수가 호출될 때 a를 사용할 수 있는 이유는 클로저 때문이다.
// - 정의될 때의 렉시컬 환경(실행 당시 변수, 매개변수, 함수)을 기억하고, 외부 함수 스코프에 있는 변수에 접근할 수 있는 것.

// 만약 클로저가 없다면? addMaker의 실행이 종료되면 a는 사라지고, 리턴된 함수는 a에 접근할 수 없다.

// 또는 아예 c변수를 만들어 메모리에 a의 값을 지속적으로 유지하는 클로저
// const addMaker = (a) => {
//   let c = a;
//   return (b) => {
//     c += b;
//     return c;
//   };
// };
