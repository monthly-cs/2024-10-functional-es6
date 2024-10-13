<script src="../lib/fx.js"></script>;

// range
var add = (a, b) => a + b;

// 배열을 반환하는 함수
const range = (l) => {
  let i = -1;
  let res = [];
  while (++i < l) {
    res.push(i);
  }
  return res;
};

var list = range(4); // 즉시 배열로 평가가 된다.
log(list);
log(reduce(add, list));

// 느긋한 L.range

const L = {};
L.range = function* (l) {
  let i = -1;
  while (++i < l) {
    yield i;
  }
};

var list = L.range(4);
log(list);
//  이터레이터를 순회할때 마다 값이 평가됨
//  next를 실행해야지 값이 평가된다.

//  그래서 reduce를 사용할 때 배열형태가 아닌채로 들어가도된다.
//  배열 형태가 아닌 채로 있다가 필요시 평가가 이루어져서 값이 꺼내도록 해도 된다.
log(reduce(add, list));

function test(name, time, f) {
  console.time(name);
  while (time--) f();
  console.timeEnd(name);
}

// test('range', 10, () => reduce(add, range(1000000)));
// 4893...
// test('L.range', 10, () => reduce(add, L.range(1000000)));
// 295...
console.clear();

// take

// 많은 값을 받아서 잘라주는 함수

// 이터러블을 받기 때문에 앞에서 만든 range함수를 쓸 수 있고
// 전혀 다른 함수가 이터러블 프로토콜을 따르면 다 소통이 가능하기 때문에 조합성이 높다.
const take = curry((l, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(a);
    if (res.length == l) return res;
  }
  return res;
});

take(5, range(Infinity));
take(5, L.range(Infinity)); // 위 range와 다르게 5개만 뽑아 사용되기 때문에 지연성이 가지고 있는 효율을 확인할 수 있다.

console.time("");
go(range(10000), take(5), reduce(add), log);
console.timeEnd("");

console.time("");
go(L.range(10000), take(5), reduce(add), log);
console.timeEnd("");

/*
이터러블 중심 프로그래밍에서의 지연 평가 (Lazy Evaluation) -> 영리한 평가,
가장 필요할 때까지 그 평가를 미루다가 가장 필요할 때 해당 코드들을 평가하면서
값을 만들어 사용 
- 제때 계산법 
- 느긋한 계산법 
- 제너레이터/이터레이터
프로토콜을 기반으로 구현 -> 이터러블 기반으로 프로토콜을 사용하면 지연 평가나
코드의 평가를 미루는 코드를 값으로 다루는 프로그래밍을 할 때 라이브러리나 서로
다른 함수들이 가장 안전한 조합성이나 합성성을 가져갈 수 있다. */

/**
 * ### map, filter 계열 함수들이 가지는 결합 법칙 
- 사용하는 데이터가 무엇이든지 
- 사용하는 보조 함수가 순수 함수라면 무엇이든지 
- 아래와 같이 결합한다면 둘 다 결과가 같다. 

[[mapping, mapping], [filtering, filtering], [mapping, mapping]] =
[[mapping, filtering, mapping], [mapping, filtering, mapping]] -> 지연평가 성질을 가짐


es6에서는 공식적인 정해진 규칙을 통해 지연성을 구현할 수 있고 이를 합성할 수 있기에 다른 라이브러리와 함수의 조합성이 높고 합성을 안전하게 할 수 있다.
 */
