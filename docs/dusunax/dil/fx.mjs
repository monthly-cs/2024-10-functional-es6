// 함수형 프로그래밍
const log = (a) => console.log(a);

const go = (...args) => reduce((a, f) => f(a), args);
const pipe =
  (f, ...fs) =>
  (...args) =>
    go(f(...args), ...fs);
const curry = (f) => (a) => (b) => f(a, b);

const map = curry((f, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(f(a));
  }
  return res;
});
const reduce = curry((f, acc, iter) => {
  if (!iter) {
    iter = acc[Symbol.iterator]();
  }
  for (const a of iter) {
    acc = f(acc, a);
  }
  return acc;
});
const filter = curry((f, iter) => {
  let res = [];
  for (const a of iter) {
    if (f(a)) res.push(a);
  }
  return res;
});

const join = curry((sep = ",", iter) =>
  reduce((a, b) => `${a}${sep}${b}`, iter)
);
const add = (a, b) => a + b;
const sum = (f, iter) => go(iter, map(f), reduce(add));

export { go, pipe, curry, add, map, reduce, filter, join, log, sum };
