import { IConnectionFilter, IListener } from "./types";

/**
 * the default is to deny all connections (empty whitelist)
 * if you need an "allow all" filter, set it to empty blacklist
 */
export function generateDefaultFilter(): IConnectionFilter {
  return {
    kind: "whitelist",
    list: [],
  };
}

export function defaultListener(): IListener {
  return window;
}

export function isEqualUint8Arr(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

export async function delay(ms: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export enum ErrorCode {
  UNSUPPORTED_FEATURE = "IRCR35_UNSUPPORTED_FEATURE",
  UNEXPECTED_PEER = "ICRC35_UNEXPECTED_PEER",
  INVALID_STATE = "ICRC35_INVALID_STATE",
  UNREACHEABLE = "ICRC35_UNREACHEABLE",
}

export class ICRC35Error<E extends Error> extends Error {
  cause?: E;

  constructor(public code: ErrorCode, msg?: string, ops?: { cause: E }) {
    super(msg);
    this.cause = ops?.cause;
  }

  toString() {
    return `<ICRC-35> ${super.toString()}`;
  }
}

function makeTime() {
  const now = new Date();

  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  const s = now.getSeconds().toString().padStart(2, "0");

  return `${h}:${m}:${s}`;
}

export function log(...args: any[]) {
  console.log(`[${makeTime()}]`, "<ICRC-35>", ...args);
}

export function err(...args: any[]) {
  console.error(`[${makeTime()}]`, "<ICRC-35>", ...args);
}

/**
 * Opens a new window at <origin> + '/icrc35' and does some assertions to make sure it was indeed opened.
 * Throws an error otherwise.
 */
export function openICRC35Window(origin: string | URL): { peer: Window; peerOrigin: string } {
  // force it to be a URL
  if (!(origin instanceof URL)) {
    origin = new URL(origin);
  }

  // force it to be an origin
  origin = origin.origin;

  const w = window.open(new URL("/icrc-35", origin), "_blank");

  if (w === null) {
    throw new ICRC35Error(ErrorCode.UNSUPPORTED_FEATURE, "Unable to open a new browser window");
  }

  return { peer: w, peerOrigin: origin };
}
