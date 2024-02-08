import {
  AfterCloseHandlerFn,
  BeforeCloseHandlerFn,
  ConnectionClosedReason,
  HandlerFn,
  ICRC35ConnectionChildConfig,
  ICRC35ConnectionParentConfig,
  IConnectionClosedMsg,
  ICommonMsg,
  IEndpointChildMode,
  IEndpointParentMode,
  IHandshakeCompleteMsg,
  IHandshakeInitMsg,
  IICRC35Connection,
  IListener,
  IPeer,
  IPingMsg,
  IPongMsg,
  RejectFn,
  ResolveFn,
  TOrigin,
  ZConnectionClosedMsg,
  ZCommonMsg,
  ZEndpointChildMode,
  ZEndpointParentMode,
  ZHandshakeCompleteMsg,
  ZHandshakeInitMsg,
  ZICRC35ConnectionConfig,
  ZMsg,
  ZPingMsg,
  ZPongMsg,
  IRequestMsg,
  IResposeMsg,
  ZRequestMsg,
  ZResponseMsg,
  TRequestId,
  TRoute,
  ZRoute,
  ICRC35AsyncRequest,
  RequestHandlerFn,
} from "./types";
import { ErrorCode, ICRC35Error, generateDefaultFilter, defaultListener, log } from "./utils";
import { DEFAULT_DEBUG, ICRC35_CONNECTION_TIMEOUT_MS, ICRC35_PING_TIMEOUT_MS } from "./consts";

/**
 * ICRC35 Connection that is established between peers in order to exchange messages.
 */
export class ICRC35Connection<P extends IPeer, L extends IListener> implements IICRC35Connection {
  private _peer: P | null = null;
  private _peerOrigin: TOrigin | null = null;
  private _listener: L;
  private mode: IEndpointChildMode | IEndpointParentMode;
  private lastReceivedMsgTimestamp: number = 0;
  private commonMsgHandlers: HandlerFn[] = [];
  private beforeCloseHandlers: BeforeCloseHandlerFn[] = [];
  private afterCloseHandlers: AfterCloseHandlerFn[] = [];

  private sentRequests: Record<TRequestId, [ResolveFn<any>, RejectFn]> = {};
  private requestsInProcess: TRequestId[] = [];
  private requestHandlers: Record<TRoute, RequestHandlerFn<any>[]> = {};

  private debug: boolean;

  /**
   * Creates a connection and starts the Handshake Phase.
   * The returned Promise is resolved when the Handshake Phase is over
   * and the connection is ready to send and receive messages.
   */
  static async establish<P extends IPeer, L extends IListener>(
    config: ICRC35ConnectionChildConfig<P, L> | ICRC35ConnectionParentConfig<P, L>
  ): Promise<IICRC35Connection> {
    const it = new ICRC35Connection<P, L>(config);

    await new Promise<void>((resolve, reject) => {
      if (config.mode === "child") {
        it.childHandshake(resolve, reject);
      } else {
        it.parentHandshake(resolve, reject);
      }
    });

    it.listener.addEventListener("message", it.listen);
    it.initPingPong();

    return it;
  }

  sendCommonMessage(msg: any, transfer?: Transferable[]) {
    const _msg: ICommonMsg = {
      domain: "icrc-35",
      kind: "Common",
      payload: msg,
    };

    this.send(_msg, transfer);
  }

  onCommonMessage(handler: HandlerFn) {
    this.commonMsgHandlers.push(handler);
  }

  removeCommonMessageHandler(handler: HandlerFn) {
    const idx = this.commonMsgHandlers.indexOf(handler);
    if (idx < 0) return;

    this.commonMsgHandlers.splice(idx, 1);
  }

  close() {
    if (!this.isActive()) return;

    for (let beforeCloseHandler of this.beforeCloseHandlers) {
      beforeCloseHandler();
    }
    this.beforeCloseHandlers = [];

    const msg: IConnectionClosedMsg = {
      domain: "icrc-35",
      kind: "ConnectionClosed",
    };

    this.send(msg);

    this.handleConnectionClosed("closed by this");
  }

  onBeforeConnectionClosed(handler: BeforeCloseHandlerFn): void {
    this.beforeCloseHandlers.push(handler);
  }

  removeBeforeConnectionClosedHandler(handler: BeforeCloseHandlerFn): void {
    const idx = this.beforeCloseHandlers.indexOf(handler);
    if (idx < 0) return;

    this.beforeCloseHandlers.splice(idx, 1);
  }

  onAfterConnectionClosed(handler: AfterCloseHandlerFn) {
    this.afterCloseHandlers.push(handler);
  }

  removeAfterConnectionClosedHandler(handler: AfterCloseHandlerFn) {
    const idx = this.afterCloseHandlers.indexOf(handler);
    if (idx < 0) return;

    this.afterCloseHandlers.splice(idx, 1);
  }

