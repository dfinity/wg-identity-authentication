# ICRC-95: derivationOrigin

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)
[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./icrc_25_signer_interaction_standard.md)

<!-- TOC -->
* [ICRC-95: derivationOrigin](#icrc-95-derivationorigin)
  * [Summary](#summary)
  * [Motivation](#motivation)
  * [Specification](#specification)
    * [Definitions](#definitions)
    * [derivationOrigin Parameter](#derivationorigin-parameter)
  * [Reference Implementation](#reference-implementation)
    * [Wallet Provider](#wallet-provider)
    * [DApp Implementation](#dapp-implementation)
<!-- TOC -->

## Summary

A definition of the `derivationOrigin` parameter for inclusion in ICRC-25 and all of its extensions.

## Motivation

Internet Identity, NFID Wallet, and other such on-chain wallets currently use a relying party's origin to derive principal identifiers. When relying parties switch DNS names or add subdomains to their applications, users will authenticate with different identifiers and therefore be unable to access their original data.

In this proposal, we present a solution that focuses on incorporating the existing method for authenticating users with the same principal identifiers across different domains, but in a way that extends the current framework of ICRC standards.

## Specification

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in [RFC-2119](https://www.rfc-editor.org/rfc/rfc2119).

### Definitions

Wallet Provider: A user agent that manages keys and facilitates transactions with ICP.

Relying party: A web page that relies upon one or many Web3 platform APIs which are exposed to the web page via the Wallet.

### derivationOrigin Parameter

ICRC-25 and all of its extensions (in particular, ICRC-27, ICRC-34, ICRC-49) will have the option of adding another parameter to its request named `icrc95_derivationOrigin`.

This parameter specifies the string that wallets should use to derive principal identifiers (and their delegations).

## Reference Implementation

### Wallet Provider

Here is a reference implementation for a Wallet Provider to support ICRC-95.

```
// validateDerivationOrigin.ts

import { resolveCanisterId as resolveCanisterIdFn } from "canisterIdResolution";
import { wrapError } from "utils";
import { Principal } from "@dfinity/principal";
import { isNullish } from "@dfinity/utils";

type ValidationResult =
  | { result: "valid" }
  | { result: "invalid"; message: string };

/**
 * Function to validate the derivationOrigin. The derivationOrigin allows an application to request principals of a
 * different origin, given that origin allows this by listing the requesting application origin in the
 * .well-known/ii-alternative-origins resource.
 * See the spec for more details: https://github.com/dfinity/internet-identity/blob/main/docs/internet-identity-spec.adoc#alternative-frontend-origins
 *
 * @param authRequestOrigin Origin of the application requesting a delegation
 * @param derivationOrigin Origin to use for the principal derivation for this delegation
 */
export const validateDerivationOrigin = async ({
  requestOrigin,
  derivationOrigin,
  resolveCanisterId = resolveCanisterIdFn,
}: {
  requestOrigin: string;
  derivationOrigin?: string;
  resolveCanisterId?: typeof resolveCanisterIdFn;
}): Promise<ValidationResult> => {
  if (isNullish(derivationOrigin) || derivationOrigin === requestOrigin) {
    // this is the default behaviour -> no further validation necessary
    return { result: "valid" };
  }

  try {
    const canisterIdResult = await resolveCanisterId({
      origin: derivationOrigin,
    });
    if (canisterIdResult === "not_found") {
      return {
        result: "invalid",
        message: `Could not resolve canister id for derivationOrigin "${derivationOrigin}".`,
      };
    }
    canisterIdResult satisfies { ok: Principal };

    // We always query the list of alternative origins from a canister id based URL in order to make sure that the request
    // is made through a BN that checks certification.
    // Some flexibility is allowed by `inferAlternativeOriginsUrl` to allow for dev setups.
    const alternativeOriginsUrl = inferAlternativeOriginsUrl({
      canisterId: canisterIdResult.ok,
    });
    const response = await fetch(
      alternativeOriginsUrl,
      // fail on redirects
      {
        redirect: "error",
        headers: {
          Accept: "application/json",
        },
        // do not send cookies or other credentials
        credentials: "omit",
      }
    );

    if (response.status !== 200) {
      return {
        result: "invalid",
        message: `resource ${alternativeOriginsUrl} returned invalid status: ${response.status}`,
      };
    }

    const alternativeOriginsObj = (await response.json()) as {
      alternativeOrigins: string[];
    };

    // check for expected property
    if (!Array.isArray(alternativeOriginsObj?.alternativeOrigins)) {
      return {
        result: "invalid",
        message: `resource ${alternativeOriginsUrl} has invalid format: received ${alternativeOriginsObj}`,
      };
    }

    // check allowed alternative origins
    if (!alternativeOriginsObj.alternativeOrigins.includes(requestOrigin)) {
      return {
        result: "invalid",
        message: `"${requestOrigin}" is not listed in the list of allowed alternative origins. Allowed alternative origins: ${alternativeOriginsObj.alternativeOrigins}`,
      };
    }
  } catch (e) {
    return {
      result: "invalid",
      message: `An error occurred while validating the derivationOrigin "${derivationOrigin}": ${wrapError(
        e
      )}`,
    };
  }

  // all checks passed --> valid
  return { result: "valid" };
};

/**
 * Infer the URL to fetch the alternative origins file from based on the canister id
 * and the current location.
 * Deployments on mainnet, (including production II hosted on ic0.app or internetcomputer.org) will always only use the
 * official icp0.io HTTP gateway.
 * Dev deployments hosted on localhost or custom domains will use the same domain as the current location.
 *
 * @param canisterId The canister id to fetch the alternative origins file from.
 */
const inferAlternativeOriginsUrl = ({
  canisterId,
}: {
  canisterId: Principal;
}): string => {
  // The official HTTP gateway
  // We never fetch from a custom domain or a raw URL in order to ensure that the request is made through a BN that checks certification.
  const IC_HTTP_GATEWAY_DOMAIN = "icp0.io";
  const ALTERNATIVE_ORIGINS_PATH = "/.well-known/ii-alternative-origins";

  const location = window?.location;
  if (isNullish(location)) {
    // If there is no location, then most likely this is a non-browser environment. All bets
    // are off, but we return something valid just in case.
    return `https://${canisterId.toText()}.${IC_HTTP_GATEWAY_DOMAIN}${ALTERNATIVE_ORIGINS_PATH}`;
  }

  if (
    location.hostname.endsWith("icp0.io") ||
    location.hostname.endsWith("ic0.app") ||
    location.hostname.endsWith("internetcomputer.org")
  ) {
    // If this is a canister running on one of the official IC domains, then return the
    // official canister id based API endpoint
    return `https://${canisterId}.${IC_HTTP_GATEWAY_DOMAIN}${ALTERNATIVE_ORIGINS_PATH}`;
  }

  // Local deployment -> add query parameter
  // For this asset the query parameter should work regardless of whether we use a canister id based subdomain or not
  if (location.hostname.endsWith("localhost")) {
    // on localhost, use `localhost` as the domain to avoid routing issues in case of canister id subdomain based routing

    // preserve the port if it's not the default
    const portSegment = location.port !== "" ? `:${location.port}` : "";

    return `${location.protocol}//localhost${portSegment}${ALTERNATIVE_ORIGINS_PATH}?canisterId=${canisterId}`;
  }
  // Preserve host when using IP addresses
  if (location.hostname === "127.0.0.1" || location.hostname === "0.0.0.0") {
    return `${location.protocol}//${location.host}${ALTERNATIVE_ORIGINS_PATH}?canisterId=${canisterId}`;
  }

  // Otherwise assume it's a custom setup expecting the gateway to
  // - be on the same domain
  // - use HTTPS
  // - support query parameter based routing
  return `https://${location.host}${ALTERNATIVE_ORIGINS_PATH}?canisterId=${canisterId}`;
};
```

```
// canisterIdResolution.ts

import { unknownToString } from "utils";
import { Principal } from "@dfinity/principal";
import { isNullish, nonNullish } from "@dfinity/utils";

/**
 * Resolve the canister id of a canister based on the front-end origin.
 * @param origin The origin of the front-end to resolve the canister id of.
 */
export const resolveCanisterId = ({
  origin,
}: {
  origin: string;
}): Promise<{ ok: Principal } | "not_found"> => {
  let url: URL;
  try {
    url = new URL(origin);
  } catch (error) {
    console.error(
      `Failed to parse origin '${origin}' as URL: ${unknownToString(
        error,
        "unknown error"
      )}`
    );
    return Promise.resolve("not_found");
  }

  const maybeCanisterId = parseCanisterIdFromHostname(url.hostname);
  if (nonNullish(maybeCanisterId)) {
    return Promise.resolve({ ok: maybeCanisterId });
  }

  // Look up the canister id by performing a request to the origin
  return lookupCanister({ origin });
};

const parseCanisterIdFromHostname = (
  hostname: string
): Principal | undefined => {
  const wellKnownDomains = [
    "ic0.app",
    "icp0.io",
    "internetcomputer.org",
    "localhost",
  ];

  if (wellKnownDomains.some((domain) => hostname.endsWith(domain))) {
    // The canister is running on a well-known domain, infer the canister ID from the hostname directly
    // (e.g. bd3sg-teaaa-aaaaa-qaaba-cai.localhost -> bd3sg-teaaa-aaaaa-qaaba-cai)
    const domainParts = hostname.split(".");

    // If there is no subdomain, we cannot infer the canister id
    if (domainParts.length > 1) {
      const canisterId = domainParts[0];
      try {
        return Principal.fromText(canisterId); // make sure the inferred part is actually a canister id, throws if not
      } catch {
        console.info(
          `Unable to infer canister id from hostname '${hostname}', falling back to BN lookup.`
        );
      }
    }
  }
};

// Lookup the canister by performing a request to the origin and check
// if the server (probably BN) set a header to inform us of the canister ID
const lookupCanister = async ({
  origin,
}: {
  origin: string;
}): Promise<{ ok: Principal } | "not_found"> => {
  const HEADER_NAME = "x-ic-canister-id";
  try {
    const response = await fetch(
      origin,
      // fail on redirects
      {
        redirect: "error",
        method: "HEAD",
        // do not send cookies or other credentials
        credentials: "omit",
      }
    );

    if (response.status !== 200) {
      console.error(
        "Bad response when looking for canister ID",
        response.status
      );
      return "not_found";
    }

    const headerValue = response.headers.get(HEADER_NAME);
    if (isNullish(headerValue)) {
      console.error(
        `Canister ID header '${HEADER_NAME}' was not set on origin ${origin}`
      );

      return "not_found";
    }
    const canisterId = Principal.fromText(headerValue);
    return { ok: canisterId };
  } catch (error) {
    console.error(
      `Failed to resolve canister ID from origin '${origin}': ${unknownToString(
        error,
        "unknown error"
      )}`
    );

    return "not_found";
  }
};
```

```
// utils.ts

// Turns an 'unknown' into a string, if possible, otherwise use the default
// `def` parameter.
import { isNullish, nonNullish } from "@dfinity/utils";

export function unknownToString(obj: unknown, def: string): string {
  // Only booleans, numbers and strings _may_ not be objects, so first we try
  // Object's toString, and if not we go through the remaining types.
  if (obj instanceof Object) {
    return obj.toString();
  } else if (typeof obj === "string") {
    return obj;
  } else if (typeof obj === "number") {
    return obj.toString();
  } else if (typeof obj === "boolean") {
    return obj.toString();
  }

  // Only "null" and "undefined" do not have 'toString', though typescript
  // doesn't know that.
  return def;
}

/** Collect information helpful to diagnose errors */
export async function diagnosticInfo(): Promise<string> {
  return `user-agent: "${
    navigator.userAgent
  }", is platform auth available: ${await window?.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable()}`;
}

// Helper to gain access to the event's target
export const withInputElement = <E extends Event>(
  evnt: E,
  f: (evnt: E, element: HTMLInputElement) => void
): void => {
  const element = evnt.currentTarget;
  if (!(element instanceof HTMLInputElement)) {
    return;
  }

  return f(evnt, element);
};

/** Try to read unknown data as a record */
export function unknownToRecord(
  msg: unknown
): Record<string, unknown> | undefined {
  if (typeof msg !== "object") {
    return undefined;
  }

  if (msg === null) {
    return undefined;
  }

  // Some extra conversions to take typescript by the hand
  // eslint-disable-next-line
  const tmp: {} = msg;
  const obj: Record<string, unknown> = tmp;
  return obj;
}

export type NonEmptyArray<T> = [T, ...T[]];

export function isNonEmptyArray<T>(
  original: T[]
): original is NonEmptyArray<T> {
  return original.length >= 1;
}

export function asNonEmptyArray<T>(
  original: T[]
): NonEmptyArray<T> | undefined {
  const arr: T[] = [...original];

  const first = arr.shift();

  if (isNullish(first)) {
    return undefined;
  }

  return [first, ...arr];
}

// Returns true if we're in Safari or iOS (although technically iOS only has
// Safari)
export function iOSOrSafari(): boolean {
  // List of values of navigator.userAgent, navigator.platform and
  // navigator.userAgentData by device so far (note: navigator.platform is
  // deprecated but navigator.userAgentdata is not implemented in many
  // browsers):
  //
  // iPhone 12 Mini, iOS 15.0.2
  //
  // Safari
  // navigator.userAgentData: undefined
  // navigator.platform: "iPhone"
  // navigator.userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
  //
  //
  // MacBook Pro Intel, MacOS Big Sur 11.6
  //
  // Safari
  // navigator.userAgentData: undefined
  // navigator.platform: "MacIntel"
  // navigator.userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15"
  //
  // Chrome
  // navigator.userAgentData.plaftorm: "macOS"
  // navigator.platform: "MacIntel"
  // navigator.userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
  //
  // Firefox
  // navigator.userAgentData: undefined
  // navigator.platform: "MacIntel"
  // navigator.userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:93.0) Gecko/20100101 Firefox/93.0"
  //
  //
  // MacBook Air M1, MacOS Big Sur 11.6
  //
  // Safari
  // navigator.userAgentData: undefined
  // navigator.platform: "MacIntel" // yes, I double checked
  // navigator.userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15"
  //
  // Firefox
  // navigator.userAgentData: undefined
  // navigator.platform: "MacIntel" // yes, I double checked
  //
  // iPad Pro, iPadOS 15.0.2
  //
  // Safari
  // navigator.userAgentData: undefined
  // navigator.platform: "iPad"
  // navigator.userAgent: "Mozilla/5.0 (iPad; CPU OS 15_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"

  // For details, see https://stackoverflow.com/a/23522755/2716377
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/* A function that can never be called. Can be used to prove that all type alternatives have been exhausted. */
export function unreachable(_: never, reason?: string): never {
  throw new Error(`Unexpected error ${reason ?? ""}`);
}

/* A version of 'unreachable' that doesn't throw an error but allows execution to continue */
export function unreachableLax(_: never) {
  /* */
}

/* Wrap an unknown value as an error and try to extract a string from it */
export function wrapError(err: unknown): string {
  const unknownError = "unknown error";

  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === "string") {
    return err;
  }

  return unknownError;
}

/** A channel (Chan) between two execution environments.
 * Values can be sent (`send()`) and received (`recv()`) asynchronously
 * on the other end.
 */
export class Chan<A> implements AsyncIterable<A> {
  /* The `recv` function will read values both from a blocking `snd` function
   * and from a buffer. We always _first_ write to `snd` and _then_ write
   * to `buffer` and _first_ read from the buffer and _then_ read from `snd`
   * to maintain a correct ordering.
   *
   * `snd` is a set by `recv` as `resolve` from a promise that `recv` blocks
   * on.
   */

  // Write to `recv`'s blocking promise
  private snd?: (value: A) => void;

  // Buffer where values are stored in between direct writes
  // to the promise
  private buffer: A[] = [];

  // A list of other channels to which we forward (`send()`) the values
  // sent to us
  private listeners: ((a: A) => void)[] = [];

  public latest: A;

  // Constructor with latest which is "initial" and then latest
  constructor(initial: A) {
    this.latest = initial;
  }

  send(a: A): void {
    if (nonNullish(this.snd)) {
      this.snd(a);
      // After the promise was resolved, set as undefined so that
      // future `send`s go to the buffer.
      this.snd = undefined;
    } else {
      this.buffer.push(a);
    }

    // Finally, broadcast to all listeners
    this.listeners.forEach((listener) => listener(a));

    // and set as latest
    this.latest = a;
  }

  // Receive all values sent to this `Chan`. Note that this effectively
  // consumes the values: if you need to read the value from different
  // places use `.values()` instead.
  protected async *recv(): AsyncIterable<A> {
    yield this.latest;

    // Forever loop, yielding entire buffers and then blocking
    // on `snd` (which prevents hot looping)
    while (true) {
      // Yield the buffer first
      while (this.buffer.length >= 1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        yield this.buffer.shift()!;
      }

      // then block and yield a value when received
      yield await new Promise((resolve: (value: A) => void) => {
        this.snd = resolve;
      });
    }
  }

  // Signal to `map` that the element should remain unchanged
  static readonly unchanged = Symbol("unchanged");

  // Return a new Chan mapped with `f`.
  // In the simplest case, a mapping function is provided.
  // For advanced cases, the mapping function may return 'Chan.unchanged' signalling
  // that the element shouldn't be changed, in which case a default (initial) value
  // also needs to be provided.
  map<B>(
    opts: ((a: A) => B) | { f: (a: A) => B | typeof Chan.unchanged; def: B }
  ): Chan<B> {
    const { handleValue, latest } = this.__handleMapOpts(opts);

    // Create a chan that automatically maps the value
    const input = new Chan<B>(latest);
    this.listeners.push((value: A) =>
      handleValue({ send: (a: B) => input.send(a), value })
    );

    return input;
  }

  // Zip two Chans together, where the resulting Chan includes updates
  // from both Chans.
  zip<B>(chanB: Chan<B>): Chan<[A, B]> {
    // eslint-disable-next-line
    const chanA = this; // for clarity/symmetry below

    const zipped = new Chan<[A, B]>([chanA.latest, chanB.latest]);

    chanA.listeners.push((value: A) => zipped.send([value, chanB.latest]));
    chanB.listeners.push((value: B) => zipped.send([chanA.latest, value]));

    return zipped;
  }

  // How the mapped chan should handle the value
  protected __handleMapOpts<B>(
    opts: ((a: A) => B) | { f: (a: A) => B | typeof Chan.unchanged; def: B }
  ): {
    handleValue: (arg: { send: (b: B) => void; value: A }) => void;
    latest: B;
  } {
    if (typeof opts === "function") {
      // Case of a simple mapper
      const f = opts;
      return {
        handleValue: ({ send, value }) => send(f(value)),
        latest: f(this.latest),
      };
    }

    // Advanced case with "unchanged" handling, where sending is skipped on "unchanged" (and initial/latest value may
    // be set to "def")
    const result = opts.f(this.latest);

    return {
      handleValue: ({ send, value }) => {
        const result = opts.f(value);
        if (result !== Chan.unchanged) {
          send(result);
        }
      },
      latest: result === Chan.unchanged ? opts.def : result,
    };
  }

  // Read all the values sent to this `Chan`.
  values(): AsyncIterable<A> {
    const dup = this.map((x) => x);
    return dup.recv();
  }

  // When used directly as an async iterator, return values()
  [Symbol.asyncIterator](): AsyncIterator<A> {
    return this.values()[Symbol.asyncIterator]();
  }
}

/** Return a random string of size 10
 *
 * NOTE: this is not a very robust random, so do not use this for
 * anything requiring anything resembling true randomness.
 * */
export function randomString(): string {
  return (Math.random() + 1).toString(36).substring(2);
}

// Create a promise that will resolve _after_ this amount of milliseconds.
export function delayMillis(millis: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), millis);
  });
}

// Return a shuffled version of the array. Adapted from https://stackoverflow.com/a/12646864 to
// avoid shuffling in place.
export function shuffleArray<T>(array_: T[]): T[] {
  const array = [...array_];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Omit specified functions parameters, for instance OmitParams<..., "foo" | "bar">
// will transform
//  f: (a: { foo, bar, baz }) => void
// into
//  f: (a: { baz }) => void
//
// eslint-disable-next-line
export type OmitParams<T extends (arg: any) => any, A extends string> = (
  a: Omit<Parameters<T>[0], A>
) => ReturnType<T>;

// Zip two arrays together
export const zip = <A, B>(a: A[], b: B[]): [A, B][] =>
  Array.from(Array(Math.min(b.length, a.length)), (_, i) => [a[i], b[i]]);

export const isValidKey = <T>(
  key: string | number | symbol,
  keys: Array<keyof T>
): key is keyof T => {
  return keys.includes(key as keyof T);
};

```

## DApp Implementation

Here is a reference implementation for a DApp to request a delegation with ICRC-95: derivationOrigin.

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc34_delegation",
  "params": {
    "publicKey": "MDwwDAYKKwYBBAGDuEMBAgMsAAoAAAAAAGAAJwEB9YN/ErQ8yN+14qewhrU0Hm2rZZ77SrydLsSMRYHoNxM=",
    "icrc95_derivationOrigin": "https://app.nfidvaults.com",
    "targets": [
      "xhy27-fqaaa-aaaao-a2hlq-cai"
    ],
    "maxTimeToLive": "28800000000000"
  }
}
```