import { IICRC35Connection } from "icrc-35";

export const GREET_ROUTE = "example:greet";

export class ExampleClient {
  constructor(private connection: IICRC35Connection) {}

  async greet(name: string): Promise<ISharedResponse> {
    const res = await this.connection.request(GREET_ROUTE, { name });

    if (
      typeof res === "object" &&
      (res as ISharedResponse).result &&
      typeof (res as ISharedResponse).result === "string"
    ) {
      return res as ISharedResponse;
    }

    throw new Error("Invalid response");
  }
}

export class ExampleServer {
  constructor(private connection: IICRC35Connection) {}

  onGreet(handler: (name: string) => string) {
    this.connection.onRequest<ISharedRequest>(GREET_ROUTE, (req) => {
      if (typeof req.payload !== "object" || !req.payload.name || typeof req.payload.name !== "string") {
        throw new Error("Invalid request");
      }

      req.respond<ISharedResponse>({ result: handler(req.payload.name) });

      this.connection.close();
      window.close();
    });
  }
}

export interface ISharedRequest {
  name: string;
}

export interface ISharedResponse {
  result: string;
}
