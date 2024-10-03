// 타입 편하게 찾아보기 : IDE에 설치된 extension 중 ms-vscode가 가진 타입을 참고할 수 있다.
// e.g) ms-vscode.vscode-typescript-next-5.7.20240930/node_modules/typescript/lib/lib.es2015.iterable.d.ts
type It = Iterator<number>;
type Ge = Generator<number>;

// interface Generator<T = unknown, TReturn = any, TNext = any> extends IteratorObject<T, TReturn, TNext> {
//     // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
//     next(...[value]: [] | [TNext]): IteratorResult<T, TReturn>;
//     return(value: TReturn): IteratorResult<T, TReturn>;
//     throw(e: any): IteratorResult<T, TReturn>;
//     [Symbol.iterator](): Generator<T, TReturn, TNext>;
// }

// interface GeneratorFunction {
//     /**
//      * Creates a new Generator object.
//      * @param args A list of arguments the function accepts.
//      */
//     new (...args: any[]): Generator;
//     /**
//      * Creates a new Generator object.
//      * @param args A list of arguments the function accepts.
//      */
//     (...args: any[]): Generator;
//     /**
//      * The length of the arguments.
//      */
//     readonly length: number;
//     /**
//      * Returns the name of the function.
//      */
//     readonly name: string;
//     /**
//      * A reference to the prototype.
//      */
//     readonly prototype: Generator;
// }

// 제너레이터를 반환하는 제너레이터
type Done = 4;
type Yields = 1 | 2 | 3;
type Next = 21;
type GeneratorGenerator = () => Generator<Yields, Done, Next>;

const generatorGenerator: GeneratorGenerator = function* () {
  const a: Next = yield 1;
  console.log(a); // Next (21)
  const b: Next = yield 2;
  console.log(b); // Next (21)
  const c: Next = yield 3;
  console.log(c); // 21

  return 4; // as DoneReturn;
};

const g = generatorGenerator();
g.next(21 as Next);

const ng = function* (v) {
  yield 'wow';
  yield Symbol.asyncIterator;
  yield false;
  return v;
};
const ngs = ng(21);
console.log(ngs.next()); // { value: 'wow', done: false }
console.log(ngs.return('Hej')); // { value: 'Hej', done: true }
console.log([...ngs]); // [Symbol.asyncIterator, false] 이었겠지만, 위에서 return해서 빈 배열이 됨

class MyGenerator implements Generator<Yields, Done, Next> {
  next(value?: Next | undefined): IteratorResult<Yields, Done> {
    throw new Error('Method not implemented.');
  }
  return(value: Done): IteratorResult<Yields, Done> {
    throw new Error('Method not implemented.');
  }
  throw(e: any): IteratorResult<Yields, Done> {
    throw new Error('Method not implemented.');
  }
  [Symbol.iterator](): Generator<Yields, Done, Next> {
    throw new Error('Method not implemented.');
  }
}

// class MyGeneratorFunction implements GeneratorFunction {
//   new (...args: any[]): Generator {
//     throw new Error("Method not implemented.");
//   }
//   (...args: any[]): Generator {
//     throw new Error("Method not implemented.");
//   }
//   readonly length: number;
//   readonly name: string;
//   readonly prototype: Generator;
//   [Symbol.toStringTag]: "GeneratorFunction";
//   [Symbol.iterator](): Generator<Yields, Done, Next> {
//     throw new Error("Method not implemented.");
//   }
// }
