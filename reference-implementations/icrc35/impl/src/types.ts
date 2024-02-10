import z from "zod";

// ------------ PROTOCOL TYPES START --------------

export const ZMsgKind = z.enum([
  "HandshakeInit",
  "HandshakeComplete",
  "Ping",
  "Pong",
  "ConnectionClosed",
  "Common",
  "Request",
  "Response",
]);

export const ZICRC35Base = z.object({
  domain: z.literal("icrc-35"),
});

export const ZHandshakeInitMsg = ZICRC35Base.extend({
  kind: z.literal(ZMsgKind.Enum.HandshakeInit),
}).strict();
export const ZHandshakeCompleteMsg = ZICRC35Base.extend({
  kind: z.literal(ZMsgKind.Enum.HandshakeComplete),
}).strict();

export const ZPingMsg = ZICRC35Base.extend({
  kind: z.literal(ZMsgKind.Enum.Ping),
}).strict();
export const ZPongMsg = ZICRC35Base.extend({
  kind: z.literal(ZMsgKind.Enum.Pong),
}).strict();

export const ZConnectionClosedMsg = ZICRC35Base.extend({
  kind: z.literal(ZMsgKind.Enum.ConnectionClosed),
}).strict();

export const ZCommonMsg = ZICRC35Base.extend({
  kind: z.literal(ZMsgKind.Enum.Common),
  payload: z.any(),
});

export const ZRequestId = z.string().uuid();
export const ZRoute = z.string().url();

export const ZRequestMsg = ZICRC35Base.extend({
  kind: z.literal(ZMsgKind.Enum.Request),
  requestId: ZRequestId,
  route: ZRoute,
  payload: z.any(),
});

export const ZResponseMsg = ZICRC35Base.extend({
  kind: z.literal(ZMsgKind.Enum.Response),
  requestId: ZRequestId,
  payload: z.any(),
});

export const ZMsg = z.discriminatedUnion("kind", [
  ZHandshakeInitMsg,
  ZHandshakeCompleteMsg,
  ZPingMsg,
  ZPongMsg,
  ZConnectionClosedMsg,
  ZCommonMsg,
  ZRequestMsg,
  ZResponseMsg,
]);

export type EMsgKind = z.infer<typeof ZMsgKind>;

export type IHandshakeInitMsg = z.infer<typeof ZHandshakeInitMsg>;
export type IHandshakeCompleteMsg = z.infer<typeof ZHandshakeCompleteMsg>;

export type IPongMsg = z.infer<typeof ZPongMsg>;
export type IPingMsg = z.infer<typeof ZPingMsg>;

export type IConnectionClosedMsg = z.infer<typeof ZConnectionClosedMsg>;

export type TRequestId = z.infer<typeof ZRequestId>;
export type TRoute = z.infer<typeof ZRoute>;
export type ICommonMsg = z.infer<typeof ZCommonMsg>;
export type IRequestMsg = z.infer<typeof ZRequestMsg>;
export type IResposeMsg = z.infer<typeof ZResponseMsg>;

export type IMsg = z.infer<typeof ZMsg>;

// ------------ PROTOCOL TYPES END --------------
// ------------- ADDITIONAL TYPES START --------------

export const ZOrigin = z.string().url();
export const ZPeer = z.custom<IPeer>((val) => {
  const res =
    typeof val === "object" && "postMessage" in (val as object) && typeof (val as IPeer).postMessage === "function";

  return res;
});
export const ZListener = z.custom<IListener>((val) => {
  const res =
    typeof val === "object" &&
    "addEventListener" in (val as object) &&
    "removeEventListener" in (val as object) &&
    "origin" in (val as object) &&
    typeof (val as IListener).addEventListener === "function" &&
    typeof (val as IListener).removeEventListener === "function" &&
    typeof (val as IListener).origin === "string";

  return res;
});

export const ZConnectionFilter = z
  .object({
    kind: z.enum(["blacklist", "whitelist"]),
    list: z.array(ZOrigin),
  })
  .strict();

export const ZEndpointParentMode = z.object({
  mode: z.literal("parent"),
  peerOrigin: ZOrigin,
});
export const ZEndpointChildMode = z.object({
  mode: z.literal("child"),
  connectionFilter: z.optional(ZConnectionFilter),
});
export const ZEndpointMode = z.discriminatedUnion("mode", [ZEndpointParentMode, ZEndpointChildMode]);

export const ZEndpointModeKind = z.enum(["parent", "child"]);

export const ZICRC35ConnectionConfig = z.object({
  peer: ZPeer,
  listener: z.optional(ZListener),
  mode: ZEndpointModeKind,
  peerOrigin: z.optional(ZOrigin),
  connectionFilter: z.optional(ZConnectionFilter),
  debug: z.optional(z.boolean()),
});

export type TOrigin = z.infer<typeof ZOrigin>;
export interface IPeer {
  postMessage: (message: any, targetOrigin: string, transfer?: Transferable[]) => void;
}
export interface IListener {
  origin: string;
  addEventListener(event: "message", listener: (ev: MessageEvent<any>) => void): void;
  removeEventListener(event: "message", listener: (ev: MessageEvent<any>) => void): void;
}
export type IConnectionFilter = z.infer<typeof ZConnectionFilter>;
export type IEndpointParentMode = z.infer<typeof ZEndpointParentMode>;
export type IEndpointChildMode = z.infer<typeof ZEndpointChildMode>;
export type EEndpointModeKind = z.infer<typeof ZEndpointModeKind>;
export type IEndpointMode = z.infer<typeof ZEndpointMode>;

