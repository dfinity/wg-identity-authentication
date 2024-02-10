/**
 * The connection timeout - how much time should pass without receiving any messages
 * from a remote peer, before the connection is considered CLOSED
 */
export const ICRC35_CONNECTION_TIMEOUT_MS = 1000 * 30;

/**
 * The maintenance interval - how much time should pass after the last received message,
 * before a peer should send a Ping message to its peer.
 */
export const ICRC35_PING_TIMEOUT_MS = 1000 * 5;

/**
 * By default, default mode is disabled.
 */
export const DEFAULT_DEBUG = false;
