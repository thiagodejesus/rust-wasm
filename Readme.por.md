# Como usar Rust com typescript

Hoje vamos ver algumas formas de usar Rust com Typescript através de WASM.

## 1. Criando o projeto WASM em Rust

Primeiro vamos criar um novo projeto e navegar pra dentro dele:

```sh
  mkdir wasm-calc && \
  cd wasm-calc && \
  cargo new --lib rust-calc
```

Abra o projeto na sua IDE de preferência, substitua os conteúdos de `lib.rs` pelo código abaixo:

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

Agora, vamos preparar a crate (pacotes no universo do Rust) para ser exportada pra o WASM, vamos adicionar a crate [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) que te traz algumas facilidades pra trabalhar com os bindings.

```sh
  cargo add wasm-bindgen
```

Modifique o `Cargo.toml` pra incluir `crate-type = ["cdylib"]`, essa é uma instrução pra o compilador do Rust trabalhar de uma forma que gera artefatos compatíveis com WASM. _[Ref](https://users.rust-lang.org/t/why-do-i-need-to-set-the-crate-type-to-cdylib-to-build-a-wasm-binary/93247)_

```toml
[lib]
crate-type = ["cdylib"]
```

Atualize `lib.rs` pra usar `wasm_bindgen`:

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

Agora vamos buildar o projeto usando [wasm-pack](https://github.com/rustwasm/wasm-pack), uma crate que ajuda nos builds pra diferentes ambientes JS.

```sh
  wasm-pack build --out-dir target/pkg-node --target nodejs
```

## 2. Usando o WASM no NodeJs

Crie um novo projeto Node:

```sh
  cd ../ && \
  mkdir node-rust-calc && \
  cd node-rust-calc && \
  npm init -y && \
  npm add typescript -D && \
  npx tsc --init && \
  touch index.ts
```

Adicione o pkg gerado como dependência:

```sh
  npm add ../rust-calc/target/pkg-node
```

Importe e use as funções feitas no Rust em `index.ts`:

```typescript
import { sum, divide, multiply, subtract } from "rust-calc";

console.log("1 + 2: ", sum(1, 2)); // 3
console.log("1 - 2: ", subtract(1, 2)); // -1
console.log("1 * 2: ", multiply(1, 2)); // 2
console.log("1 / 2: ", divide(1, 2)); // 0
```

Rode:

```sh
npx tsc && node index.js
```

É isso, bem fácil rodar WASM no node usando essas crates, parece até mágica.

## 3. Usando o WASM com javascript vanilla na web

Builde o WASM com o target web:

```sh
cd ../rust-calc
wasm-pack build --out-dir target/pkg-web --target web
```

Aqui geramos um pkg diferente, `pkg-web`, já que o target `web` difere do target `nodejs`, daí podemos importar os relevantes em cada projeto.

Create um novo projeto web:

```sh
  cd ../ && \
  mkdir vanilla-js-rust-calc && \
  cd vanilla-js-rust-calc && \
  touch index.html
```

Create um `index.html` com o seguinte conteúdo:

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
        console.log("1 / 2: ", divide(1, 2)); // 0 As the rust function is working with integers, we gonna receive 0 instead of 0.5
      }

      run();
    </script>
  </body>
</html>
```

Rode o `index.html` usando um server, por exemplo [miniserve](https://github.com/svenstaro/miniserve). A gente não pode abrir diretamente o html com o browser, pois o WASM precisa ser carregado, e pra isso precisamos pegar o arquivo `.wasm`, entretanto, abrindo diretamente com o navegador tomamos um CORS.


```sh
  cd ../
  miniserve . --index "vanilla-js-rust-calc/index.html" -p 8080
```

Abra [http://localhost:8080](http://localhost:8080) no seu navegador e veja a saída no console.

É isso, para rodar no JS vanilla precisamos inicializar o WASM manualmente antes de o usarmos, enquanto que no Node isso acontece por baixo dos panos, já que o Node tem acesso direto ao sistema de arquivos.

## 4. Usando o WASM no NextJs

Crie um novo projeto NextJs:

```sh
  npx create-next-app@14.2.4 nextjs-rust-calc --use-npm
```

Navege até o projeto e adicione a dependênca do WASM:

```sh
  cd nextjs-rust-calc && \
  npm add ../rust-calc/target/pkg-web
```

Substitua o conteúdo de `page.tsx` por:

```tsx
import { sum, subtract, multiply, divide } from "rust-calc";

export default function Home() {
  console.log("1 + 2: ", sum(1, 2)); // 3
  console.log("1 - 2: ", subtract(1, 2)); // -1
  console.log("1 * 2: ", multiply(1, 2)); // 2
  console.log("1 / 2: ", divide(1, 2)); // Como estamos usando inteiros no Rust, o esperado é receber 0 ao invés de 0.5

  return (
    <main>
      <h1>NextJs Rust Calc</h1>
    </main>
  );
}
```

Esse cógigo não vai funcionar, pois, como vimos no JS vanilla, precisamos inicializar o WASM primeiro, vamos fazer isso então:

Modifique `page.tsx` como abaixo:

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
      console.log("1 / 2: ", divide(1, 2)); // // 0 As the rust function is working with integers, we gonna receive 0 instead of 0.5
    })();
  }, []);

  return (
    <main>
      <h1>NextJs Rust Calc</h1>
    </main>
  );
}
```

Como a inicialização do WASM é um processo assíncrono, eu a coloquei dentro de um useEffect.
Tem um possível problema com a abordagem acima, em algum momento alguém pode tentar as funções do rust-calc sem a devida inicialização do WASM, então vamos fazer um ajuste pra grantir que as funções só fiquem disponíveis após o WASM ser inicializado.

Vamos criar uma lib em TS, envolvendo o WASM e exportando todas as funções apenas após a inicialização:

Vamo criar nossa lib TS:

```sh
  cd ../ && \
  mkdir ts-calc && \
  cd ts-calc && \
  npm init -y && \
  npm add typescript -D && \
  npx tsc --init && \
  touch index.ts
```

Dentro de `tsconfig.json`, marque `"declaration": true`, e no `package.json`, adicione `"types": "index.d.ts"`.

Adicione o rust-calc como dependência:

```sh
  npm add ../rust-calc/target/pkg-web
```

Crie um `index.ts` com o seguitne conteúdo:

```ts
import * as rustCalc from "rust-calc";

export const instantiate = async () => {
  const { default: init, initSync: _, ...lib } = rustCalc;

  await init();
  return lib;
};

export default instantiate;
```

Compile o projeto:

```sh
  npx tsc
```

No seu projeto Next, remova antiga dependência do rust-calc e adicione a do TS:

```sh
  cd ../nextjs-rust-calc && \
  npm remove rust-calc && \
  npm add ../ts-calc
```

Atualize o `page.tsx` pra usar o `ts-calc`:

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
        console.log("1 / 2: ", divide(1, 2)); // 0 As the rust function is working with integers, we gonna receive 0 instead of 0.5
      })();
    }, []);

    return (
      <main>
        <h1>NextJs Rust Calc</h1>
      </main>
    );
  }
```

É isso, agora temos a garantia de que só acessaremos as funções após o WASM ser inicializado, tá aí um módulo WASM rodando em vários ambientes.

Referências:
  - [wasm-bindgen guide](https://rustwasm.github.io/wasm-bindgen/examples/hello-world.html)
  - [wasm-pack docs](https://rustwasm.github.io/docs/wasm-pack/)
  - [rustwasm guide](https://rustwasm.github.io/docs/book/)