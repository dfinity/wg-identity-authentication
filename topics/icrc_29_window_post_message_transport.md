# ICRC-29: Window Post Message Transport for ICRC-25

[![Status Badge](https://img.shields.io/badge/STATUS-WG_APPROVED-purple.svg)](https://github.com/orgs/dfinity/projects/31)

## Summary

This standard defines a transport channel to send [ICRC-25](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md) messages from a relying party to a signer. The transport channel is based on the [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.

## Terminology

* signer: A service that manages a user's keys and can sign and perform canister calls on their behalf.
* relying party: A service that wants to request calls on a specific canister.

## Trust Assumption
For this standard to represent an [ICRC-25](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md) compliant transport channel, the following assumptions must hold:
* The user's machine is not compromised. In particular, the browser must deliver messages unchanged and represent the `origin` of the different parties correctly.
* DNS entries are not compromised. The user's machine must be able to resolve the domain names of the relying party and signer correctly.

## Communication Channel

The relying party initiates and maintains the communication channel by opening a new window for the signer and periodically sending `icrc29_status` messages using the [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API to indicate it is ready for interactions.

The message has `targetOrigin` set to `'*'` and is a [JSON-RPC 2.0 (https://www.jsonrpc.org/specification) call with method `icrc29_status` and no parameters:

```json
{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "icrc29_status"
}
```

The signer should respond to every `icrc29_status` messsage received to indicate it is ready to receive additional messages. The response message `targetOrigin` should be set to the received `icrc29_status` message its `origin` property value:
```json
{
    "jsonrpc": "2.0",
    "id": "1",
    "result": "ready"
}
```

### Establishment

The connection is considered established once the relying party receives a `"result": "ready"` response to an `icrc29_status` message fromt the signer. This may not necessarily be a response to the first message sent by the relying party, since it might take some time for the signer to be ready. In case the relying party does not receive this response within a reasonable timeframe, it should treat this as a failure to establish the connection.

Once the connection is established, the relying party must continue sending `icrc29_status` messages at regular intervals to maintain the connection.

### Heartbeats

As mentioned above, the relying party continues to send periodic `icrc29_status` messages intended as heartbeat signals, and the signer responds to each received heartbeat with `"result": "ready"`. If the relying party does not receive responses for a given timeframe, it should treat this as a disconnection and stop sending `icrc29_status`
messages.

## Relying party

> The `origin` value of the first received reply to a `icrc29_status` message with `"result": "ready"` when establishing the communication channel, is mentioned below as `establishedOrigin`.
>
> The `window` that was opened for the signer is mentioned below as `signerWindow`.

Messages are received by listening to [message](https://developer.mozilla.org/en-US/docs/Web/API/Window/message_event) events and are considered as coming from signer if both:
- The received message `origin` property is equal to the `establishedOrigin`.
- The received message `source` property is equal to the `signerWindow`.

Messages are sent by calling the `postMessage` method on the `signerWindow` with the `targetOrigin` parameter set to `establishedOrigin`.

The relying party should call the `close` method on the `signerWindow` after it is no longer needed.  
After having closed the window, the signer must again go through the process of [establishing a communication channel](#communication-channel).

## Signer

> The `origin` and `source` values of the received message `icrc29_status` when the communication channel was established, are mentioned below as `establishedOrigin` and `establishedSource` respectively.

Messages are received by listening to `message` events and are considered as coming from relying party if both:
- The received message `origin` property is equal to the `establishedOrigin`.
- The received message `source` property is equal to the `establishedSource`.

Messages are sent by calling the `postMessage` method on the `establishedSource` with the `targetOrigin` parameter set to `establishedOrigin`.

The window must not be automatically closed after sending a message, since the relying party could 
possibly send additional messages over the existing communcation channel. Instead, the relying party is responsible for closing the signer window.

## Error Handling

### Unexpectedly Closed Window

If the signer window is closed unexpectedly, the relying party will stop receiving `"result": "ready"` responses to the heartbeat messages as a result which would be treated as a disconnection.

### Invalid Messages

If either party receives malformed, unexpected, or otherwise invalid messages, it should ignore them.
