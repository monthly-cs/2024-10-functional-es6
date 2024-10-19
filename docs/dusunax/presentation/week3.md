# 3주차 발표 자료

> 이번 주 배워볼 함수형 프로그래밍 개념
>
> - Monad
> - L.map, L.filter
> - Promise와 함수 합성

## Monad

> 안전 제일 👷‍♀️

- 안전한 함수 합성
- 값을 감싸서 연산 과정을 표현하는 [컨테이너]
  - 자바스크립트의 대표적인 예: Promise

## queryStr - 실습 코드

- 객체의 key-value 쌍을 쿼리스트링으로 만들기

```tsx
const join = curry((sep = ",", iter) =>
  reduce((a: string, b: string) => `${a}${sep}${b}`, iter)
);
// Array.join의 경우 Array 타입으로만 실행 가능한 메소드입니다.
// 따라서 이터러블을 받을 수 있는 join 함수를 만들어야 합니다.
// iterable을 넘기기 때문에 지연된 값을 받을 수 있습니다.

const queryStr = pipe(
  Object.entries,
  L.map(([key, value]) => `${key}=${value}`), // 지연 평가
  join("&") // join 내에서 next를 호출
);
```

## find

- 조건에 맞는 첫 번째 값을 찾기
- 지연 평가: 조건에 맞는 값을 찾으면 즉시 종료

```tsx
const find = curry((f, iter) => go(iter, L.filter(f), take(1), ([a]) => a));
```

## L.map과 L.filter

- 지연 평가를 이용한 map 함수

```tsx
L.map = curry(function* (f, iter) {
  for (const a of iter) yield go(a, f);
});

// 위 코드와 동일
L.map = curry(function* (f, iter) {
  iter = iter[Symbol.iterator]();
  let cur;
  while (!(cur = iter.next()).done) {
    // 이테레이션이 종료(이터레이터의 반환값 done이 true가됨) 되기 전까지 루프
    const v = cur.value;
    yield go(v, f);
  }
});
```

- 지연 평가를 이용한 filter 함수

```tsx
L.filter = curry(function* (f, iter) {
  for (const a of iter) if (f(a)) yield a;
});

// 위 코드와 동일
L.filter = curry(function* (f, iter) {
  iter = iter[Symbol.iterator]();
  let cur;
  while (!(cur = iter.next()).done) {
    const v = cur.value;
    if (f(v)) yield v;
  }
});
```

- map

```tsx
const map = curry(pipe(L.map, takeAll));
// curry로 iter를 받아서 함수를 조합할 수 있도록 한다.(각각의 인자를 순차적으로 적용)

// 함수 조합 + 축약
// 1. curry((f, iter) => go(iter, L.map(f), take(Infinity))) : 인자 3
// iter를 go의 첫 번째 인자로 전달 => map과 take 함수에 차례대로 적용

// 2. curry((f, iter) => go(L.map(f, iter), take(Infinity))) : 인자 2
// iter를 map의 인자로 전달
// 그 후 반환된 iterator를 take 함수에 전달

// 3. curry(pipe(L.map(f), take(Infinity)))
// 파이프라인을 통해 함수를 조합
// 최종적으로 반환된 함수는 주어진 인자를 받아서 첫 번째 인자로 전달
```

## Flattening Iterables - L.flatten과 L.deepFlat

- 중첩된 배열을 평탄화하는 함수
- L.flatten(지연평가 flatten): iterator를 순회하면서 만약 이터레이터라면 그 이터레이터를 순회, 아니라면 yield
  - yield \*iterable은 for (const val of iterable) yield val (이터러블을 순회하며 각 요소를 yield하는 것)과 동일

```tsx
const isIterable = (a) => a && a[Symbol.iterator];

// 이터레이터를 순회하면서 내부 값을 평탄화
L.flatten = function* (iter) {
  for (const a of iter) {
    if (isIterable(a)) yield* a;
    else yield a;
  }
};
log([...L.flatten([1, [2, [3, 4], 5]])]);

// 깊이 중첩된 이터러블을 재귀로 전부 평탄화
L.deepFlat = function* f(iter) {
  for (const a of iter) {
    if (isIterable(a)) yield* f(a);
    else yield a;
  }
};

// 혹은
L.deepFlat = function* (iter) {
  for (const a of iter) {
    if (isIterable(a)) yield* L.deepFlat(a); // 재귀s
    else yield a;
  }
};
log([...L.deepFlat([1, [2, [3, 4], 5]])]);
```

## L.flatMap과 중첩 배열 예시

```tsx
L.flatMap = curry(pipe(L.map, flatten));
```

- 2차원 배열 예시

```tsx
const arr = [
  [1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10],
];
go(
  arr,
  L.flatMap((a) => a),
  take(4),
  reduce(add),
  log
);
```

