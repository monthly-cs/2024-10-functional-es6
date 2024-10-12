import {
  log,
  mapCurry,
  reduceCurry,
  go,
  pipe,
  add,
  curry,
  filterCurry,
  join,
} from "./utils.mjs";
import { products, snacks } from "./example.mjs";

/** go를 사용한 코드 작성
 */
go(
  products,
  mapCurry((p) => p.quantity),
  reduceCurry((a, b) => a + b),
  log
);

/** 도메인을 위한 함수 조합:
 * products를 순회하면서 함수를 적용한 후, reduce로 더하는 함수
 */
const totalQuantity = pipe(
  // () = (인자) => (😀)
  mapCurry((p) => p.quantity),
  reduceCurry(add)
);

log(totalQuantity(products));

const totalPrice = pipe(
  mapCurry((p) => p.price * p.quantity),
  reduceCurry(add)
);

log(totalPrice(products));

/** 추상화:
 * iter를 순회하면서 f를 적용한 후, reduce로 더하는 함수 */
const sum = (f, iter) => go(iter, mapCurry(f), reduceCurry(add));

log(sum((p) => p.quantity, products));
log(sum((p) => p.price * p.quantity, products));

const sumCurry = curry((f, iter) => go(iter, mapCurry(f), reduceCurry(add)));
const totalQuantityCurry = sumCurry((p) => p.quantity);
const totalPriceCurry = sumCurry((p) => p.price * p.quantity);

log(totalQuantityCurry(products));
log(totalPriceCurry(products));
log(totalQuantityCurry(snacks));
log(totalPriceCurry(snacks));

const div = document.createElement("div");

// 맵 돌리기, not fx
// </tr>
//   ${products
//     .map(
//       (p) =>
//         `<tr><td>${p.name}</td><td>${
//           p.price
//         }</td><td><input type="number" value="${p.quantity}" /></td><td>${
//           p.price * p.quantity
//         }</td></tr>`
//     )
//     .join("")}
//   <tr>

// go!
// ${go(
//   products,
//   mapCurry(
//     (p) =>
//       `<tr><td>${p.name}</td><td>${
//         p.price
//       }</td><td><input type="number" value="${p.quantity}" /></td><td>${
//         p.price * p.quantity
//       }</td></tr>`
//   ),
//   reduceCurry(add)
// )}

div.innerHTML = `<table><tr><th>선택</th><th>상품명</th><th>가격</th><th>수량</th><th>총액</th>
${go(
  products,
  sumCurry(
    // sum 재사용하기, 다형성의 예시
    (p) =>
      `<tr>
        <td><input type="checkbox" ${p.isSelected ? "checked" : ""} /></td>
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td><input type="number" value="${p.quantity}" /></td>
        <td>${p.price * p.quantity}</td>
      </tr>`
  )
)}
  <tr><td colspan="3">합계</td><td>${totalQuantityCurry(
    filterCurry((e) => e.isSelected)(products)
  )}</td><td>${totalPriceCurry(
  filterCurry((e) => e.isSelected)(products)
)}</td></tr>
  </table>`;
document.body.appendChild(div);
