# ICRC-29: Window Post Message Transport for ICRC-25

| Status |
|:------:|
| Draft  |

## Summary

This standard defines a transport channel to send [ICRC-25](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md) messages from a relying party to a signer. The transport channel is based on the [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.

## Terminology

* signer: A service that manages a user's keys and can sign and perform canister calls on their behalf.
* relying party: A service that wants to request calls on a specific canister.

## Trust Assumption
For this standard to represent an [ICRC-25](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md) compliant transport channel, the following assumptions must hold:
* The user's machine is not compromised. In particular, the browser must deliver messages unchanged and represent the `origin` of the different parties correctly.
* DNS entries are not compromised. The user's machine must be able to resolve the domain names of the relying party and signer correctly.

## Establishing a Communication Channel

A [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) communication channel is initiated by the relying party. The relying party opens a new window and polls repeatedly for the signer to reply with a message indicating that it is ready for interactions.
The message sent by the relying party has `targetOrigin` set to `'*'` and is a [JSON-RPC 2.0](https://www.jsonrpc.org/specification) call with method `icrc29_status` and no parameters:

```json
{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "icrc29_status"
}
```

The signer should reply with a message indicating that it is ready to receive additional messages.
The message `targetOrigin` should be set to the previously received `icrc29_status` message its `origin` property value.

```json
{
    "jsonrpc": "2.0",
    "id": "1",
    "result": "ready"
}
```

> **Note**: The relying party should send `icrc29_status` messages in short intervals. It is expected that some of the messages will be lost due to being sent before the signer is ready.

After the `"result": "ready"` response has been received within a reasonable timeframe, the relying party can send [ICRC-25](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md) messages to the signer
using the [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.

## Signer

The `origin` and `source` values of the received message `icrc29_status` when the communication channel was established,
are mentioned below as `establishedOrigin` and `establishedSource` respectively.

Messages are received by listening to `message` events, messages are considered as coming from relying party if both:
- The received message `origin` property is equal to the `establishedOrigin`.
- The received message `source` property is equal to the `establishedSource`.

Messages are sent by calling the `postMessage` method on the `establishedSource` with the `targetOrigin` parameter set to `establishedOrigin`.

The window must not be automatically closed after sending a message, since the relying party could possibly send additional messages. 
Instead, the relying party is responsible for closing the signer window.

## Relying party

The `origin` value of the received message `"result": "ready"` when the communication channel was established,
is mentioned below as `establishedOrigin`.

The `window` that was opened for the signer is mentioned below as `signerWindow`.

Messages are received by listening to `message` events, messages are considered as coming from signer if both:
- The received message `origin` property is equal to the `establishedOrigin`.
- The received message `source` property is equal to the `signerWindow`.

Messages are sent by calling the `postMessage` method on the `signerWindow` with the `targetOrigin` parameter set to `establishedOrigin`.

Make sure to call the `close` method on the `signerWindow` after it is no longer needed.  
After having closed the window, the signer must again go through the process of [establishing a communication channel](#establishing-a-communication-channel).

## Error Handling

### Unexpectedly Closed Window

If the signer window is closed unexpectedly, the relying party should handle this as if it had received a `NOT_GRANTED` error.
Closing the window does _not_ end the session (see  [ICRC-25 session](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md#sessions)), and the relying party can open a new window and continue the session.

### Invalid Messages

If either party receives malformed, unexpected, or otherwise invalid messages, it should ignore them.
