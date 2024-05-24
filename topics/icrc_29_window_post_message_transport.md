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
The message sent by the relaying party is a [JSON-RPC 2.0](https://www.jsonrpc.org/specification) call with method `icrc29_status` and no parameters:

```json
{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "icrc29_status"
}
```

The signer should reply with a message indicating that it is ready to receive additional messages:

```json
{
    "jsonrpc": "2.0",
    "id": "1",
    "result": "ready"
}
```

> **Note**: The relying party should send `icrc29_status` messages in short intervals. It is expected that some of the messages will be lost due to being sent before the signer is ready.

After the `"result": "ready"` response has been received, the relying party can send [ICRC-25](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md) messages to the signer
using the [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.

## Authentication

* The relying party must authenticate the signer by checking if the received message event `source` property is equal to the `window` that was opened.
* The signer must authenticate the relying party by checking if the received message event `origin` property is equal to the `origin` property in the previously received `icrc29_status` message event.

## Sending Messages

Messages are sent by calling `window.postMessage` on the signer window, or the `window.opener` respectively.
When sending messages from relying party to signer, the `targetOrigin` parameter must be omitted, so that the signer can redirect to a different origin when needed.
When sending messages from signer to relying party, the `targetOrigin` parameter must be set to the `origin` property in the previously received `icrc29_status` message event.

The relying party may close the signer window in between interactions. If the relying party wants to continue a session after having closed the window, it must again go through the process of [establishing a communication channel](#establishing-a-communication-channel). 

After sending a message, the relying party should wait for the signer to send a response before closing the window. If the window is closed before the signer has sent a response, the relying party must not make any assumptions about the state of the request.

The signer must not automatically close its window after sending a response to the relying party, since the relying party could possibly send additional messages to the signer. Instead, the relying party is expected to close the signer window when it is no longer needed.

## Error Handling

### Unexpectedly Closed Window

If the signer window is closed unexpectedly, the relying party should handle this as if it had received a `NOT_GRANTED` error.
Closing the window does _not_ end the session (see  [ICRC-25 session](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md#sessions)), and the relying party can open a new window and continue the session.

### Invalid Messages

If either party receives malformed, unexpected, or otherwise invalid messages, it should ignore them.
