## 2주차 발표 자료

> 이번 주 배워볼 함수형 프로그래밍 개념
>
> - 코드를 값으로 다루기: go, pipe
> - 커링: curry
> - 지연 평가: L.range, L.map, L.filter

### 함수형 프로그래밍 개념

#### 📌 코드를 값으로 다루기

코드 자체를 값처럼 다루는 것을 의미합니다. 함수형 프로그래밍에서는 함수도 값으로 취급될 수 있어서, 다른 함수의 인자로 전달하거나 함수에서 반환하는 것이 가능합니다.

#### 📌 평가하는 시점을 원하는 대로 다루기

평가 시점을 제어한다는 것은 지연 평가(lazy evaluation) 또는 비동기 처리 같은 기술을 통해 코드 실행을 나중으로 미루거나 필요할 때만 평가하는 것을 의미합니다.

```tsx
function lazyAdd(a, b) {
  return () => a + b;
}
const addLater = lazyAdd(2, 3); // addLater는 아직 미평가 () => a + b
console.log(addLater()); // 5 (실행하면 평가, 실행은? 내가 필요할 때)
```

#### 📌 코드의 표현력을 높이기

더 간결하고 추상적인 방식으로 문제를 해결할 수 있도록 코드를 작성하는 것을 말합니다. 고차 함수를 사용해서 추상적인 작업을 수행하는 경우가 많습니다.

### go, pipe

- go: 함수들과 인자를 전달해서, 즉시 어떤 값을 평가
- pipe: 함수들을 연결하여 하나의 함수로 만듦

```tsx
// go는 함수들과 인자를 전달해서, 즉시 어떤 값을 평가
const totalPrice = go(
  menu,
  map((p) => p.price),
  reduce(add),
  log
);

// pipe는 함수들을 연결하여 하나의 함수로 만듦
// map + reduce + add
const totalPrice = pipe(
  map((p) => p.price),
  reduce(add)
);
go(menu, totalPrice(menu), log);
```

### 커링 (Currying)

- 함수를 받아서 함수를 리턴하는 함수
- 커링은 여러 개의 인자를 받는 함수를 하나의 인자만 받는 여러 개의 함수로 변환하는 기법

```tsx
const curry =
  (f) =>
  (a, ..._) =>
    _.length ? f(a, ..._) : (..._) => f(a, ..._);
const add = (a, b, c) => a + b + c;
const addCurry = curry(add);

// 사용 예
console.log(addCurry(1, 2, 3)); // 6
console.log(addCurry(1)(2)(3)); // 6
console.log(addCurry(1, 2)(3)); // 6
console.log(addCurry(1)(2, 3)); // 6

// 부분 적용 (Partial Application)
const add1 = addCurry(1);
console.log(add1(2)(3)); // 6
console.log(add1(2, 3)); // 6

const add1and2 = addCurry(1)(2);
console.log(add1and2(3)); // 6
```

```
1. 모든 인자를 한 번에 전달할 수 있습니다.
2. 인자를 하나씩 순차적으로 전달할 수 있습니다.
3. 인자를 그룹으로 나누어 전달할 수 있습니다.
4. 부분 적용을 통해 새로운 함수를 만들 수 있습니다.
```

### 더 유연하고 조합 가능한 함수를 만들 수 있습니다.

```tsx
const 코드를_값으로_다루기 = pipe(
  잘게_나누기(다형성),
  조합해서_중복제거(추상화),
  여기저기_사용(재사용성)
);

go(코드, 코드를_값으로_다루기, log);
```

### 지연 평가 (Lazy Evaluation)

- 필요할 때만 평가하는 것
  - 필요한 값만 생성되어 실행됨
- 이터레이터를 사용하기
  - 순회하기 전까지 함수 내부가 동작하지 않음
  - 값이 필요할 때까지 실행을 지연시킴

#### 즉시 평가(eager evaluation) vs 지연 평가(lazy evaluation)

- range와 L.range

```tsx
const range = (l) => {
  let i = -1;
  let res = [];
  while (++i < l) {
    log(i, "range"); // 실행됨
    res.push(i);
  }
  return res;
};

const list = range(4);
```

```tsx
const L = {};
L.range = function* (l) {
  let i = -1;
  while (++i < l) {
    log(i, "L.range"); // 순회하기 전까지 실행되지 않음
    yield i;
  }
};

const gen = L.range(4);
```

| 특성           | 일반 range                | L.range (지연 평가)                              |
| -------------- | ------------------------- | ------------------------------------------------ |
| 메모리 사용    | 모든 값을 메모리에 저장   | 현재 값만 메모리에 유지                          |
| 계산 시점      | 모든 값을 즉시 계산       | 값이 필요할 때만 계산                            |
| 유연성         | 제한된 시퀀스만 표현 가능 | 무한한 시퀀스도 표현 가능, 필요한 만큼만 값 생성 |
| 성능 (큰 범위) | 초기 생성 시 느림         | 초기 생성 시 빠르고 메모리 효율적                |

=> L.range는 대규모 데이터나 무한 시퀀스를 다룰 때 특히 유용하며, 필요한 만큼만 계산하므로 전체적인 효율성이 더 높을 수 있습니다.

- 지연성을 가지는 값을 이터레이터로 만들었을 때, take 함수를 조합할 수 있습니다.
  - take, 필요한 만큼만 메모리에 저장합니다.
  - 무한한 시퀀스도 표현할 수 있습니다. (어차피 필요한 만큼만 생성합니다.)