  async request<T extends unknown, R extends unknown>(
    route: TRoute,
    request: T,
    transfer?: Transferable[]
  ): Promise<R> {
    const msg: IRequestMsg = {
      domain: "icrc-35",
      kind: "Request",
      route,
      requestId: crypto.randomUUID(),
      payload: request,
    };

    return new Promise<R>((resolve, reject) => {
      this.send(msg, transfer);
      this.sentRequests[msg.requestId] = [resolve, reject];
    });
  }

  respond<T extends unknown>(requestId: TRequestId, response: T, transfer?: Transferable[]) {
    const idx = this.requestsInProcess.indexOf(requestId);
    if (idx < 0) return;

    this.requestsInProcess.splice(idx, 1);

    const msg: IResposeMsg = {
      domain: "icrc-35",
      kind: "Response",
      requestId,
      payload: response,
    };

    this.send(msg, transfer);
  }

  onRequest<T>(route: string, handler: RequestHandlerFn<T>): void {
    if (!this.requestHandlers[route]) {
      this.requestHandlers[route] = [handler];
      return;
    }

    this.requestHandlers[route].push(handler);
  }

  removeRequestHandler<T>(route: string, handler: RequestHandlerFn<T>): void {
    if (!this.requestHandlers[route]) {
      return;
    }

    const idx = this.requestHandlers[route].indexOf(handler);
    this.requestHandlers[route].splice(idx, 1);
  }

  isActive(): this is { peer: P; peerOrigin: string } {
    return this._peer !== null && this._peerOrigin !== null;
  }

  get peer() {
    return this._peer;
  }

  get peerOrigin() {
    return this._peerOrigin!;
  }

  get listener() {
    return this._listener;
  }

  private send(msg: any, transfer?: Transferable[]) {
    if (!this.isActive()) throw new ICRC35Error(ErrorCode.INVALID_STATE, "Connection closed");

    this._peer!.postMessage(msg, this._peerOrigin!, transfer);

    if (this.debug) {
      log(this.listener.origin, "sent message", msg, "to", this._peerOrigin);
    }
  }

  private listen = (ev: MessageEvent<any>) => {
    // pass if the connection is already closed
    if (!this.isActive()) return;

    // ignore events coming from other origins
    if (ev.origin !== this.peerOrigin) return;

    const res = ZMsg.safeParse(ev.data);

    // ignore non-icrc35 messages
    if (!res.success) return;

    if (this.debug) {
      log(this.listener.origin, "received message", ev.data, "from", ev.origin);
    }

    switch (res.data.kind) {
      case "ConnectionClosed": {
        const r = ZConnectionClosedMsg.safeParse(res.data);
        if (!r.success) return;

        this.handleConnectionClosed("closed by peer");
        return;
      }
      case "Ping": {
        const r = ZPingMsg.safeParse(res.data);
        if (!r.success) return;

        this.handlePing();
        return;
      }
      case "Pong": {
        const r = ZPongMsg.safeParse(res.data);
        if (!r.success) return;

        this.handlePong();
        return;
      }
      case "Common": {
        const r = ZCommonMsg.safeParse(res.data);
        if (!r.success) return;

        this.handleCommon(r.data.payload);
        return;
      }
      case "Request": {
        const r = ZRequestMsg.safeParse(res.data);
        if (!r.success) return;

        this.handleRequest(r.data);
        return;
      }
      case "Response": {
        const r = ZResponseMsg.safeParse(res.data);
        if (!r.success) return;

        this.handleResponse(r.data);
        return;
      }

      // ignore other messages
      default:
        return;
    }
  };

  private handleRequest(msg: IRequestMsg) {
    const route = ZRoute.parse(msg.route);

    const request = new ICRC35AsyncRequest({
      connection: this as IICRC35Connection,
      requestId: msg.requestId,
      peerOrigin: this.peerOrigin!,
      route: route,
      payload: msg.payload,
    });

    // ignore requests with no handler
    if (!this.requestHandlers[route]) {
      return;
    }

    this.requestsInProcess.push(request.requestId);

    for (let handler of this.requestHandlers[route]) {
      handler(request);
    }
  }

  private handleResponse(msg: IResposeMsg) {
    // ignore responses for non-existing requests
    if (!(msg.requestId in this.sentRequests)) {
      return;
    }

    const [resolve, _] = this.sentRequests[msg.requestId];
    resolve(msg.payload);

    delete this.sentRequests[msg.requestId];
  }

  // this function will check the last interaction time
  // if this time was more than the <ping timeout> seconds ago, it will send a ping message, to which the other side should respond with pong
  // if there is no response for <connection timeout> seconds, the connection will be closed as stale
  private async initPingPong() {
    const int = setInterval(() => {
      if (!this.isActive()) {
        clearInterval(int);
        return;
      }

      const delta = Date.now() - this.lastReceivedMsgTimestamp;

      if (delta >= ICRC35_CONNECTION_TIMEOUT_MS) {
        this.handleConnectionClosed("timed out");
        clearInterval(int);
        return;
      }

      if (delta >= ICRC35_PING_TIMEOUT_MS) {
        const msg: IPingMsg = {
          domain: "icrc-35",
          kind: "Ping",
        };

        this.send(msg);

        return;
      }
    }, ICRC35_PING_TIMEOUT_MS);
  }

