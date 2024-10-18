import {
  go,
  map,
  log,
  reduce,
  pipe,
  join,
  curry,
  filter,
  take,
} from "./fx.mjs";

/**
 * go
 */
const queryStr = (obj) =>
  go(
    obj,
    Object.entries,
    map(([key, value]) => `${key}=${value}`),
    reduce((a, b) => `${a}&${b}`)
  );
// log(queryStr({ limit: 10, offset: 10, type: "notice" }));

/**
 * pipe
 */
const queryStr2 = pipe(
  Object.entries,
  map(([key, value]) => `${key}=${value}`),
  reduce((a, b) => `${a}&${b}`)
);
// log(queryStr2({ limit: 10, offset: 10, type: "notice" }));

/**
 * join
 */
const queryStr3 = pipe(
  Object.entries,
  map(([key, value]) => `${key}=${value}`),
  join("&")
);

log(queryStr3({ limit: 10, offset: 10, type: "notice" }));

// ----------------------------------------------

/**
 * find
 */
const xs = [
  { name: "a", age: 20 },
  { name: "b", age: 21 },
  { name: "c", age: 32 },
  { name: "d", age: 23 },
];

const find = curry((f, iter) =>
  go(
    iter,
    filter((a) => console.log(a), f(a)),
    take(1),
    ([a]) => a
  )
);

const find2 = curry((f, iter) =>
  go(
    iter,
    L.filter((a) => console.log(a), f(a)),
    take(1),
    ([a]) => a
  )
);

log(find((x) => x.age > 30, xs));
log(find2((x) => x.age > 30, xs));
