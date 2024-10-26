import { curry, go1, log, pipe, L, go, map, filter, take } from "./fx.mjs";

/**
 * reduce + nop
 * - nop이라는 값을 통해, 비동기 동시성 작업의 에러 처리 지원
 * - 동기/비동기 작업을 다형성 있게 처리할 수 있음
 * */
// 기본
// const reduceF = (acc, a, f) =>
//   a instanceof Promise ? a.then((a) => f(acc, a)) : f(acc, a);

// acc가 Promise인지 확인하여 비동기 작업 여부를 파악
// - 비동기 작업이면서 오류가 발생했을 때: nop일 경우 무시하고, 그 외의 경우 reject
const reduceF = (acc, a, f) =>
  acc instanceof Promise
    ? acc.then(
        // acc가 Promise라면 비동기 작업이 진행 중이므로 then()으로 결과를 기다림
        (acc) => f(acc, a), // acc와 현재 요소 a를 f(acc, a)로 전달하여 축적
        (e) => (e == nop ? acc : Promise.reject(e)) // then의 두 번째 인자로 reject, 오류 처리
        // - nop일 경우 무시: 이전의 축적된 값을 그대로 사용
        // - nop이 아니면 그대로 오류를 발생시킴
      )
    : f(acc, a); // acc가 Promise가 아니면 동기 작업이므로 바로 f(acc, a)로 축적

const head = (iter) => go1(take(1, iter), ([h]) => h);
// take(1, iter)의 결과(배열)를 비구조화 할당하여 첫번째 요소를 반환
// - iter의 첫번째 요소만 배열로 가져온 뒤, 값을 직접 반환

const reduce = curry((f, acc, iter) => {
  // if (!iter) {
  // iter = acc[Symbol.iterator]();
  // acc = iter.next().value;
  // } else {
  //   iter = iter[Symbol.iterator]();
  // }
  // 표현식으로 작성하기
  // 다형성을 지원하고, 안전하게 에러를 잘 흘려보내기 위함
  if (!iter) return reduce(f, head((iter = acc[Symbol.iterator]())), iter);
  // iter가 주어지지 않았다면 acc를 반복 가능한 객체로 간주 (head를 acc로 설정하고, 나머지로 iter를 설정): 반복 가능

  iter = iter[Symbol.iterator]();
  return go1(acc, function recur(acc) {
    // 재귀를 통해 축적값을 계속 갱신
    let cur;
    while (!(cur = iter.next()).done) {
      acc = reduceF(acc, cur.value, f); // acc와 현재 요소를 f로 축적
      if (acc instanceof Promise) return acc.then(recur); // acc가 Promise라면 then(recur)로 재귀 호출, 비동기 작업이 완료될 때까지 기다림
    }
    return acc;
  });
});

/**
 * 지연 평가 + Promise의 효율성
 */
const delay500 = (a) =>
  new Promise((resolve) => {
    console.log(a);
    setTimeout(() => resolve(a), 500);
  });
// go(
//   [1, 2, 3, 4],
//   L.map((a) => delay500(a * a)),
//   L.filter((a) => a % 2),
//   takeAll,
//   log
// ); // [1, 9]

/**
 * C.reduce
 * - 지금까지 등록되어 있는 함수를 병렬적으로 실행
 */
const C = {};
// C.reduce = curry(
//   (f, acc, iter) => (iter ? reduce(f, acc, [...iter]) : reduce(f, [...acc])) // 즉시 평가하고, reduce로 전달
// );

function noop() {} // 아무것도 하지 않는 함수
const catchNoop = (arr) => (
  arr.forEach((a) => (a instanceof Promise ? a.catch(noop) : a)), arr
); // noop을 catch로 사용하여 Promise의 에러를 무시

C.reduce = curry((f, acc, iter) => {
  const iter2 = catchNoop(iter ? [...iter] : [...acc]);
  return iter ? reduce(f, acc, iter2) : reduce(f, iter2);
});

/** 위와 같은 코드
 * C.reduce = curry((f, acc, iter) =>
 *   iter ? reduce(f, acc, catchNoop([...iter])) : reduce(f, catchNoop([...acc]))
 * );
 */

// go(
//   [1, 2, 3, 4],
//   L.map((a) => delay500(a * a)),
//   L.filter((a) => a % 2),
//   C.reduce((a, b) => a + b),
//   log
// );

/**
 * C.map, C.filter
 */
C.take = curry((l, iter) => take(l, catchNoop([...iter])));
C.takeAll = C.take(Infinity);
C.map = curry(pipe(L.map, C.takeAll));
C.filter = curry(pipe(L.filter, C.takeAll));

map((a) => delay500("map: " + a * a), [1, 2, 3, 4]).then(log);
C.map((a) => delay500("C.map: " + a * a), [1, 2, 3, 4]).then(log);

// filter((a) => delay500(a % 2), [1, 2, 3, 4]).then(log);
// C.filter((a) => delay500(a % 2), [1, 2, 3, 4]).then(log);
