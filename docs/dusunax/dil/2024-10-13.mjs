import { log, add, reduce, go, curry, map, filter } from "./fx.mjs";

const L = {};
/**
 * L.range
 */
const range = (l) => {
  let i = -1;
  let res = [];
  while (++i < l) {
    log(i, "range");
    res.push(i);
  }
  return res;
};

// const list = range(4); // list는 배열로 평가된 상태
// log(reduce(add, list));

L.range = function* (l) {
  let i = -1;
  while (++i < l) {
    log(i, "L.range"); // 값이 발생되기 전에 실행되지 않음
    yield i;
  }
};

const gen = L.range(4);
/**
 * Object [Generator] {},
 * iterator 객체,
 * L.range {<suspended>}
 * */
// log(gen);
// log(reduce(add, gen));

const take = curry((l, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(a);
    if (res.length === l) break;
  }
  return res;
});

// 지연성을 가지는 값을 이터레이터로 만들었을 때, take 함수를 조합할 수 있음
// take, 필요한 만큼만 메모리에 저장
// 무한한 시퀀스도 표현할 수 있음 (어차피 필요한 만큼만 생성하니까)

// log(take(5, L.range(Infinity)));
// go(
//   L.range(Infinity), // 미룸
//   take(5), // 연산의 시작
//   reduce(add),
//   log
// );

/**
 * L.map
 */
L.map = curry(function* (f, iter) {
  for (const a of iter) yield f(a);
});

const it = L.map((a) => a + 1, [1, 2, 3]);
// log(it.next()); // 다음 값을 반환
// log(...it); // 모든 값을 반환

/**
 * L.filter
 */
L.filter = curry(function* (f, iter) {
  for (const a of iter) {
    if (f(a)) yield a;
  }
});

const it2 = L.filter((a) => a % 2, [1, 2, 3, 4]);
// log(it2.next());
// log(...it2);

/**
 * 즉시 평가
 */
go(
  range(10),
  map((a) => a + 10),
  filter((a) => a % 2),
  take(3),
  log
);

/**
 * 지연 평가  
 */
go(
  L.range(10),
  L.map((a) => a + 10),
  L.filter((a) => a % 2),
  take(3),
  log
);
