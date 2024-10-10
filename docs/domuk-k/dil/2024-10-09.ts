const get_array_iterble = () => [1, (console.log('array 평가'), 2)];
const get_string_iterable = () => `1${(console.log('string 평가'), 2)}`;
const get_map_iterable = () =>
  new Map([
    ['a', (console.log('map 평가'), 1)],
    ['b', 2],
  ]);
const get_set_iterable = () => new Set(['a', (console.log('set 평가'), 1)]);
const get_generator_iterable = () =>
  (function* () {
    yield 1;
    console.log('generator 평가'); // 이 log만
    yield 2;
  })();

console.log('--------이터러블 값 생성 시작-----');

const array_ = get_array_iterble();
const string_ = get_string_iterable();
const map_ = get_map_iterable();
const set_ = get_set_iterable();
const generator_ = get_generator_iterable();

console.log('--------이터러블 값 생성 완료-----');

console.log(array_);
console.log(string_);
console.log(map_);
console.log(set_);
console.log(generator_);

console.log('--------이터레이터 선언 -----');

const array_iterable = array_[Symbol.iterator]();
const string_iterable = string_[Symbol.iterator]();
const map_iterable = map_[Symbol.iterator]();
const set_iterable = set_[Symbol.iterator]();
const generator_iterable = generator_[Symbol.iterator]();

console.log(array_iterable);
console.log(string_iterable);
console.log(map_iterable);
console.log(set_iterable);
console.log(generator_iterable);

console.log('--------1차 순회 시작-----');
console.log(array_iterable.next());
console.log(string_iterable.next());
console.log(map_iterable.next());
console.log(set_iterable.next());
console.log(generator_iterable.next());
console.log('--------1차 순회 끝-----');
console.log('--------2차 순회 시작-----');
console.log(array_iterable[Symbol.iterator]().next());
console.log(string_iterable[Symbol.iterator]().next());
console.log(map_iterable.next());
console.log(set_iterable.next());
console.log(generator_iterable.next());
console.log('--------2차 순회 끝-----');
