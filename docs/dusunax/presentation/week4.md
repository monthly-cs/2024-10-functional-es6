# 4주차 발표 자료

> 이번 주 배워볼 함수형 프로그래밍 개념
>
> - 동기/비동기 작업을 처리하는 다형성
> - 병렬 평가
> - async/await과 파이프라인 다루기

## 비동기 동시성 처리를 위한 reduce와 기타 고차 함수 활용

### reduce와 nop: 비동기 함수와 기본 함수의 다형성

- reduceF는 acc가 Promise인지 확인하고, 비동기 작업이 완료될 때까지 결과를 기다려 축적 작업을 이어갑니다.
  - Promise가 아닌 경우에는 동기적으로 연산이 진행됩니다.
  - 비동기 작업의 에러가 발생해도, nop 값이 반환되면 현재 acc 상태를 유지하여 작업을 진행
- head 함수는 첫 번째 값을 반환해 반복자의 첫 번째 요소를 손쉽게 가져옵니다. 이는 이후 반복 작업에 유용하게 사용됩니다.

```js
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
```

### 지연 평가 + Promise의 효율성

- 시간 단축

```js
const delay500 = (a) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(a), 500);
  });
go(
  [1, 2, 3, 4],
  L.map((a) => delay500(a * a)),
  L.filter((a) => a % 2),
  takeAll,
  log
); // [1, 9]
```

## C, 병렬 평가 (Concurrent Evaluation)

| 특징          | `L` (Lazy Evaluation)                | `C` (Concurrent Evaluation)            |
| ------------- | ------------------------------------ | -------------------------------------- |
| **목적**      | 필요한 시점까지 평가 미룸            | 비동기 작업을 병렬로 처리              |
| **주요 특징** | 메모리와 CPU 효율적 사용             | 네트워크/비동기 작업 최적화            |
| **사용 예시** | `L.map`, `L.filter` (동기 지연 평가) | `C.map`, `C.reduce` (비동기 병렬 평가) |
| **대상**      | 대규모 데이터 연산                   | 대규모 비동기 연산                     |

- 동시성 평가는 즉시 평가의 차이: 병렬적인 작업을 통해 여러 작업을 동시에 실행학고, 개별 작업의 완료 시점은 독립적으로 결정된다.
- 즉시 평가는 데이터를 한 번에 모두 평가하고 실행. 즉시 평가에서 모든 작업이 순차적으로 실행되기 때문에, 각 단계가 완료되기 전까지는 다음 단계로 넘어가지 않습니다.

### 등록되어 있는 함수를 병렬적으로 실행하기

- 비동기 I/O: 싱글스레드 환경(NodeJS)에서 I/O를 동기로 처리하기보다 => 효율적으로 CPU와 메모리 자원을 사용하기
  - CPU 대기 시간을 줄이기
  - 여러 작업을 동시에 처리하는 것처럼 보이게 함
  - 예시: 이미지 처리, DB에 쿼리 날리기 등 // NodeJS가 직접 처리하는 게 아니라 네트워크나 기타 IO에서 처리하는 작업

### C.reduce

```js
C.reduce = curry((f, acc, iter) => {
  const iter2 = catchNoop(iter ? [...iter] : [...acc]);
  return iter ? reduce(f, acc, iter2) : reduce(f, iter2);
});

/** 위와 같은 코드
 * C.reduce = curry((f, acc, iter) =>
 *   iter ? reduce(f, acc, catchNoop([...iter])) : reduce(f, catchNoop([...acc]))
 * );
 */

go(
  [1, 2, 3, 4],
  L.map((a) => delay500(a * a)),
  L.filter((a) => a % 2),
  C.reduce((a, b) => a + b),
  log
);
```

### C.map, C.filter

- C.map: 배열 각 요소에 대해, 비동기적으로 주어진 함수를 적용
- C.filter: 배열 각 요소에 대해, 비동기적으로 비동기적으로 조건을 평가

```js
C.take = curry((l, iter) => take(l, catchNoop([...iter])));
C.takeAll = C.take(Infinity);
C.map = curry(pipe(L.map, C.takeAll));
C.filter = curry(pipe(L.filter, C.takeAll));

map((a) => delay500("map: " + a * a), [1, 2, 3, 4]).then(log);
C.map((a) => delay500("C.map: " + a * a), [1, 2, 3, 4]).then(log);

filter((a) => delay500(a % 2), [1, 2, 3, 4]).then(log);
C.filter((a) => delay500(a % 2), [1, 2, 3, 4]).then(log);
```

### 관행적 네이밍

```jsx
const nop = Symbol("nop"); // Promise의 에러를 무시하기 위한 심볼
function noop() {} // 아무것도 하지 않는 함수
const catchNoop = (arr) => (
  arr.forEach((a) => (a instanceof Promise ? a.catch(noop) : a)), arr
); // noop을 catch로 사용하여 Promise의 에러를 무시
```

### 병렬, 비동기, 에러 처리... Promise.allSettled?

- 비동기 연산보고 Promise.allSettled가 생각나서 비교
  - Promise.allSettled: 비동기 작업, Promise를 동시에 시작하고, 전부 완료될 때까지 대기하면서 결과를 모아 처리
    - [{ status: "fulfilled", value: 1 }, { status: "rejected", reason: "Error" }]
- 동작과 사용 목적이 다르다.
  - 함수형 프로그래밍은 iterable을 평가함: 지연 평가 방식으로, 비동기 이터러블을 순차적으로 평가하면서 병렬 처리를 지원하는 함수
    - iterable, promise
    - 에러 처리를 원하는 방식으로 커스터마이징할 수 있음

