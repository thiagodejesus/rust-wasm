How to use Rust from typescript

# 1 Creating Rust Wasm pkg

```sh
  mkdir wasm-calc && \
  cd wasm-calc && \
  cargo new --lib rust-calc
```

Open the project on the IDE of you preference
Then lets change the template to have sum, subtract, multiplication and division

Replace the lib.rs with the code below

```rs
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

Our rust crate is almost ready, now we need to prepare it to be exported as wasm. For this we gonna use the crate wasm-bindgen to auto generate the binds

`cargo add wasm-bindgen`

we now gonna add the wasm_bindgen macro on the functions to generate the bindings, so the code gona stay like this

we need to put the below instruction on our Cargo.toml

```toml
[lib]
crate-type = ["cdylib"]
```

this is info to rust compiler generate the result in a specific way that fits better the needs of wasm. [For more info](https://users.rust-lang.org/t/why-do-i-need-to-set-the-crate-type-to-cdylib-to-build-a-wasm-binary/93247/7)

Now we gonna apply the macros to generate the wasm bindings for our calc functions, the code gonna be like:

```rs
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
...
```

There it are, lets generate the package, for this we gonna use (wasm-pack)[https://github.com/rustwasm/wasm-pack] a rust crate for build our wasm packages.

Follow the installation guide on their github repository if you don't have it yet

# 2 Using it On NodeJs

So, lets export our wasm for node, we gonna do it running the command `wasm-pack build --out-dir target/pkg-node --target nodejs`

Now we gonna create a Nodejs app to consume our first exported pkg.

```sh
  cd ../ && \
  mkdir node-rust-calc && \
  cd node-rust-calc && \
  npm init -y && \
  npm add typescript -D && \
  npx tsc --init && \
  touch index.ts
```

Now we gonna add our pkg as dependecy
`  npm add ../rust-calc/target/pkg-node`

lets import our rust function and use them

```ts
import { sum, divide, multiply, subtract } from "rust-calc";

console.log("1 + 2: ", sum(1, 2)); // 3
console.log("1 - 2: ", subtract(1, 2)); // -1
console.log("1 * 2: ", multiply(1, 2)); // 2
console.log("1 / 2: ", divide(1, 2)); // 0 As the rust function is working with integers, we gonna receive 0 instead of 0.5
```

now running `npx tsc && node index.js` it should work, just like magic, is not it?
Ok, i think that this is really beautiful

# 3 Using it On Web Vanilla JS

`cd ../rust-calc`

`wasm-pack build --out-dir target/pkg-web --target web`

Time to put it to run on the browser

lets create our vanilla-js-rust-calc

```sh
  cd ../ && \
  mkdir vanilla-js-rust-calc && \
  cd vanilla-js-rust-calc && \
  touch index.html
```

In our index.html we gonna have:

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vanilla JS Rust Calc</title>
  </head>
  <body>
    <h1>Vanilla JS Rust Calc</h1>
    <p>Open the console to see the output</p>
    <!-- Note the usage of `type=module` here as this is an ES6 module -->
    <script type="module">
      // Use ES module import syntax to import functionality from the module
      // that we have compiled.
      //
      // Note that the `default` import is an initialization function which
      // will "boot" the module and make it ready to use. Currently browsers
      // don't support natively imported WebAssembly as an ES module, but
      // eventually the manual initialization won't be required!
      import init, {
        sum,
        subtract,
        multiply,
        divide,
      } from "../rust-calc/target/pkg-web/rust_calc.js";

      async function run() {
        // First up we need to actually load the wasm file, so we use the
        // default export to inform it where the wasm file is located on the
        // server, and then we wait on the returned promise to wait for the
        // wasm to be loaded.
        //
        // It may look like this: `await init('./pkg/without_a_bundler_bg.wasm');`,
        // but there is also a handy default inside `init` function, which uses
        // `import.meta` to locate the wasm file relatively to js file.
        //
        // Note that instead of a string you can also pass in any of the
        // following things:
        //
        // * `WebAssembly.Module`
        //
        // * `ArrayBuffer`
        //
        // * `Response`
        //
        // * `Promise` which returns any of the above, e.g. `fetch("./path/to/wasm")`
        //
        // This gives you complete control over how the module is loaded
        // and compiled.
        //
        // Also note that the promise, when resolved, yields the wasm module's
        // exports which is the same as importing the `*_bg` module in other
        // modes
        await init();

        // And afterwards we can use all the functionality defined in wasm.

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

Now we needs to open this html behind a server, or we gonna receive a CORS error when trying to get the file.

to do so i am using a rust crate called [miniserve](https://crates.io/crates/miniserve)
`cd ../`
so we can run `miniserve . --index "vanilla-js-rust-calc/index.html" -p 8080` on the root of our project

Now if we open [the page](http://localhost:8080) and check the console, we gonna see our expected result.

# 4 Using it On Next Js

```sh
  npx create-next-app@14.2.4 nextjs-rust-calc --use-npm
```

Press enter on the prompts to use all the defaults

```sh
  cd nextjs-rust-calc && \
  npm add ../rust-calc/target/pkg-web
```

Open the page.tsx on your preferred editor and replace the code in there for

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

If we try to run our app now, we gonna receive some errors like `Cannot read properties of undefined (reading 'sum')`.

This is because we need to initialize the wasm first, on the node version its made under the hood using fs, but on the web version we need to get the wasm file on the server and made it available for javascript. For this we can get the default exported function `init`.

Lets apply some changes to fix this.

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

I put the code inside a useEffect because the init is asynchronous so we con properly await its initialization and run the code after it.

Thats it, we have our WASM running on next.

To improve the usability of our lib:

```sh
  cd ../ && \
  mkdir ts-calc && \
  cd ts-calc && \
  npm init -y && \
  npm add typescript -D && \
  npx tsc --init && \
  touch index.ts
```

on tsConfig and mark `declaration` as true
on package.json add option `"types": "index.d.ts"`

`npm add ../rust-calc/target/pkg-web`

Paste the below cod on index.ts

```ts
import * as rustCalc from "rust-calc";

export const instantiate = async () => {
  const { default: init, initSync: _, ...lib } = rustCalc;

  await init();
  return lib;
};

export default instantiate;
```

and run `npx tsc`

Now from our next project we can import the lib from 'ts-calc' instead of 'rust-calc' direct

```sh
cd ../ && \
cd nextjs-rust-calc && \
npm remove rust-calc && npm add ../ts-calc
```

Now change the page.tsx to be:

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

Now we make sure that nobody will accidentaly use the function without instantiate the wasm.

Thats it, thanks