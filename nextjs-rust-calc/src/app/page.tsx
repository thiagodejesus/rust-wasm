"use client";
import { useEffect } from "react";
import { instantiate } from "ts-calc";

export default function Home() {
  useEffect(() => {
    (async () => {
      const { divide, multiply, subtract, sum } = await instantiate();
      console.log("1 + 2: ", sum(1, 2)); // 3
      console.log("1 - 2: ", subtract(1, 2)); // -1
      console.log("1 * 2: ", multiply(1, 2)); // 2
      console.log("1 / 2: ", divide(1, 2)); // 0 As the rust function is working with integers, we gonna receive 0 instead of 0.5
    })();
  }, []);

  return (
    <main>
      <h1>NextJs Rust Calc</h1>
    </main>
  );
}
