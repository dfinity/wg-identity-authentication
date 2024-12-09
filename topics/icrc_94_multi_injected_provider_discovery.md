# ICRC-94: Browser Extension Discovery and Transport

![DRAFT] [![EXTENDS 25]](./icrc_25_signer_interaction_standard.md)

**Authors:** [Thomas Gladdines](https://github.com/sea-snake), [Dan Ostrovsky](https://github.com/dostro)

## Summary

This standard defines a transport channel to
send [ICRC-25](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md)
messages from a relying party to a signer. It uses a discovery mechanism for browser extensions which supports
discovering multiple injected providers in a web page using Javascript's window events.

See Ethereum's EIP-6963 for original inspiration.

## Terminology

* signer: A service that manages a user's keys and can sign and perform canister calls on their behalf.
* relying party: A service that wants to request calls on a specific canister.
* provider: An object that contains signer metadata and a communication channel method.

## Provider

For an signer extension to be discoverable it must implement a listener that dispatches an event with a provider:

```ts
// The object should be frozen to prevent modifications
const providerDetail = Object.freeze({
    // Globally unique identifier that must be UUIDv4 compliant
    uuid: 'b5ec333c-8854-47bd-be77-74059e0c64d6',
    // Plain text name of the signer
    name: 'Example',
    // URI pointing to an image that must be a data URI scheme
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
    // Domain name in reverse syntax ordering
    rdns: 'com.example.subdomain',
    // Communication channel for relying party to send and receive JSON-RPC messages
    sendMessage: async (message) => {
        // Handle request JSON-RPC object and return response JSON-RPC object 
    },
    // Dismiss the extension window
    dismiss: async () => {
        // In case the extension window is already dismissed,
        // invocation of this method should be handled as a noop.
    },
});

const event = new CustomEvent('icrc94:announceProvider', {detail: providerDetail});
window.addEventListener('icrc94:requestProvider', () => window.dispatchEvent(event));
```

## Discovery

To discover an injected provider, the relying party must implement a listener and then dispatch an event:

```ts
window.addEventListener('icrc94:announceProvider', (event) => {
    // The provider detail can be found in the `detail` property of the event
});
window.dispatchEvent(new CustomEvent('icrc94:requestProvider'));
```

## Communication Channel

After a provider has been discovered, the relying party can use its `sendMessage` method to send JSON-RPC messages and
receive responses:

```ts
const response = await provider.sendMessage({
    id: 1,
    jsonrpc: '2.0',
    method: `icrc25_supported_standards`
});
await provider.dismiss();
alert(`Signer supports ${response.result.length} standards`);
```

The extension should not automatically close its window after returning a response. Instead the relying party
is expected to use the `dismiss` method to dismiss the extension window after it's done sending messages.

## Error Handling

### Unexpectedly Closed Extension Window

In case the extension window is unexpectedly closed before the required user interaction to send a JSON-RPC response,
e.g. by the browser after losing focus. The extension should dispatch a `icrc94:unexpectedlyClosed` event to make the
relying party aware.

The relying party can then subsequently inform the user to make a decision e.g. choose to re-attempt the JSON-RPC call.

### Invalid Messages

If either party receives malformed, unexpected, or otherwise invalid messages, it should ignore them.

[DRAFT]: https://img.shields.io/badge/STATUS-DRAFT-f25a24.svg

[EXTENDS 25]: https://img.shields.io/badge/EXTENDS-ICRC--25-ed1e7a.svg