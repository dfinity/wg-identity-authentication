import { ExampleServer } from "example-icrc35-shared-library";
import { ICRC35Connection } from "icrc-35";

if (window.location.pathname !== "/icrc-35") {
  alert("Wrong ICRC-35 path: go to /icrc-35");
}

if (!window.opener) {
  alert("No ICRC-35 peer detected");
}

window.addEventListener("load", async () => {
  // establish ICRC-35 connection
  const connection = await ICRC35Connection.establish({
    mode: "child",
    connectionFilter: {
      kind: "blacklist",
      list: [],
    },
    peer: window.opener,
    debug: true,
  });

  const server = new ExampleServer(connection);

  server.onGreet((name) => `Hello, ${name}`);
});
