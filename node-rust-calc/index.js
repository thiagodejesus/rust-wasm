"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rust_calc_1 = require("rust-calc");
console.log("1 + 2: ", (0, rust_calc_1.sum)(1, 2)); // 3
console.log("1 - 2: ", (0, rust_calc_1.subtract)(1, 2)); // -1
console.log("1 * 2: ", (0, rust_calc_1.multiply)(1, 2)); // 2
console.log("1 / 2: ", (0, rust_calc_1.divide)(1, 2)); // 0 As the rust function is working with integers, we gonna receive 0 instead of 0.5