### 조합! 평가 전략!

#### 즉시(엄격) + Promise

- 모든 결과를 즉시 처리하는 평가 방식으로, 비동기 연산이 필요할 때 결과를 즉시 반환
- 예측 가능한 동작 보장: 즉시 평가 방식을 사용하여 모든 결과를 즉시 처리하므로 코드의 흐름을 이해하기 쉬움
- Eager Evaluation, Strict Evaluation

### 지연 + Promise

- 결과를 필요할 때만 계산하여 불필요한 작업을 피하는 평가 방식
- 평가 자체 최소화: 필요할 때만 계산을 수행 -> 효율성을 높임
- 결과를 즉시 계산하지 않고, 필요할 때 Promise로 결과를 반환
- Lazy Evaluation

### 병렬 + Promise

- 여러 비동기 작업을 동시에 수행해서 전체 실행 시간을 단축
- 동시 작업 처리: 여러 Promise를 병렬로 실행하여 전체 처리 시간을 줄임
- 비동기 작업의 부하를 고려: 부하를 주고 평가를 빨리 얻을 것인가
- Concurrent Evaluation

### 예제: FxSQL (구 MQL, 함수형으로 짜여진 NoSQL ORM)

- https://github.com/marpple/FxSQL

## 비동기 상황에서의 함수형 프로그래밍

### async/await와 평가 시점 제어

- await 키워드는 Promise를 반환한다. 평가 시점을 제어하기 위해 활용할 수 있다.
- 함수의 실행 결과를 받는 것이 아니라, async 함수 내부에서 값을 사용한다면 동기적으로 사용 가능 ex) NextJS async 서버 컴포넌트

```js
export default async function Page() {
  const post = await fetchData();

  return (
    <div>
      <Post post={post} />
    </div>
  );
}
```

```js
async function f1() {
  const a = await delay500(10); // await 키워드는 Promise를 반환한다.
  const b = await delay500(5);

  // log("inside:" + a + b); // inside: 15
  return a + b;
}

log("outside:", f1()); // outside: Promise { <pending> }
go(f1(), log); // 15
(async () => {
  log(await f1()); // 15
})();
```

### Array.prototype.map vs FxJS map

- map과 같이 보조함수를 받는 메서드들은 Promise를 제어하도록 작성되어 있지 않다.

```js
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

/** 나야, 프로미스 */
function f4() {
  // return은 어차피 Promise다. (async가 없어도)
  return map((a) => delay500(a * a), [1, 2, 3, 4, 5]);
}
```

### Async/await vs Pipeline

- async/await가 해결하고자 하는 목적
  - 표현식으로 갇혀있던 비동기 작업을, 코드의 특정 부분에서 함수 체인이 아니라 문장형으로 표현할 수 있다.
  - 함수를 풀어놓는 것
- 파이프라인이 해결하고자 하는 목적
  - 코드를 리스트로 다루면서, 연속적 함수 실행+함수 합성을 통해 함수를 조합하고, 로직을 테스트 가능 & 유지보수 용이하게 만들기
  - 함수를 합성하는 것
    - 안전하게 비동기 상황을 연결하기 위해 동기적으로 표현
    - 비동기적인 상황을 동기적으로 표현하는 것이 목적이 아니다.

```js
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
```

- 이렇게 파이프라인으로 코드를 작성했을 때의 장점: 읽기 쉬운 코드 & 정상 동작할 것이라고 기대할 수 있다. 또한 지연평가/병렬평가 등 로직의 변경이 쉽다.

### Async/await와 파이프라인을 같이 사용하기도 하나요?

- 네, 사실입니다.

```js
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
```

### 동기/비동기 상황에서의 에러 핸들링 예제

#### 동기

```js
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
log(f7(null)); // 반환값: [], 로그: TypeError: Cannot read properties of null (reading 'map') ❌
```

#### 비동기 (쉽지 않다)

```js
async function f8(list) {
  try {
    // 배열 [Promise {<reject>}, Promise, ...]
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
f8(["1", "2", "3", "5", "9"]).then((e) => log("f8 return:", e)); // f8 return: [1, 3]
f8(["1", "2", "3", "{", "9"]).then((e) => log("f8 return:", e)); // f8 return: [], 로그: SyntaxError: Unexpected end of JSON input 2️⃣
```

### 비동기 상황에서 파이프라인의 이점

```js
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
    log(e, "1️⃣"); // 캐치하려면? try-catch문에서 Promise.reject를 반환해야 한다.
    return [];
  }
}
f9(["1", "2", "3", "5", "9"]).then((e) => log("f9 return:", e)); // [1, 3]
f9(["1", "2", "3", "5", "{", "9"])
  .then((e) => log("f9 return:", e))
  .catch((e) => log(e, "2️⃣")); // 내부의 try-catch가 동작하지 않는다면, 2️⃣에서 오류를 캐치할 수 있다.
f9(["1", "2", "3", "5", "{", "9"]).then((e) => log("f9 return:", e)); // [1, 3]
// 👆 오류가 발생하지 않는다, 이유는?
// Lazy Evaluation을 하고 있기 때문에, "{" 요소가 평가되기 전에 함수가 종료된다.
```

- 파이프라인과 async/await, try-catch문을 통해 비동기적인 상황을 다루면?
  - 위와 같이 연속적인 함수에서 에러 핸들링을 쉽게 할 수 있기 때문에, 트랜잭션 롤백도 간편하게 할 수 있다.

---

# 수고하셨습니다 🙌