interface ICRC35ConnectionConfig<P extends IPeer, L extends IListener> {
  /**
   * Remote peer window or iFrame object
   */
  peer: P;
  /**
   * Self peer window object
   */
  listener?: L;
  /**
   * Debug mode
   */
  debug?: boolean;
  /**
   * 'parent' or 'child', depending on the side the connection is established from
   */
  mode: EEndpointModeKind;
}

export interface ICRC35ConnectionChildConfig<P extends IPeer, L extends IListener>
  extends ICRC35ConnectionConfig<P, L> {
  /**
   * A filter that automatically filters out incoming connections
   */
  connectionFilter: IConnectionFilter;
}

export interface ICRC35ConnectionParentConfig<P extends IPeer, L extends IListener>
  extends ICRC35ConnectionConfig<P, L> {
  /**
   * The origin of the child peer.
   */
  peerOrigin: TOrigin;
}

export type ResolveFn<T extends void = void> = (v: T | PromiseLike<T>) => void;
export type RejectFn = (reason?: any) => void;

export type HandlerFn = (msg: any) => void;
export type ConnectionClosedReason = "closed by this" | "closed by peer" | "timed out";
export type AfterCloseHandlerFn = (reason: ConnectionClosedReason) => void;
export type BeforeCloseHandlerFn = () => void;
export type RequestHandlerFn<T> = (request: ICRC35AsyncRequest<T>) => void;

export interface IICRC35Connection {
  /**
   * Origin of the remote peer.
   */
  readonly peerOrigin: TOrigin;
  /**
   * Sends Common messages (fire-and-forget).
   * Optionally accepts an array of Transferable objects for faster zero-copy transfer
   */
  sendCommonMessage(msg: any, transfer?: Transferable[]): void;
  /**
   * Adds an event listener that triggers when a Common message received
   */
  onCommonMessage(handler: HandlerFn): void;
  /**
   * Remove an event listener for Common messages
   */
  removeCommonMessageHandler(handler: HandlerFn): void;
  /**
   * Close the connection explicitly
   */
  close(): void;
  /**
   * Adds an event listener that triggers before the connection is closed.
   * Handlers can still send messages.
   */
  onBeforeConnectionClosed(handler: BeforeCloseHandlerFn): void;
  /**
   * Removes an event listener that triggers before the connection is closed.
   */
  removeBeforeConnectionClosedHandler(handler: BeforeCloseHandlerFn): void;
  /**
   * Adds an event listener that triggers after the connection is closed.
   * Handler can't send messages. Handler receives a reason-string as an argument.
   */
  onAfterConnectionClosed(handler: AfterCloseHandlerFn): void;
  /**
   * Removes an event listener that triggers after the connection is closed.
   */
  removeAfterConnectionClosedHandler(handler: AfterCloseHandlerFn): void;
  /**
   * Sends a Request message to the supplied Route.
   * Optionally accepts an array of Transferable objects for faster zero-copy transfer
   */
  request<T extends unknown, R extends unknown>(route: TRoute, request: T, transfer?: Transferable[]): Promise<R>;
  /**
   * Sends a Response message by the requestId.
   * Optionally accepts an array of Transferable objects for faster zero-copy transfer
   */
  respond<T extends unknown>(requestId: TRequestId, response: T, transfer?: Transferable[]): void;
  /**
   * Adds an event listener that triggers after a Request message of a specified route is received.
   */
  onRequest<T>(route: TRoute, handler: RequestHandlerFn<T>): void;
  /**
   *  Removes an event listener that triggers after a Request message of a specified route is received.
   */
  removeRequestHandler<T>(route: TRoute, handler: RequestHandlerFn<T>): void;
  /**
   * Returns `true` if the connection is operational. Returns `false` if the connection is closed.
   */
  isActive(): boolean;
}

/**
 * Request object that simplifies decoupling of components.
 */
export class ICRC35AsyncRequest<T extends unknown> {
  private connection: IICRC35Connection;
  private inProgress: boolean;
  public readonly requestId: TRequestId;
  public readonly peerOrigin: TOrigin;
  public readonly route: TRoute;
  public readonly payload: T;

  constructor(init: {
    connection: IICRC35Connection;
    requestId: TRequestId;
    peerOrigin: TOrigin;
    route: TRoute;
    payload: T;
  }) {
    this.connection = init.connection;
    this.inProgress = true;
    this.requestId = init.requestId;
    this.peerOrigin = init.peerOrigin;
    this.route = init.route;
    this.payload = init.payload;
  }

  respond<T extends unknown>(response: T, transfer?: Transferable[]) {
    if (!this.inProgress) return;
    this.inProgress = false;

    this.connection.respond(this.requestId, response, transfer);
  }

  closeConnection() {
    this.connection.close();
  }
}

// ------------- ADDITIONAL TYPES END --------------
