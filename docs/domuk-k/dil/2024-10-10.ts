// join은 "시퀀스를 연결시켜 하나의 값으로 만드는 연산"이라고 하자.
// Array.prototype.join은 어떤 타입의 데이터에 자신의 연산을 수행할 수 있지?

// 먼저 순회할만한 데이터 타입들을 보자
const iterable_string: string = 'apple'; // Iterable<string>
const iterable_array: Array<number> = [1, 2, 3]; // Iterable<number>
const array_like: ArrayLike<string> = {
  0: 'ar',
  1: 'ray',
  2: 'li',
  3: 'ke',
  length: 4,
};
const iterable_custom: Iterable<number> = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return { value: i++, done: i > 10 };
      },
    };
  },
};
const iterable_map = new Map([
  // Iterable<[string, number]>
  ['a', 1],
  ['b', 2],
  ['c', 3],
]);
const iterable_set = new Set(['a', 'b', 'c']); // Iterable<string>
const iterable_arguments = (function (..._: string[]) {
  return arguments;
})('a', 'r', 'g', 's'); // Iterable<string>
const iterable_generator = (function* () {
  //  Generator<1 | 2 | 3, void, unknown> or Iterable<number>
  yield 1;
  yield 2;
  yield 3;
})();

const join_string = Array.prototype.join.bind(iterable_string);
const join_array = Array.prototype.join.bind(iterable_array);
const join_array_like = Array.prototype.join.bind(array_like);
const join_custom = Array.prototype.join.bind(iterable_custom);
const join_map = Array.prototype.join.bind(iterable_map);
const join_set = Array.prototype.join.bind(iterable_set);
const join_arguments = Array.prototype.join.bind(iterable_arguments);
const join_generator = Array.prototype.join.bind(iterable_generator);

console.log('string: ', join_string('-')); // string:  a-p-p-l-e
console.log('array: ', join_array('-')); // array:  1-2-3
console.log('array_like: ', join_array_like('-')); // array_like:  ar-ray-li-ke
console.log('custom: ', join_custom('-')); // custom:
console.log('map: ', join_map('-')); // map:
console.log('set: ', join_set('-')); // set:
console.log('arguments: ', join_arguments('-')); // arguments:  a-r-g-s
console.log('generator: ', join_generator('-')); // generator:

// join imple by its specification
// Array.prototype.pseudoJoin = function () {
//   let result = '';
//   for (let i = 0; i < this.length; i++) {
//     result += this[i];
//   }
//   return result;
// };

const reduce = <T, U>(
  callback: (acc: U, cur: T) => U,
  iterable: Iterable<T>,
  initialValue?: U
) => {
  let acc: U | undefined = initialValue;

  for (const cur of iterable) {
    if (!acc) {
      acc = cur as unknown as U;
    } else {
      acc = callback(acc, cur);
    }
  }
  return acc as U;
};

const join = <T>(sep = ',', iter: Iterable<T>) =>
  reduce<T, string>((acc, cur) => `${acc}${sep}${cur}`, iter);

console.log('join_string: ', join('-', iterable_string));
console.log('join_array: ', join('-', iterable_array));
// console.log('join_array_like: ', join('-', array_like)); // TypeError: iter is not iterable
console.log('join_custom: ', join('-', iterable_custom));
console.log('join_map: ', join('-', iterable_map));
console.log('join_set: ', join('-', iterable_set));
console.log('join_arguments: ', join('-', iterable_arguments));
console.log('join_generator: ', join('-', iterable_generator));