```tsx
const users = [
  {
    name: "a",
    age: 21,
    family: [
      { name: "a1", age: 53 },
      { name: "a2", age: 52 },
    ],
  },
  { name: "b", age: 22, family: [{ name: "b1", age: 15 }] },
  {
    name: "c",
    age: 23,
    family: [
      { name: "c1", age: 17 },
      { name: "c2", age: 56 },
    ],
  },
];

go(
  users,
  L.flatMap((user) => user.family),
  L.filter((person) => person.age > 20),
  L.map((person) => person.name),
  take(2),
  log
);
```

## Promise

- Promise는 비동기 연산을 다루는 모나드의 한 예
  - 연속적인 함수 합성 가능
  - then 메서드를 통해 값을 안전하게 전달 및 실행

```tsx
const go1 = (a, f) => f(a); // 만약 a가 Promise인 경우에는 then을 사용해야 한다.
log(go1(Promise.resolve(1), (a) => a + 1)); // [object Promise]1

const go1Resolve = (a, f) => (a instanceof Promise ? a.then(f) : f(a)); // go1Resolve 함수는 a가 Promise인 경우 then을 사용해 값을 추출하여 처리
// Promise가 아니라면 그냥 값을 추출
const result = go1Resolve(Promise.resolve(1), (a) => a + 1); // Promise {<pending>}
result.then(log); // 2, then을 사용해 결과를 출력

go1Resolve(Promise.resolve(1), (a) => a + 1).then(log); // 지속적인 연결, Promise의 체인을 유지하면서 계속해서 함수 적용

Promise.resolve(1)
  .then(f) // 첫 번째 함수 f 실행: f(1)
  .then(g) // 두 번째 함수 g 실행: g(f(1))
  .then(log); // 최종 결과를 log로 출력
```

## callback vs Promise

- callback과 Promise의 상징적인 차이
  - return 값의 유무
  - 컨텍스트를 전달
- Promise는 비동기 상황을 1급으로 다룬다.
  - Promise는 Promise 클래스의 인스턴스를 반환한다. => reject, resolve
  - 대기되어 지고 있다는 "값"을 만듦
    - 값을 인수로 전달, 변수에 할당 등. 1급 값

```
Promise {<pending>}
```

- callback hell vs Promise

```tsx
// Callback Hell
addCallback(5, (res) => {
  addCallback(res, (res) => {
    log(res);
  });
});

// Promise를 활용한 체이닝
addPromise(5)
  .then((res) => addPromise(res))
  .then(log);
```

## Kleisli Composition

- 안전한 함수 합성 방법: 실패 가능성을 고려한 함수 합성
  - 왜? 의존하는 외부 상태에 따라 함수 실행 결과가 달라질 수 있음
- Promise는 함수 합성을 안전하게 만듦 (resolve, reject)

```tsx
// 비동기 함수 예시
const fetchUserById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
      ];

      const user = users.find((u) => u.id === id);
      if (user) {
        resolve(user); // 성공 시 유저 데이터 반환
      } else {
        reject(new Error("User not found")); // 실패 시 오류 반환
      }
    }, 1000);
  });
};

// 유저 이름을 출력하는 함수
const printUserName = (user) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`User Name: ${user.name}`);
      resolve(user.name);
    }, 500);
  });
};

// 🤔 Kleisli Composition을 사용하여 비동기 함수 합성
const getUserNameById = (id) => {
  return fetchUserById(id) // 반환값 Promise
    .then(printUserName) // resolve된 값을 받아 실행
    .catch((error) => {
      // reject된 값을 받아 실행
      console.error(error.message);
      return null; // 오류 없이 빈 값 반환
    });
};

// 성공 시
getUserNameById(2); // "User Name: Bob"

// 실패 시 (없는 유저)
getUserNameById(5); // "User not found"
```

## promise와 reduce

```tsx
const reduce = curry((f, acc, iter) => {
  if (!iter) {
    iter = acc[Symbol.iterator]();
    acc = iter.next().value;
  } else {
    iter = iter[Symbol.iterator]();
  }
  return function recur() {
    let cur;
    while (!(cur = iter.next()).done) {
      const a = cur.value;
      acc = f(acc, a);
      if (acc instanceof Promise) return acc.then(recur); // promise를 만났을 때, 유명함수 재귀하도록 작성
    }
    return acc;
  };
});
```

## promise.then 규칙

- 프로미스에서 then 메소드로 값을 꺼냈을 때, 값은 프로미스가 아니다.

```jsx
Promise.resolve(Promise.resolve(1)).then(log); // 1
new Promise((resolve) => resolve(new Promise((resolve) => resolve(1)))).then(
  log
); // 1
```
