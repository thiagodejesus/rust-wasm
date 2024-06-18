# How to Use Rust with TypeScript

Today we gonna navigating into some ways to use Rust on typescript projects with WASM.

## 1. Creating the Rust Wasm Package

First, we gonna create a new Rust project and navigate into it:

```sh
  mkdir wasm-calc && \
  cd wasm-calc && \
  cargo new --lib rust-calc
```

Open the project in your preferred IDE. Replace the contents of `lib.rs` with the following code:

```rust
pub fn sum(left: i32, right: i32) -> i32 {
    left + right
}

pub fn subtract(left: i32, right: i32) -> i32 {
    left - right
}

pub fn multiply(left: i32, right: i32) -> i32 {
    left * right
}

pub fn divide(left: i32, right: i32) -> i32 {
    left / right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = sum(2, 2);
        assert_eq!(result, 4);
    }

    #[test]
    fn test_subtract() {
        let result = subtract(2, 2);
        assert_eq!(result, 0);
    }

    #[test]
    fn test_multiply() {
        let result = multiply(2, 2);
        assert_eq!(result, 4);
    }

    #[test]
    fn test_divide() {
        let result = divide(2, 2);
        assert_eq!(result, 1);
    }
}
```

Next, we gonna prepare the crate to be exported as WebAssembly (Wasm) by adding [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen), a crate that provides facilities to generate bindings to javascript.

```sh
  cargo add wasm-bindgen
```

