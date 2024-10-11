// 함수형 프로그래밍 유틸
const reduce = (f, acc, iter) => {
  if (!iter) {
    iter = acc[Symbol.iterator]();
    acc = iter.next().value;
  }
  for (const a of iter) {
    acc = f(acc, a);
  }
  return acc;
};

const map = (f, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(f(a));
  }
  return res;
};

const filter = (f, iter) => {
  let res = [];
  for (const value of iter) {
    if (f(value)) res.push(value);
  }
  return res;
};

const go = (...args) => reduce((a, f) => f(a), args);

const pipe =
  (f, ...fs) =>
  (...as) =>
    go(f(...as), ...fs);

const curry =
  (f) =>
  (a, ..._) =>
    _.length ? f(a, ..._) : (..._) => f(a, ..._);

const range = function* (l) {
  let i = -1;
  while (++i < l) yield i;
};

const take = curry((l, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(a);
    if (res.length === l) return res;
  }
  return res;
});

const log = (a) => {
  console.log(a);
};

const add = (a, b) => a + b;

// curry 함수를 사용해서 map, reduce 함수 만들기
const mapCurry = curry((f, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(f(a));
  }
  return res;
});
const reduceCurry = curry((f, acc, iter) => {
  if (!iter) {
    iter = acc[Symbol.iterator]();
    acc = iter.next().value;
  }
  for (const a of iter) {
    acc = f(acc, a);
  }
  return acc;
});

export {
  reduce,
  map,
  filter,
  go,
  pipe,
  curry,
  range,
  take,
  log,
  add,
  mapCurry,
  reduceCurry,
};
