import { log, go, map, take, L, filter, reduce } from "./fx.mjs";

// ----------------------------------------------------------------
/**
 * async:await
 */
log("\nAsync:Await");
function delay500(a) {
  return new Promise((resolve) => {
    setTimeout(resolve(a), 1000);
  });
}

async function f1() {
  const a = await delay500(10); // await 키워드는 Promise를 반환한다.
  const b = await delay500(5);

  // log("inside: " + a + b); // 15
  return a + b;
}

// f1(); // Promise { <pending> }
// log(f1()); // Promise { <pending> }
// go(f1(), log); // 15
// (async () => {
//   log(await f1()); // 15
// })();

// ----------------------------------------------------------------
/**
 * Array.prototype.map vs FxJS map
 */
log("\nArray.prototype.map vs FxJS map");

/** Array.prototype.map 내부에서 비동기 작업를 수행할 때 */
async function f2() {
  const list = [1, 2, 3, 4, 5];
  const temp = list.map(async (a) => await delay500(a * a));
  log("f2 temp:", temp); // [Promise, ...]

  const result = await temp; // 'await' has no effect on the type of this expression.

  console.log("f2 result:", result); // [Prmoise, ...]
  // 왜냐 ? map은 내부적으로 보조함수에서 Promise를 반환하지 않는다.
  // 콜백함수를 async로 선언한다고 해서 비동기 상황을 제어하지 않음
}
// f2();

/** FxJS의 map을 사용한 비동기 동시성 처리 */
async function f3() {
  const list = [1, 2, 3, 4, 5];
  const temp = map((a) => delay500(a * a), list);
  log("f3 temp:", temp); // Promise { <pending> }

  const result = await temp; // await으로 Promise를 반환받을 수 있다.

  console.log("f3 result:", result); // [1, 4, 9, 16, 25]
  // 함수 자체가 비동기를 제어하는 함수여야 한다.
  // FxJS의 map은 내부적으로 비동기 상황을 제어한다.

  return result;
}
// f3();
// log("f3 async 함수의 return값: ", f3());
// f3().then((e) => log("f3 함수가 return한 promise의 then 실행 결과: ", e));

/** 나야, 프로미스 */
function f4() {
  // return은 어차피 Promise다. (async가 없어도)
  return map((a) => delay500(a * a), [1, 2, 3, 4, 5]);
}
// log("f4 함수의 return값: ", f4());
// f4().then((e) => log("f4 함수가 return한 promise의 then 실행 결과: ", e));

// ----------------------------------------------------------------
/**
 * async/await vs 파이프라인
 */
log("\nAsync/Await vs 파이프라인");
const list = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** 파이프라인을 사용한 비동기 동시성 처리... 그런데? */
function f5(list) {
  return go(
    list,
    map((a) => delay500(a * a)),
    filter((a) => delay500(a % 2)),
    map((a) => delay500(a + 10)),
    take(3),
    reduce((a, b) => delay500(a + b))
  );
}
go(f5(list), log); // delay500가 비동기 값이 아니라도 동일하게 값을 받는다.
log(f5(list));

/** f5와 동일한 시간 복잡도를 가진, 최적화된 async 함수 */
async function f6(list) {
  let temp = [];
  for (const a of list) {
    const b = await delay500(a * a); // await은 값을 풀어낸다.
    if (await delay500(b % 2)) {
      const c = await delay500(b + 10);
      temp.push(c);
      if (temp.length >= 3) break;
    }
  }
  let res = temp[0],
    i = 0;
  while (++i < temp.length) {
    res = await delay500(res + temp[i]);
  }
  return res;
}
go(f6(list), log); // delay500가 비동기 함수가 아니어도 Promise를 반환한다.

// ----------------------------------------------------------------
/**
 * Async/await와 파이프라인을 같이 사용하는 예제
 */
/** 파이프라인을 쉽게 재료로 활용하기 위해 async/await을 활용할 수 있다. */
async function f5_2(list) {
  // 파이프라인 함수 r1, r2
  const r1 = await go(
    list,
    map((a) => delay500(a * a)),
    take(3),
    reduce((a, b) => delay500(a + b))
  );

  const r2 = await go(
    list,
    filter((a) => delay500(a % 2)),
    map((a) => delay500(a + 10)),
    take(3),
    reduce((a, b) => delay500(a + b))
  );

  // 두 개의 재료를 사용하는 r3
  const r3 = await delay500(r1 + r2);
  return r3 + "🤔";
}
go(f5_2(list), (a) => log("f5_2 return:", a));

// ----------------------------------------------------------------
/**
 * 동기 상황에서의 에러 핸들링 예제
 */
function f7(list) {
  try {
    return list
      .map((a) => a + 10)
      .filter((a) => a % 2)
      .slice(0, 2);
  } catch (e) {
    log(e, "❌");
    return [];
  }
}
// log(f7(null)); // 반환값: [], 로그: TypeError: Cannot read properties of null (reading 'map')

/**
 * 비동기 상황에서의 에러 핸들링 예제: 쉽지 않다
 */
async function f8(list) {
  try {
    // [Promise {<reject>}, Promise, ...]
    const res = list.map((a) => {
      try {
        return new Promise((resolve) => resolve(JSON.parse(a)));
      } catch (e) {
        log(e, "1️⃣");
      }
    });

    const result = (await Promise.all(res)) // Promise.all은 모든 Promise가 resolve되어야 resolve된다. 아니라면 reject된다.
      .filter((a) => a % 2)
      .slice(0, 2);
    return result;
  } catch (e) {
    log(e, "2️⃣");
    return [];
  }
}
// f8(["1", "2", "3", "5", "9"]).then((e) => log("f8 return:", e));
f8(["1", "2", "3", "{", "9"]).then((e) => log("f8 return:", e));

/**
 * 비동기 상황에서 파이프라인의 이점
 */
async function f9(list) {
  try {
    // return Promise.reject("여기")
    // 함수 합성이 연속적으로 잘 진행되는 상황이어야 try-catch문이 제대로 작동한다.
    return await go(
      list,
      // 엄격하게 평가하면? 에러가 발생
      // 지연 평가하면? 에러 발생하지 않음
      L.map((a) => new Promise((resolve) => resolve(JSON.parse(a)))),
      L.filter((a) => a % 2),
      take(2)
    );
  } catch (e) {
    log(e, "❌"); // 캐치하려면? try-catch문에서 Promise.reject를 반환해야 한다.
    return [];
  }
}
// f9(["1", "2", "3", "5", "{", "9"])
//   .then((e) => log("f9 return:", e))
//   .catch((e) => log(e, "❌"));
// f9(["1", "2", "3", "5", "9"]).then((e) => log("f9 return:", e));
f9(["1", "2", "3", "5", "{", "9"]).then((e) => log("f9 return:", e));