Modify the `Cargo.toml` to include the `crate-type = ["cdylib"]`, this is a instruction to rust compiler to work in a way that generates artifacts compatible with WASM. _[Ref](https://users.rust-lang.org/t/why-do-i-need-to-set-the-crate-type-to-cdylib-to-build-a-wasm-binary/93247)_

```toml
[lib]
crate-type = ["cdylib"]
```

Update `lib.rs` to use `wasm_bindgen`:

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sum(left: i32, right: i32) -> i32 {
    left + right
}

#[wasm_bindgen]
pub fn subtract(left: i32, right: i32) -> i32 {
    left - right
}

#[wasm_bindgen]
pub fn multiply(left: i32, right: i32) -> i32 {
    left * right
}

#[wasm_bindgen]
pub fn divide(left: i32, right: i32) -> i32 {
    left / right
}
```

Now, build the package using [wasm-pack](https://github.com/rustwasm/wasm-pack), a crate that helps to build wasm to the different javascript environments.

```sh
  wasm-pack build --out-dir target/pkg-node --target nodejs
```

## 2. Using the Package in Node.js

Create a new Node.js project:

```sh
  cd ../ && \
  mkdir node-rust-calc && \
  cd node-rust-calc && \
  npm init -y && \
  npm add typescript -D && \
  npx tsc --init && \
  touch index.ts
```

Add the Rust package as a dependency:

```sh
  npm add ../rust-calc/target/pkg-node
```

Import and use the Rust functions in `index.ts`:

```typescript
import { sum, divide, multiply, subtract } from "rust-calc";

console.log("1 + 2: ", sum(1, 2)); // 3
console.log("1 - 2: ", subtract(1, 2)); // -1
console.log("1 * 2: ", multiply(1, 2)); // 2
console.log("1 / 2: ", divide(1, 2)); // 0
```

Run the Node.js application:

```sh
npx tsc && node index.js
```

Thats it, its really easy to use Rust with nodeJs, almost looks like magic.

## 3. Using the Package in Vanilla JavaScript for the Web

Build the WebAssembly package for web targets:

```sh
cd ../rust-calc
wasm-pack build --out-dir target/pkg-web --target web
```

Here we generated a different pkg, `pkg-web` as the target `web` differs a little from the target `nodejs`, so we can differ when importing them on the respective projects

Create a new project for the web:

```sh
  cd ../ && \
  mkdir vanilla-js-rust-calc && \
  cd vanilla-js-rust-calc && \
  touch index.html
```

Create an `index.html` file with the following content:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vanilla JS Rust Calc</title>
  </head>
  <body>
    <h1>Vanilla JS Rust Calc</h1>
    <p>Open the console to see the output</p>
    <script type="module">
      import init, {
        sum,
        subtract,
        multiply,
        divide,
      } from "../rust-calc/target/pkg-web/rust_calc.js";

      async function run() {
        await init();
        console.log("1 + 2: ", sum(1, 2)); // 3
        console.log("1 - 2: ", subtract(1, 2)); // -1
        console.log("1 * 2: ", multiply(1, 2)); // 2
        console.log("1 / 2: ", divide(1, 2)); // 0.5
      }

      run();
    </script>
  </body>
</html>
```

Serve the `index.html` file using a simple server like [miniserve](https://github.com/svenstaro/miniserve), we can't open directly the index.html with our browsers, because the WASM needs to be loaded, and when opening directly, we receive a cors when getting the WASM file

```sh
  cd ../
  miniserve . --index "vanilla-js-rust-calc/index.html" -p 8080
```

Open [http://localhost:8080](http://localhost:8080) in your browser and check the console.

Thats it, on the vanilla we need to manually init the WASM before use it, while on nodeJs we just plug and play, what happens is that on NodeJs the WASM is initialized under the hood with direct access to the file system that node has.

## 4. Using the Package in Next.js

Create a new Next.js project:

```sh
  npx create-next-app@14.2.4 nextjs-rust-calc --use-npm
```

Navigate to the project directory and add the Rust package:

```sh
  cd nextjs-rust-calc && \
  npm add ../rust-calc/target/pkg-web
```

Replace the content of `page.tsx` with:

```tsx
import { sum, subtract, multiply, divide } from "rust-calc";

export default function Home() {
  console.log("1 + 2: ", sum(1, 2)); // 3
  console.log("1 - 2: ", subtract(1, 2)); // -1
  console.log("1 * 2: ", multiply(1, 2)); // 2
  console.log("1 / 2: ", divide(1, 2)); // 0.5

  return (
    <main>
      <h1>NextJs Rust Calc</h1>
    </main>
  );
}
```

This code won't work, because as we saw on the Vanilla JS example, using the web build, we need to initialize the WASM first, so lets do this.

Modify `page.tsx` as follows:

```tsx
"use client";
import { useEffect } from "react";
import init, { sum, subtract, multiply, divide } from "rust-calc";

export default function Home() {
  useEffect(() => {
    (async () => {
      await init();
      console.log("1 + 2: ", sum(1, 2)); // 3
      console.log("1 - 2: ", subtract(1, 2)); // -1
      console.log("1 * 2: ", multiply(1, 2)); // 2
      console.log("1 / 2: ", divide(1, 2)); // 0.5
    })();
  }, []);

  return (
    <main>
      <h1>NextJs Rust Calc</h1>
    </main>
  );
}
```

As the WASM initialization is an asynchronous process, i put it inside a useEffect Hook.
There is a possible problem with this approach, at some point someone may try to use the rust-calc functions without the proper initialization, so, lets do a workaround to make sure that the WASM is always initialized when some of its functions is called.

We gonna create a TS package wrapping the WASM and exporting all functions only after the initialization

Lets create our typescript package:

```sh
  cd ../ && \
  mkdir ts-calc && \
  cd ts-calc && \
  npm init -y && \
  npm add typescript -D && \
  npx tsc --init && \
  touch index.ts
```

In `tsconfig.json`, set `"declaration": true`, and in `package.json`, add `"types": "index.d.ts"`.

Add the Rust package as a dependency:

```sh
npm add ../rust-calc/target/pkg-web
```

Create `index.ts` with the following content:

```ts
import * as rustCalc from "rust-calc";

export const instantiate = async () => {
  const { default: init, initSync: _, ...lib } = rustCalc;

  await init();
  return lib;
};

export default instantiate;
```

Compile the TypeScript project:

```sh
  npx tsc
```

In your Next.js project, remove the direct Rust package dependency and add the TypeScript wrapper:

```sh
  cd ../nextjs-rust-calc && \
  npm remove rust-ccalc && \
  npm add ../ts-calc
```

Update `page.tsx` to use the wrapper:

```tsx
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
      console.log("1 / 2: ", divide(1, 2)); // 0.5
    })();
  }, []);

  return (
    <main>
      <h1>NextJs Rust Calc</h1>
    </main>
  );
}
```

This ensures that we can only access the WASM methods after its initialization.

That's it! Now you have your WASM module running in various environments.

References:
  - [wasm-bindgen guide](https://rustwasm.github.io/wasm-bindgen/examples/hello-world.html)
  - [wasm-pack docs](https://rustwasm.github.io/docs/wasm-pack/)
  - [rustwasm guide](https://rustwasm.github.io/docs/book/)