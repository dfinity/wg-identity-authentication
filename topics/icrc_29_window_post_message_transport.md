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

A [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) communication channel is initiated by the relying party. The relying party opens a new window and waits for the signer to send a message indicating that it is ready for interactions.
The message is a [JSON-RPC 2.0](https://www.jsonrpc.org/specification) notification with the method `icrc29_ready` and no parameters:

```json
{
    "jsonrpc": "2.0",
    "method": "icrc29_ready"
}
```

After this message has been received, the relying party can send [ICRC-25](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md) messages to the signer
using the [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.

## Authentication

* The relying party must authenticate the signer by the `origin` of the window that it opens.
* The singer must authenticate the relying party by the `origin` property of the `message` event that it received.

## Sending Messages

Messages are sent by calling `window.postMessage` on the signer window, or the `window.opener` respectively.
When sending messages, the `targetOrigin` parameter must be set to the origin of the signer or relying party window.

The relying party may close the signer window in between interactions. If the relying party wants to continue a session after having closed the window, it must again go through the process of [establishing a communication channel](#establishing-a-communication-channel). 

After sending a message, the relying party should wait for the signer to send a response before closing the window. If the window is closed before the signer has sent a response, the relying party must not make any assumptions about the state of the request.

## Error Handling

### Unexpectedly Closed Window

If the signer window is closed unexpectedly, the relying party should handle this as if it had received a `NOT_GRANTED` error.
Closing the window does _not_ end the session (see  [ICRC-25 session](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md#sessions)), and the relying party can open a new window and continue the session.

### Invalid Messages

If either party receives malformed, unexpected, or otherwise invalid messages, it should ignore them.
