import { ExampleClient } from "example-icrc35-shared-library";
import { ICRC35Connection, openICRC35Window } from "icrc-35";

const btn = document.getElementById("greet-btn")!;
const input = document.getElementById("greet-input")! as HTMLInputElement;

btn.addEventListener("click", async () => {
  // establish a connection
  const connection = await ICRC35Connection.establish({
    mode: "parent",
    debug: true,
    ...openICRC35Window("http://localhost:8092"),
  });

  // create a client
  const client = new ExampleClient(connection);

  // call remote method
  const greeting = await client.greet(input.value);

  // alert the result (timeout is to not block the browser window)
  setTimeout(() => alert(greeting.result), 10);
});
