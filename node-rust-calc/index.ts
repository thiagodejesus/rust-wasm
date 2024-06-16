import { sum, divide, multiply, subtract } from "rust-calc";

console.log("1 + 2: ", sum(1, 2)); // 3
console.log("1 - 2: ", subtract(1, 2)); // -1
console.log("1 * 2: ", multiply(1, 2)); // 2
console.log("1 / 2: ", divide(1, 2)); // 0 As the rust function is working with integers, we gonna receive 0 instead of 0.5