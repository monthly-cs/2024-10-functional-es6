const myMap = <T, U>(callbackFn: (item: T) => U, arr: Iterable<T>): U[] => {
  const result: U[] = [];
  for (const item of arr) {
    result.push(callbackFn(item));
  }
  return result;
};

myMap((x) => x + 'w', [1, 2, 3]); // <T, U>(callbackFn: (item: T) => U, arr: T[]) => U[]

const map = new Map([[1, 'hej']]);
myMap(([key, value]) => key + value, map); // <[number, number], number>(callbackFn: (item: [number, number]) => number, arr: Iterable<[number, number]>) => number[]

const set = new Set([1, 2, 3]);
myMap((x) => false, set); // <number, boolean>(callbackFn: (item: number) => boolean, arr: Iterable<number>) => boolean[]

/**
 * Array.prototype.map을 myMap이랑 비슷하게 사용하려면
 */

type ManuallyTypedMyMapFromPrototype = <T, U, ThisArg>(
  arr: Iterable<T>,
  callbackFn: (this: ThisArg, value: T, index: number, array: Iterable<T>) => U,
  thisArg?: ThisArg
) => U[];
// call.bind를 통해 일반 함수로 호출시 call의 this binding 추가
const mymapFromPrototype: ManuallyTypedMyMapFromPrototype =
  Array.prototype.map.call.bind(Array.prototype.map);

mymapFromPrototype([7, 6, 5], (x) => x * 2); // number[]
mymapFromPrototype(
  [7, 6, 5],
  function (x) {
    return x * this.multipler; /* this : { multipler: number }*/
  },
  { multipler: 2 }
); // number[] (14,12,10)

mymapFromPrototype(new Set([1, 2, 3]), (x) => x * 2); // number[]

/**
 * myReduce
 */

function myReduce(
  callbackFn: (acc: number, cur: number) => number,
  arr: Iterable<number>
): number;
function myReduce<T, U>(
  callbackFn: (acc: U, cur: T) => U,
  initialValue: U,
  arr?: Iterable<T>
) {
  if (!arr) {
    // then initialValue is iterable, arr to be first of the iterator
    arr = initialValue[Symbol.iterator]();
    initialValue = arr?.next().value;
  }

  let acc = initialValue;
  for (const cur of arr) {
    acc = callbackFn(acc, cur);
  }
  return acc;
}