  private handleConnectionClosed(reason: ConnectionClosedReason) {
    this._peer = null;
    this.listener.removeEventListener("message", this.listen);
    this.commonMsgHandlers = [];

    Object.values(this.sentRequests).forEach(([_, reject]) =>
      reject(new ICRC35Error(ErrorCode.INVALID_STATE, `connection ${reason}`))
    );

    this.sentRequests = {};

    for (let afterCloseHandler of this.afterCloseHandlers) {
      afterCloseHandler(reason);
    }

    this.afterCloseHandlers = [];
    this.requestHandlers = {};
  }

  private handlePing() {
    this.updateTimestamp();

    const msg: IPongMsg = {
      domain: "icrc-35",
      kind: "Pong",
    };

    this.send(msg);
  }

  private handlePong() {
    this.updateTimestamp();
  }

  private handleCommon(data: any) {
    this.updateTimestamp();

    for (let commonMsgHandler of this.commonMsgHandlers) {
      commonMsgHandler(data);
    }
  }

  private updateTimestamp() {
    this.lastReceivedMsgTimestamp = Date.now();
  }

  private constructor(config: ICRC35ConnectionChildConfig<P, L> | ICRC35ConnectionParentConfig<P, L>) {
    const parsedConfig = ZICRC35ConnectionConfig.parse(config);

    this._peer = parsedConfig.peer as P;
    if (!parsedConfig.listener) {
      this._listener = defaultListener() as L;
    } else {
      this._listener = parsedConfig.listener as L;
    }

    this.debug = parsedConfig.debug || DEFAULT_DEBUG;

    if (parsedConfig.mode === "parent") {
      this.mode = ZEndpointParentMode.parse(parsedConfig);
      this._peerOrigin = parsedConfig.peerOrigin!;
    } else {
      this.mode = ZEndpointChildMode.parse(parsedConfig);
    }
  }

  private childHandshake(resolve: ResolveFn, reject: RejectFn) {
    if (this.debug) {
      log(this.listener.origin, "child-level handshake started...");
    }

    const handler = (ev: MessageEvent<any>) => {
      // pass other events originated from this page
      if (ev.origin === this.listener.origin) return;

      // pass other events
      const res = ZHandshakeCompleteMsg.safeParse(ev.data);
      if (!res.success) return;

      if (this.debug) {
        log(this.listener.origin, "received message", ev.data, "from", ev.origin);
      }

      if (this.debug) {
        log(this.listener.origin, `child-level handshake complete, peer origin = ${ev.origin}`);
      }

      this.updateTimestamp();
      this._peerOrigin = ev.origin;
      this.listener.removeEventListener("message", handler);

      if (!this.childExpectsPeer(ev.origin)) {
        this.close();

        reject(new ICRC35Error(ErrorCode.UNEXPECTED_PEER, `Did not expect a connection from peer '${ev.origin}'`));

        return;
      }

      resolve();
    };

    this.listener.addEventListener("message", handler);

    const msg: IHandshakeInitMsg = {
      domain: "icrc-35",
      kind: "HandshakeInit",
    };

    this._peer!.postMessage(msg, "*");

    if (this.debug) {
      log(this.listener.origin, "sent message", msg, "to *");
    }
  }

  private parentHandshake(resolve: ResolveFn, reject: RejectFn) {
    if (this.debug) {
      log(this.listener.origin, "parent-level handshake started...");
    }

    const handler = (ev: MessageEvent<any>) => {
      // pass other events originated from this page
      if (ev.origin === this.listener.origin) return;

      // pass other events
      const res = ZHandshakeInitMsg.safeParse(ev.data);
      if (!res.success) return;

      if (this.debug) {
        log(this.listener.origin, "received message", ev.data, "from", ev.origin);
      }

      this.updateTimestamp();

      const msg: IHandshakeCompleteMsg = {
        domain: "icrc-35",
        kind: "HandshakeComplete",
      };

      this.send(msg);

      if (this.debug) {
        log(this.listener.origin, `parent-level handshake complete, peer origin = ${this._peerOrigin}`);
      }

      this.listener.removeEventListener("message", handler);
      resolve();
    };

    this.listener.addEventListener("message", handler);
  }

  // returns true if the peer origin is valid
  private childExpectsPeer(peerOrigin: string): boolean {
    let filter = (this.mode as IEndpointChildMode).connectionFilter;

    // create a default filter (deny all)
    if (!filter) {
      filter = generateDefaultFilter();
      (this.mode as IEndpointChildMode).connectionFilter = filter;
    }

    if (filter.kind === "blacklist") {
      return !filter.list.includes(peerOrigin);
    } else {
      return filter.list.includes(peerOrigin);
    }
  }
}
