# ICRC-35 - Browser-based interoperability framework

This is a reference implementation of [ICRC-35 standard](https://github.com/dfinity/wg-identity-authentication/issues/119).

[`impl` directory](./impl/) contains a TypeScript library, that implements the standard completely, following all the recommendations. Besides that, this library provides some additional useful features like:

* `async/await` support for request-response model;
* [zod](https://zod.dev/)-powered runtime type-checking;
* `beforeConnectionClosed`/`afterConnectionClosed` lifecycle hooks;
* [Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) API, for faster transmission;
* automatic peer filtering for service providers;
* debug mode, when messages are printed to the console.

[`example` directory](./example/) contains an example project that highlights some best practices and allows to see how the protocol works in real time locally.

## Usage

One window is a parent, because it opens another window to talk to. So another window is a child.

### Install

```json
// package.json

"dependencies": {
    ...
    "icrc-35": "^0.2"
    ...
}
```

### Parent window

```typescript
import { ICRC35Connection, openICRC35Window } from "icrc-35";

// establish a secure connection
const connection = await ICRC35Connection.establish({
    mode: "parent",
    ...openICRC35Window("http://example-child.com"),
});

// send a Request message, and await for a response
const res = await connection.request("example:method", "World");

console.log(res); // "Hello, World!"
```

### Child window

```typescript
// establish a secure connection, possibly filtering ones you don't like
const connection = await ICRC35Connection.establish({
    mode: "child",
    connectionFilter: {
        kind: "blacklist",
        list: [],
    },
    peer: window.opener,
});


// listen for messages of a specific Route
connection.onRequest("example:method", (request) => {
    console.log(request.payload); // "World"

    // respond
    request.respond(`Hello, ${request.payload}!`);
});
```

See the [example project](./example/) for a more in-depth example.

## Local development

This monorepo is managed with [pnpm](https://pnpm.io/installation) and `turborepo`:

* `pnpm i -g turbo`
* `pnpm i`

To build the library and the example project:

* `pnpm run build`

To run the example project locally:

* `pnpm run dev`

To test the library with automated tests:

* `pnpm run test`

## Contribution

Consider forking this repository and making a PR with changes. Also feel free to discuss the design of this reference implementation [here](https://github.com/dfinity/wg-identity-authentication/issues/119).
