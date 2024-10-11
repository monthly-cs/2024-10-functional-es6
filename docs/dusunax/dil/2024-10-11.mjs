import { reduce, map, log, mapCurry, reduceCurry } from "./utils.mjs";
import { menu } from "./example.mjs";

/**
 * go
 * 즉시 함수들과 인자를 전달해서, 즉시 어떤 값을 평가
 *  */
const go = (...args) => reduce((a, f) => f(a), args);
go(
  0, // 초기값
  (a) => a + 1,
  (a) => a + 10,
  (a) => a + 100,
  log
);

/**
 * pipe
 * 함수들을 연결하여 하나의 함수로 만듦
 */
const pipe =
  (f, ...fs) =>
  (...as) =>
    go(f(...as), ...fs); // 첫 번째 함수(f)와 나머지 함수들(fs)을 적용

// 함수를 연결, 함수를 리턴하는 함수
const f = pipe(
  (a, b) => a + b,
  (a) => a + 10,
  (a) => a + 100
);
log(f(0, 1));

/**
 * curry
 * 함수를 받아서 커리된 함수를 리턴
 * 커리되다? 커링(currying)은 함수형 프로그래밍에서 사용되는 기법으로, 여러 개의 인자를 가진 함수를 단일 인자를 가진 함수들의 체인으로 변환하는 과정
 * 인자를 하나만 받으면 이후 인자를 더 받기를 기다리는 함수를 리턴
 * 인자를 여러개 받으면 원래 함수를 호출
 */
const curry =
  (f) =>
  (a, ..._) =>
    _.length ? f(a, ..._) : (..._) => f(a, ..._);

const add = curry((a, b) => a + b);
log(add); // 함수를 리턴, (a, b) => a + b
log(add(1)("🤔")); // 1🤔

const add10 = add(10); // 함수를 리턴, (b) => 10 + b
log(add10("🤔")); // 10🤔

/**
 * 예제
 * - reduce 함수를 사용해서 메뉴의 총 가격 계산
 */
// 1.
log(
  reduce(
    add,
    map((p) => p.price, menu)
  )
);
// 2. 1의 순서를 반대로 뒤집어서 표현
go(
  menu,
  (menu) => map((p) => p.price, menu),
  (prices) => reduce(add, prices),
  log
);
// 3. curry 함수를 사용해서 간결히 표현
go(
  menu,
  mapCurry((p) => p.price),
  reduceCurry(add),
  log
);
// 4. 함수를 조합해서 하나의 고차 함수로 만듦 (map, reduce 함수를 조합)
const totalPrice = pipe(
  mapCurry((p) => p.price),
  reduceCurry(add)
);
go(menu, totalPrice(menu), log);

// What to do?
// 함수를 잘게 나누고, 조합해서 중복을 제거하고, 더 많은 곳에서 사용될 수 있도록 한다.