```tsx
go(L.range(Infinity), take(5), reduce(add), log);
// 게으르고 영리하게 제때 계산하기:
// 평가 시점을 늦추는 것이 아니라 평가 시점을 조절하는 것
```

### 제너레이터/이터레이터 프로토콜로 구현하는 지연 평가

- ES6 공식적인 이터레이터 프로토콜 기반으로 구현하여 라이브러리나 다른 함수에서 안전한 조합/합성을 진행할 수 있습니다.
- 이터레이터 중심 프로그래밍, 리스트 중심 프로그래밍, 컬렉션(데이터 컬렉션: 배열, 리스트, 셋 등) 중심 프로그래밍
  - map, filter, take 등의 함수들이 이터레이터 프로토콜을 따르기 때문에 조합/합성이 가능합니다.

```
1. **추상화된 데이터 처리**: 컬렉션의 세부 구현보다는 데이터 처리 로직에 집중합니다.
2. **선언적 프로그래밍**: '어떻게' 보다는 '무엇을' 할지를 명확히 표현합니다.
3. **고차 함수 활용**: map, filter, reduce 등의 함수를 사용하여 데이터를 변환하고 처리합니다.
4. **불변성**: 원본 데이터를 변경하지 않고 새로운 컬렉션을 생성합니다.
```

### L.map, L.filter, take

- 지연 평가를 위해, 제너레이터를 사용하여 이터레이터를 반환하는 함수를 만들 수 있습니다.

```tsx
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
```

### 지연 평가 breakpoint(중단점) 찍어보기

![image](https://github.com/user-attachments/assets/1f0ae470-e87b-406f-a690-59e6391cfdfd)

- 직접 for of 동작을 구현해보면, iter의 done이 false일 때까지 반복하는 while문으로 구현할 수 있습니다.

```tsx
const map = curry((f, iter) => {
  let res = [];
  // for (const a of iter) {
  //   res.push(f(a));
  // }
  iter = iter[Symbol.iterator]();
  let cur;
  while (!(cur = iter.next()).done) {
    res.push(f(cur.value));
  }
  return res;
});
```

#### L.range, L.map, L.filter, take 평가 과정

```tsx
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
```

- 즉시 평가는 모든 값을 즉시 계산하고 저장합니다. (메모리 사용량이 많아짐)

```tsx
/**
 * 지연 평가
 */
go(
  L.range(Infinity),
  L.map((a) => a + 10),
  L.filter((a) => a % 2),
  take(3),
  log
);

// 실행 흐름:
// 1. take(3) 함수 호출
//    - l과 iter(Generator {<suspended>})를 전달받음
//    - take 내부의 while문에서 iter.next() 실행
//    - 평가를 위해 filter로 이동

// 2. L.filter 실행
//    - while문에서 iter.next() 실행
//    - 평가를 위해 map으로 이동

// 3. L.map 실행
//    - while문에서 iter.next() 실행
//    - 평가를 위해 range로 이동

// 4. L.range 실행
//    - while문 내부의 yield 실행
//    - 생성된 값을 map으로 전달

// 5. L.map 계속
//    - yield로 받은 값에 함수 적용
//    - 결과를 filter로 전달

// 6. L.filter 계속
//    - yield로 받은 값에 조건 적용
//    - 조건이 true면 값 반환, 아니면 다음으로 넘어감

// 7. 과정 2-6 반복
//    - take에서 지정한 개수(3)만큼 값이 수집될 때까지 반복

// 8. 최종 결과를 log 함수로 출력
```

- 2-6 과정에서, 필요한 만큼만 계산하고 저장하는 것을 확인할 수 있습니다. => 지연 평가를 통해 메모리를 효율적으로 사용할 수 있는 예시

#### map, filter 계열 함수들이 가지는 결합 법칙, Associative Law

- 사용하는 데이터가 어떤 데이터든지 & 보조 함수가 어떤 동작을 하던지 => 보조 함수가 순수 함수(Pure Functions)라면 결과는 같습니다.
- 가로로 결합하든(즉시 평가), 세로로 결합하든(지연 평가) 결과는 같습니다!

#### ES6의 기본 규약을 통해 구현하는 지연 평가

- 이터레이터 프로토콜과 제너레이터를 기반으로 구현되었기 때문에, 모든 이터러블 객체와 호환됩니다.
- L.map, L.filter 등 지연 평가 함수들이 구현한 지연성은 약속된 자바스크립트의 기본 값 & 일반 값 처리 방식과 같습니다.
- 이러한 표준 규약을 따르기 때문에, 라이브러리든 다른 코드든 안전하게 조합할 수 있습니다.
  - 모든 이터러블 객체(배열, 맵, 셋 등)와 호환됩니다.
  - 사용자 정의 이터러블 객체도 쉽게 만들고 활용할 수 있습니다.

---

### 이번 주 알아본 함수형 프로그래밍 동작 방식

- 커링된 함수에 함수를 1개만 전달하여 처리하는 것이 가능합니다.
- go 함수를 통해 함수들을 조합하여 처리할 수 있습니다.
- 함수를 합성하여 새로운 함수를 만들 수 있습니다.
- 이터레이터를 사용하여 지연 평가를 할 수 있습니다.
- 지연 평가를 통해 메모리를 효율적으로 사용할 수 있습니다.
