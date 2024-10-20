const products = [
  { name: "반팔티", price: 15000 },
  { name: "긴팔티", price: 20000 },
  { name: "핸드폰케이스", price: 15000 },
  { name: "후드티", price: 30000 },
  { name: "바지", price: 25000 },
];

const add = (a, b) => a + b;

log(
  reduce(
    add,
    map(
      (p) => p.price,
      filter((p) => p.price < 20000, products)
    )
  )
);
console.clear();

// 코드를 값으로 다루어 표현력 높이기 ## go, pipe

// 첫번째 인자를 그 다음 인자인 함수에 적용하여 값을 반환하는 과정을 반복
const go = (...args) => reduce((a, f) => f(a), args);

// 함수를 reudce로 연속적으로 실행, pipe는 함수를 return
const pipe =
  (f, ...fs) =>
  (...as) =>
    go(f(...as), ...fs);

// 즉시 값을 평가함
go(
  add(0, 1), // 1
  (a) => a + 10, // 11
  (a) => a + 100, // 111
  log
);
// 111

// 합성된 함수를 만듬
const f = pipe(
  (a, b) => a + b,
  (a) => a + 10,
  (a) => a + 100
);

log(f(0, 1)); // 111

console.clear();

log(
  reduce(
    add,
    map(
      (p) => p.price,
      filter((p) => p.price < 20000, products)
    )
  )
);

go(
  products,
  (products) => filter((p) => p.price < 20000, products), // 20000 미만인 상품들
  (products) => map((p) => p.price, products), // 20000 미만인 상품들의 가격
  (prices) => reduce(add, prices), // 20000 미만인 상품들의 가격 총합
  log
);

/**
 * 밑에서 다루는 내용이지만 curry를 사용해 filter, map, reduce를 mapping 해서 가능
 * 인자를 하나 받으면 이후에 받을 인자를 받아서 실행하는 함수를 return
 */
go(
  products,
  (products) => filter((p) => p.price < 20000)(products),
  (products) => map((p) => p.price)(products),
  (products) => reduce(add)(products),
  log
);

// products를 받아 다시 products를 받는 다는 내용을 지운 코드
go(
  products,
  filter((p) => p.price < 20000),
  map((p) => p.price),
  reduce(add),
  log
);

console.clear();

//curry

// 함수를 받아서 함수를 return
// 인자가 2개 이상이면 받아둔 함수를 즉시 실행하고 적다면 return한 이후에 인자를 합쳐서 실행
const mult = curry((a, b) => a * b);

log(mult(2)); // (..._) => f(a, ..._) => 나머지 인자를 더 전달했을 때, 함수에게 받어두둔 인자와 함께 실행
log(mult(1)(2)); // 2

const mult3 = mult(3); // 첫 인자가 3으로 고정된 mult 함수
log(mult3(10)); // 30
log(mult3(5)); // 15
log(mult3(3)); // 9
console.clear();

// 함수 조합으로 함수 만들기
go(
  products,
  (products) => filter((p) => p.price < 20000, products), // 20000 미만인 상품들
  (products) => map((p) => p.price, products), // 20000 미만인 상품들의 가격
  (prices) => reduce(add, prices), // 20000 미만인 상품들의 가격 총합
  log
);

const total_price = pipe(
  map((p) => p.price),
  reduce(add)
);

// map, reduce를 total_price로 합침
go(
  products,
  (products) => filter((p) => p.price < 20000, products), // 20000 미만인 상품들
  total_price,
  log
);

const base_total_price = (predi) => pipe(filter(predi), total_price);

// filter, total_price를 base_total_price로 합침
go(
  products,
  base_total_price((p) => p.price < 20000),
  log
);

go(
  products,
  base_total_price((p) => p.price >= 20000),
  log
);
