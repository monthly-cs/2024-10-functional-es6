#

# 구조 분해 할당과 이터러블 🤔

### 구조 분해 할당은 이터러블만 가능한가?

구조 분해 할당은 **이터러블**한 객체에만 사용할 수 있습니다. 구조 분해 할당이 이터러블 객체에 작동하는 원리를 살펴보면, 이터러블 프로토콜과 관련이 있다는 것을 알 수 있습니다.

### 1. 구조 분해 할당과 이터러블의 관계 🔍

- **구조 분해 할당**은 배열이나 객체의 요소를 쉽게 변수에 분해하여 할당하는 문법입니다. 배열 형태의 구조 분해 할당은 **이터러블 프로토콜**을 따르는 객체에 적용할 수 있으며 이로인해 배열, 문자열, `Set`, `Map` 등의 이터러블 객체를 구조 분해 할당할 수 있습니다.

  ```javascript
  const arr = [1, 2, 3];
  const [a, b, c] = arr; // 배열 분해 - 이터러블
  console.log(a, b, c); // 1 2 3

  const str = 'hello';
  const [h, e, l] = str; // 문자열 분해 - 이터러블
  console.log(h, e, l); // h e l
  ```

- 배열 구조 분해의 경우, 좌변에 있는 변수의 수에 맞게 이터러블의 요소들이 **순서대로** 할당됩니다. 이때 이터러블 프로토콜을 이용해서 내부적으로 순회하며 값을 할당합니다.

### 2. 구조 분해 할당의 작동 원리 ✨

구조 분해 할당이 이터러블에 작동하는 원리는 **이터러블 프로토콜**을 활용하기 때문입니다. 이터러블 프로토콜은 객체가 `Symbol.iterator` 메서드를 통해 이터레이터 객체를 반환하는 규칙을 따르는 것을 의미합니다.

- **구조 분해 할당 과정:**
  1. 구조 분해 할당이 배열이나 이터러블 객체에 사용될 때, 자바스크립트 엔진은 해당 객체에 `Symbol.iterator` 메서드가 있는지 확인합니다.
  2. `Symbol.iterator`가 있으면 이터레이터 객체를 생성하고, 이터레이터의 `next()` 메서드를 호출해 값을 순차적으로 가져옵니다.
  3. 좌변의 변수에 할당할 값이 더 이상 없을 때까지 `next()` 메서드를 반복적으로 호출하며 순회합니다.

#### 예시: 배열 구조 분해 할당이 이터러블을 활용하는 원리

```javascript
const arr = [1, 2, 3];
const [a, b, c] = arr;
```

- 이 코드는 내부적으로 이렇게 동작합니다:
  1. `arr[Symbol.iterator]()`를 호출해 이터레이터를 얻습니다.
  2. `next()`를 호출해 첫 번째 값을 가져와 `a`에 할당합니다.
  3. 다시 `next()`를 호출해 두 번째 값을 가져와 `b`에 할당합니다.
  4. 마지막으로 `next()`를 호출해 세 번째 값을 가져와 `c`에 할당합니다.

### 3. 이터러블이 아닌 객체에 구조 분해 할당을 사용하는 경우 🤔

- 객체 분해 할당의 경우, 이터러블이 아니라 객체의 **프로퍼티**를 직접 분해하는 방식입니다. 이때는 이터러블 프로토콜이 아닌 객체의 프로퍼티 키를 이용해 분해합니다.

  ```javascript
  const obj = { x: 10, y: 20 };
  const { x, y } = obj; // 객체 분해 - 이터러블이 아님
  console.log(x, y); // 10 20
  ```

- 이 경우에는 `Symbol.iterator`가 필요하지 않습니다. 객체의 프로퍼티 키를 통해 구조 분해 할당이 이루어집니다.

### 4. 이터러블이 아닌 객체를 구조 분해 하려면? 🌱

- 이터러블 프로토콜을 구현하면, 배열이 아닌 객체도 구조 분해 할당을 사용할 수 있게 만들 수 있습니다. 예를 들어, 커스텀 객체에 `Symbol.iterator`를 구현할 수 있습니다.

  ```javascript
  const customIterable = {
    values: [1, 2, 3],
    [Symbol.iterator]: function* () {
      for (const value of this.values) {
        yield value;
      }
    },
  };

  const [a, b, c] = customIterable;
  console.log(a, b, c); // 1 2 3
  ```

---

## Set과 Map도 구조 분해 할당이 가능한가? 🤔

네! `Set`과 `Map`도 이터러블이기 때문에 구조 분해 할당을 활용할 수 있습니다. 다만, 배열처럼 일반적으로 사용할 수 있는 구조 분해 할당 방식과는 조금 다르게 작동한답니다. 아래에서 `Set`과 `Map`의 구조 분해 할당 예시를 보여드릴게요.

### 1. Set의 구조 분해 할당

`Set`은 순서가 있는 이터러블이므로 배열과 마찬가지로 구조 분해 할당을 사용할 수 있습니다.

```javascript
const mySet = new Set([10, 20, 30]);
const [a, b, c] = mySet;

console.log(a); // 10
console.log(b); // 20
console.log(c); // 30
```

- 이 코드에서 `Set`의 각 요소가 순서대로 구조 분해 할당을 통해 변수 `a`, `b`, `c`에 할당됩니다.
- `Set`은 이터러블이니까 내부적으로 `Symbol.iterator`를 통해 순회하며 값을 분해한답니다.

### 2. Map의 구조 분해 할당

`Map`은 키-값 쌍을 저장하는 이터러블입니다. `Map`을 구조 분해 할당할 때는 각 요소가 `[key, value]` 쌍으로 반환됩니다.

```javascript
const myMap = new Map([
  ['key1', 'value1'],
  ['key2', 'value2'],
  ['key3', 'value3'],
]);

for (const [key, value] of myMap) {
  console.log(key, value);
}
// 출력:
// key1 value1
// key2 value2
// key3 value3
```

- 이 예제는 `for...of` 루프에서 `Map`의 각 키-값 쌍을 `[key, value]` 형식으로 구조 분해 할당하는 방식입니다.
- `Map`의 구조 분해 할당에서는 `for...of`나 스프레드 연산자 등을 통해 순회하며 `[key, value]` 쌍으로 분해할 수 있습니다.

#### Map을 배열 형태로 구조 분해

```javascript
const myMap = new Map([
  ['key1', 'value1'],
  ['key2', 'value2'],
  ['key3', 'value3'],
]);

const [[k1, v1], [k2, v2], [k3, v3]] = myMap;
console.log(k1, v1); // key1 value1
console.log(k2, v2); // key2 value2
console.log(k3, v3); // key3 value3
```

- 이 예제에서는 `Map`의 요소가 배열 `[key, value]` 쌍으로 구성되어 있으니까, 이중 구조 분해 할당을 통해 각 키-값 쌍을 변수에 할당한답니다.

---

## 요약 📝

- **구조 분해 할당**은 이터러블 프로토콜을 활용해 배열이나 이터러블 객체를 순회하면서 값을 분해합니다.
- 구조 분해 할당은 배열, 문자열, `Set`, `Map` 등의 이터러블 객체에 적용할 수 있습니다. 이는 내부적으로 `Symbol.iterator`를 통해 이터레이터를 생성하고, 순회하면서 값을 할당하기 때문입니다.
- **Set**: 배열처럼 구조 분해 할당이 가능하며, 순서대로 각 요소를 변수에 할당합니다.
- **Map**: 구조 분해 할당을 통해 `[key, value]` 쌍을 변수에 할당할 수 있으며, 이중 구조 분해 할당을 활용할 수 있습니다.