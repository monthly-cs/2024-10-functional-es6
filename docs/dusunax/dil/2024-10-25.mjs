import { pipe, go, curry, L, log, go1, flatten, range, find } from "./fx.mjs";

// 지연평가 + Promise
log("\n지연평가 + Promise:");
const take = curry((l, iter) => {
  let res = [];
  iter = iter[Symbol.iterator]();

  return function recur() {
    let cur;
    while (!(cur = iter.next()).done) {
      const a = cur.value;
      if (a instanceof Promise)
        return a
          .then((a) => ((res.push(a), res).length == l ? res : recur()))
          .then((e) => (e == nop ? recur() : Promise.reject(e)));
      res.push(a);
      if (res.length === l) return res;
    }
    return res;
  };
});

// go(
//   [
//     Promise.resolve(1),
//     Promise.resolve(2),
//     Promise.resolve(3),
//     Promise.resolve(4),
//     Promise.resolve(5),
//   ],
//   // [1, 2, 3, 4, 5],
//   L.map((a) => Promise.resolve(a + 10)),
//   take(4),
//   (result) => result(),
//   log
// );

// 지연평가 + Promise + filter
const nop = Symbol("nop");

L.filter = curry(function* (f, iter) {
  for (const a of iter) {
    const b = go1(a, f);
    if (b instanceof Promise)
      yield b.then((b) => (b ? a : Promise.reject(nop)));
    else if (b) yield a;
  }
});

log("\n지연평가 + Promise + filter:");
// go(
//   [1, 2, 3, 4, 5],
//   L.map((a) => Promise.resolve(a + 10)),
//   L.filter((a) => Promise.resolve(a % 2)),
//   take(2), // take 3개 이상일 때 오류
//   (result) => result(),
//   log
// );

Promise.resolve(1)
  .then((err) => Promise.reject(nop))
  .then(() => console.log("a"))
  .then(() => console.log("b"))
  .catch((e) => e == nop && console.log(e));
