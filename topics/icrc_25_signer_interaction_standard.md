# ICRC-25: Signer Interaction Standard

| Status |
| :----: |
| Draft  |

<!-- TOC -->

- [ICRC-25: Signer Interaction Standard](#icrc-25-signer-interaction-standard)
  - [Summary](#summary)
  - [Terminology](#terminology)
  - [Types](#types)
  - [Transport Requirements](#transport-requirements)
  - [Sessions](#sessions)
  - [Scopes](#scopes)
    - [Scope Objects](#scope-objects)
      - [Optional Properties](#optional-properties)
    - [List of Scopes](#list-of-scopes)
  - [Messages](#messages)
    - [`icrc25_connect`](#icrc25_managed_identities)
    - [`icrc25_managed_identities`](#icrc25_managed_identities)
      - [Prerequisites](#prerequisites-2)
      - [Request](#request-2)
      - [Response](#response-2)
      - [Errors](#errors-2)
      - [Message Processing](#message-processing-2)
      - [Example](#example-2)
    - [`icrc25_disconnect`](#icrc25_disconnect)
  - [Errors](#errors-5)
  _ [Version `1` errors (**code: `xxx01`**)](#version-1-errors-code-xxx01)
  _ [Example](#example-5)
  <!-- TOC -->

## Summary

This specification describes a communication protocol between dapps (decentralized applications) and signers. It defines messages that both sides should use to interact with each other and provides guidelines on how to process them.

## Terminology

- signer: A service that manages a user's keys and can sign and perform canister calls on their behalf.
- relying party: A service that wants to request calls on a specific canister.

## Types

- `text`: A plain `string` value.
- `blob`: A `string` value describing binary data encoded in base64.
- `int`: An integer value.

## Transport Requirements

This standard is agnostic to the transport channel used to send the messages, as long as it provides authenticity and integrity: this means that the communicating parties know the other participant and can be sure that the messages they receive are sent by the party they expect and that the messages have not been tampered with.

The transport channel is not required to provide confidentiality.

## Sessions

## Scopes

A scope is the permission to invoke specific JSON-RPC 2.0 method on the signer. A scope is identified by the `method` property which matches the `method` name of the JSON-RPC 2.0 call it relates to. The relying party requests scopes using the [`icrc25_request_permissions`](#icrc25requestpermissions) method and may revoke them using [`icrc25_revoke_permissions`](#icrc25revokepermissions).

Not all methods defined in this standard require a scope.

### Scope Objects

Scopes are represented in JSON-RPC 2.0 messages as JSON objects with the following properties:

- `method` (`text`): JSON-RPC 2.0 method the scope is associated with.

#### Optional Properties

- `targets` (`text` array): A list of target canister ids (textual representation) the scope is restricted to. If the list is not present, the scope applies to all canisters (i.e. the permission is not restricted).
  - Applicable to the `icrc25_canister_call` scope.
- `senders` (`text` array): A list of sender principal ids (textual representation) the scope is restricted to. If the list is not present, the scope applies to all senders (i.e. the permission is not restricted).
  - Applicable to the `icrc25_canister_call` scope.

### List of Scopes

This standard defines the following `method` values for scopes:

- `icrc25_managed_identities`
- `icrc25_canister_call`

This list may be extended by other standards.

## Messages

### `icrc25_managed_identities`

The purpose of the `icrc25_managed_identities` message is for the relying party to receive information about the identities managed by the signer.

#### Prerequisites

- Active session with granted scope `icrc25_managed_identities`.

#### Request

`version` (`text`): The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

`challenge` (`blob`): A challenge used for the signer to sign in order to prove its access to the identity. The challenge should be an array of 32 cryptographically random bytes generated from a secure random source by the sender of the request.

#### Response

`version` (`text`): The version of the standard used. It must match the `version` from the request.

`identities`: A list of identities the user has selected to share with the relying party.

- `publicKey` (`blob`): The DER-encoded public key associated with the identity, derived in accordance with one of [the signature algorithms supported by the IC](https://internetcomputer.org/docs/current/references/ic-interface-spec/#signatures). The public key can be used to [derive a self-authenticating principal](https://internetcomputer.org/docs/current/references/ic-interface-spec/#principal).
- `signature` (`blob`): The signature produced by signing the concatenation of the domain separator `\x13ic-signer-challenge` (UTF-8 encoded) and the challenge with the private key associated with the identity.
- `delegation` (optional): An array of delegations (as defined by the [IC interface specification, authentication section](https://internetcomputer.org/docs/current/references/ic-interface-spec/#authentication)):
  - object with the following properties:
    - `pubkey` (`blob`): Public key as described in the [IC interface specification, signatures section](https://internetcomputer.org/docs/current/references/ic-interface-spec/#signatures).
    - `expiration` (`text`): Expiration of the delegation, in nanoseconds since 1970-01-01, as a base-10 string.
    - `targets` (`text` array): A list of target canister ids (textual representation) the delegation is restricted to making canister calls to. If the list is not present, the delegation applies to all canisters (i.e. it is not restricted).
  - `signature` (`blob`): Signature on the 32-byte representation-independent hash of the map contained in the delegation field as described in [IC interface specification, signatures section](https://internetcomputer.org/docs/current/references/ic-interface-spec/#signatures), using the 27 bytes `\x1Aic-request-auth-delegation` as the domain separator.

#### Errors

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:

- `10001 Unknown error`
- `20101 Version not supported`
- `30101 Permission not granted`

#### Message Processing

1. The relying party sends a `icrc25_managed_identities` request to the signer.
2. Upon receiving the message, the signer first checks if it can process the message.
   - If the request version is not supported by the signer, the signer sends a response with an error back to the relying party.
   - If the relying party has not been granted the permission to request the action, the signer sends a response with an error back to the relying party.
3. Next, the signer lets the user select identities that will be included in the response.
   - If the user has previously selected identities for the same relying party on the same session, the signer may skip the user interaction.
4. The signer signs the challenge with the private keys associated with the selected identities and sends a successful response back to the relying party with the list of selected identities and the matching signatures.
5. After receiving a successful response, the relying party verifies that the signer has access to the private key associated with the provided identities:
   <<<<<<< Updated upstream - Determine the public key for verifying the signature of the challenge for each identity: - If `delegation` is present and non-empty: - If the `delegation` array contains more than 20 elements, the relying party rejects the response. - The relying party validates that all delegations are not expired according to their respective `expiration` timestamp. - The relying party validates all `signature` values of all delegations in the `delegation` list. For the first delegation in the array, this signature must be valid with respect to the public key corresponding to the `publicKey` field of the identity, all subsequent delegations are signed with the key corresponding to the public key contained in the preceding delegation. The key to validate the challenge signature is the public key contained in the last delegation in the array. - Otherwise the key to validate the challenge signature with is the public key contained in the `publicKey` field of the identity. - The relying party retrieves the public key to verify the challenge from each identity according to the previous step, determines the `signature` scheme and verifies whether it was generated by signing the concatenation of the domain separator `\x13ic-signer-challenge` (UTF-8 encoded) and the `challenge` from the request with the private key associated with that public key. - If the signature verification succeeds for all `identities`, the relying party accepts the response. - If the signature verification fails for any `identities` value, the relying party rejects the response.
   =======
   - The relying party retrieves the `publicKey` from each `identities` value, determines the `signature` scheme and verifies whether it was generated by signing the concatenation of the domain separator `\x13ic-signer-challenge` (UTF-8 encoded) and the `challenge` from the request with the private key associated with the `publicKey`. - If the signature verification succeeds for all `identities`, the relying party accepts the response. - If the signature verification fails for any `identities` value, the relying party rejects the response.
     > > > > > > > Stashed changes

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer
    participant U as User

    RP ->> S: Request identities
    alt Version is not supported
        S ->> RP: Error response: Version not supported (20101)
    else Scope `icrc25_managed_identities` not granted
        S ->> RP: Error response: Permission not granted (30101)
    else
        opt If not selected before on the active session
            S ->> U: Ask to select identities to share with Relying Party
            U ->> S: Select identities
        end
        S ->> S: Sign the challenge
        S ->> RP: Identities response
        RP ->> RP: Verify the signatures
    end
```

#### Example

Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc25_managed_identities",
  "params": {
    "version": "1",
    "challenge": "UjwgsORvEzp98TmB1cAIseNOoD9+GLyN/1DzJ5+jxZM="
  }
}
```

Response

```json
{
<<<<<<< Updated upstream
    "id": 1,
    "jsonrpc": "2.0",
    "result": {
        "version": "1",
        "identities": [
            {
                "publicKey": "MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEOTdHYwpFTr/oPXOfLQcteymk8AQE41VwPQ1W7Xpm0Zt1AY4+5aOnMAbAIjXEchxPuGbPWqPqwntXMPs3w4rOaA==",
                "signature": "bldf7qn7DC5NzTyX5kp4GpZHaEncE5/6n/Y8av3xjEwIVFAwmhyW0uM+WBXRTj4QbScot04dfaBXUOcSWF0IjQ=="
            }
        ]
    }
}
```

### `icrc25_canister_call`

This message can be used by the relying party to request canister calls to be executed by the signer.

#### Prerequisites

- Active session with granted scope `icrc25_canister_call`.
  - This scope may be restricted to specific target canister ids and/or sender principals.

#### Request

`version` (`text`): The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

`canisterId` (`text`): The id of the canister on which the call should be executed.

`sender` (`text`): The principal (textual representation) requested to execute the call.

`method` (`text`): The name of the call method to be executed.

`arg` (`blob`): The arguments for the call.

#### Response

`version` (`text`): The version of the standard used. It must match the `version` from the request.

`contentMap` (`blob`): The CBOR-encoded content map of the actual request as specified [here](https://internetcomputer.org/docs/current/references/ic-interface-spec/#http-call).

`certificate` (`blob`): The certificate returned by the `read_state` call as specified [here](https://internetcomputer.org/docs/current/references/ic-interface-spec/#certificate). The value is CBOR-encoded.

#### Errors

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:

- `10001 Unknown error`
- `20101 Version not supported`
- `30101 Permission not granted`
- `30201 Action aborted`

#### Message Processing

1. The relying party sends a `icrc25_canister_call` request to the signer.
2. Upon receiving the request, the signer validates whether it can process the message.
   - If the request version is not supported by the signer, the signer sends a response with an error back to the relying party.
   - If the relying party has not been granted the permission to request the action, the signer sends a response with an error back to the relying party.
     - The sender must make sure that the request complies with additional scope restrictions defined by the signer (if any), such as limitations on the target canister id or the sender principal, etc.
3. Next, the signer processes the message following the [ICRC-21](./icrc_21_consent_msg.md) specification. If the target canister does not support ICRC-21, the signer should display a warning, try to decode the arguments by itself and display raw canister call details. If the arguments cannot be decoded, a strong warning must be displayed.

   - If the user approves the request:
     - The signer sends the call to the IC (in order to get a certified results, all calls, including queries, should be sent as `update` calls), retrieves its [content map](https://internetcomputer.org/docs/current/references/ic-interface-spec/#http-call) and [calculates a request id](https://internetcomputer.org/docs/current/references/ic-interface-spec/#request-id) based on it.
       - The signer continues to call `read_state` for the calculated request id until [the status of the call](https://internetcomputer.org/docs/current/references/ic-interface-spec/#state-tree-request-status) indicates that the call has been processed (succesfully or not).
         - If the status of the call is `replied`, `rejected` or `done`, the signer retrieves the CBOR-encoded [certificate](https://internetcomputer.org/docs/current/references/ic-interface-spec/#certificate) from [the `read_state` response](https://internetcomputer.org/docs/current/references/ic-interface-spec/#http-read-state) and sends it together with the content map in response back to the relying party.
       - If the status of the HTTP response for submitting the call to the IC is _not_ `202 Accepted` (indicating the call failed), the signer sends a response with an error back to the relying party.
   - If the user rejects the request or if the signer fails to complete the requested action for any reason, the signer sends a response with an error back to the relying party.

   > **Note:** Unlike other methods defined in this standard, user approval for the `icrc25_canister_call` method must never be skipped! The reason for this is that the canister call might not be idempotent and thus submitting a call twice might have undesired consequences.

4. The relying party receives a response from the signer and processes it as follows:
   - On successful response: the relying party verifies whether the call performed by the signer was genuine and retrieves the result:
     - The relying party retrieves the CBOR-encoded `contentMap` from the response, verifies that its values match the expectations and uses it to [calculate a request id](https://internetcomputer.org/docs/current/references/ic-interface-spec/#request-id).
     - The relying party retrieves the CBOR-encoded [`certificate`](https://internetcomputer.org/docs/current/references/ic-interface-spec/#certificate) from the response, decodes it and validates its authenticity with regard to [the root of trust](https://internetcomputer.org/docs/current/references/ic-interface-spec/#root-of-trust).
       - If the validation process fails, the relying party rejects the response.
     - The relying party extracts the [request status](https://internetcomputer.org/docs/current/references/ic-interface-spec/#state-tree-request-status) from the `certificate`'s state tree.
     - If the status of the call is `replied`:
       - The relying party retrieves the `reply` blob from the `certificate`'s state tree.
       - If the `reply` blob or the error information (comprised of the `reject_code`, `reject_message`) is not present, the relying party rejects the response.
     - If the status of the call is `rejected`:
       - The relying party uses the calculated request id to retrieve `reject_code`, `reject_message` from the `certificate`'s state tree.
       - If the error information (comprised of the `reject_code`, `reject_message`) is not present, the relying party rejects the response.
     - If the status of the call is `done`:
       - The relying party now knows that the call was submitted to the IC and executed as requested. However, the result of the call is no longer available.
   - On error: The relying party may use the information returned to help investigate the causes for the error. The error information is only informative. The relying party must not trust the information returned by the signer and should not use it to make any decisions.

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer
    participant U as User
    participant C as Target Canister

    RP ->> S: Request canister call
    alt Version is not supported
        S ->> RP: Error response: Version not supported (20101)
    else Relying party has not been granted the `icrc25_canister_call` permission scope<br>or the request does not comply with scope restrictions
        S ->> RP: Error response: Permission not granted (30101)
    else
        alt Canister supports ICRC-21
            Note over S,C: Follow the ICRC-21 standard
        else Canister does not support ICRC-21
            S ->> U: Display warning and canister call details (canisterId, sender, method, arg)
            Note over S,U: The warning should inform the user that the canister does not support ICRC-21<br/>The arguments should be decoded, otherwise another warning must be displayed
        end
        alt Approved
            U ->> S: Approve request
            S ->> C: Submit canister call
            S ->> S: Wait for the canister call result
            alt Call successful
                S ->> U: Display success message
                S ->> RP: Canister call response
                RP ->> RP: Validate the certificate
                RP ->> RP: Retrieve the result
            else Call failed
                S ->> U: Display failure message
                S ->> RP: Error response: Network error (40001) | Unknown error (10001)
            end
        else Rejected
            U ->> S: Reject request
            S ->> RP: Error response: Action aborted (30201)
        end
    end
```

#### Example

Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc25_canister_call",
  "params": {
    "version": "1",
    "canisterId": "xhy27-fqaaa-aaaao-a2hlq-ca",
    "sender": "b7gqo-ulk5n-2kpo7-oalt7-p2kyl-o4j5l-kiuwo-eeybr-dab4l-ur6up-pqe",
    "method": "transfer",
    "arg": "RElETARte24AbAKzsNrDA2ithsqDBQFsA/vKAQKi3pTrBgHYo4yoDX0BAwEdV+ztKgq7E4l1ffuTuwEmw8AtYSjlrJ+WLO5ofQIAAMgB"
  }
}
```

Response

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "version": "1",
    "contentMap": "2dn3p2NhcmdYTkRJREwEbXtuAGwCs7DawwNorYbKgwUBbAP7ygECot6U6wYB2KOMqA19AQMBHVfs7SoKuxOJdX37k7sBJsPALWEo5ayflizuaH0CAADIAWtjYW5pc3Rlcl9pZEoAAAAAAcDR1wEBbmluZ3Jlc3NfZXhwaXJ5GxeNX/65y4YAa21ldGhvZF9uYW1laHRyYW5zZmVyZW5vbmNlUFF4+hAimFhoqkdUcIchz0xscmVxdWVzdF90eXBlZGNhbGxmc2VuZGVyWB1q63Snu+4C5/fpWFu4nq1IpZxCYDEYA8XSPqPfAg==",
    "certificate": "2dn3omR0cmVlgwGDAYIEWCAPzKZJY/emKhi2GGtBrnHh4cdttATd4+9GtJrNCBepb4MBgwJOcmVxdWVzdF9zdGF0dXODAYIEWCCCgynUaonrKCCywghWCSk9BeDqMoI4yf15nxyU/5JZv4MBggRYIDG7WdzQ9sGWI1MpxizUzxubsEBuNkTT94UOZ9USbzNvgwGCBFggawwbTHxnPUzBAUhWBRjk0nzPs2fPpJlaIYtj5AvcX+ODAYIEWCDiFLyaWuMWjtVurCQcSgny/cqfM8S6qrdihVq7nPz1FoMCWCD/8jdeccvqHVYf06Hw7qPXIDNimC1Uyf47VsvgqKpPiIMBgwJFcmVwbHmCA1RESURMAWsCvIoBfcX+0gFxAQAABIMCRnN0YXR1c4IDR3JlcGxpZWSCBFgg7qZngcNt2+B/RuF44W3LRsKWXG6QQg2L6GdZgJ6Nb3+DAYIEWCAx3tU/mhHfX+wDzF003eSJYN8Nebou8rTeGyxr/rUa1YMCRHRpbWWCA0nw9+r88fjXxhdpc2lnbmF0dXJlWDCXNshvwWG1jGViP7ELePGHCThBw9mts45FxIy4gZATkUEsPeJ6y+cjbn2REmB0Soo="
  }
}
```

### `icrc25_revoke_permissions`

The relying party can request to revoke all or a subset of the previously granted permission [scopes](#scopes). If all granted permission scopes are revoked, the session (if any) is terminated.

#### Prerequisites

None

#### Request

`version` (`text`): The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

`scopes` (optional): A list of permission [scope objects](#scope-objects) the relying party wants to revoke. If this list is empty, or undefined, the signer revokes all granted permission scopes and terminates the session. If the signer does not recognize a provided scope, or if it has not been granted on the current session, it should ignore that particular scope and proceed as if the `scopes` list did not include that object.

#### Response

`version` (`text`): The version of the standard used. It must match the `version` from the request.

`scopes`: The list of [scope objects](#scope-objects) that remain granted on the current session (if any) after applying the revocation. This list may be empty.

#### Errors

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:

- `10001 Unknown Error`
- `20101 Version not supported`

#### Message Processing

1. The relying party sends a `icrc25_revoke_permissions` request to the signer.
2. Upon receiving the request, the signer validates whether it can process the message.
   - If the request version is not supported by the signer, the signer sends a response with an error back to the relying party.
3. Next, the signer revokes the requested permission scopes. If no scopes are provided, the signer revokes all granted permission scopes.
4. The signer sends a response back to the relying party with the list of remaining permission scopes. If no scopes remain granted, the signer terminates the session.

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as signer

    RP ->> S: Revoke permission
    alt Version is not supported
        S ->> RP: Error response: Version not supported (20101)
    else
        S ->> S: Revoke the permission scopes
        S ->> RP: Reply with remaining permission scopes
    end
```

#### Example

Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc25_revoke_permissions",
  "params": {
    "version": "1",
    "scopes": [
      {
        "method": "icrc25_canister_call"
      }
    ]
  }
}
```

Response

```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "result": {
        "version": "1",
        "scopes": []
    }
=======
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "version": "1",
    "identities": [
      {
        "publicKey": "MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEOTdHYwpFTr/oPXOfLQcteymk8AQE41VwPQ1W7Xpm0Zt1AY4+5aOnMAbAIjXEchxPuGbPWqPqwntXMPs3w4rOaA==",
        "signature": "bldf7qn7DC5NzTyX5kp4GpZHaEncE5/6n/Y8av3xjEwIVFAwmhyW0uM+WBXRTj4QbScot04dfaBXUOcSWF0IjQ=="
      }
    ]
  }
>>>>>>> Stashed changes
}
```

## Errors

The error is an object comprising the `code`, `message` and optional `data` fields as described in the [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification#error_object). In addition the the pre-defined errors, the following values are supported:

### Version `1` errors (**code: `xxx01`**)

- General (**code: `1xx01`**)

| Code  | Message       | Meaning                | Data |
| ----- | ------------- | ---------------------- | ---- |
| 10001 | Unknown error | The reason is unknown. | N/A  |

- Not supported (**code: `2xx01`**)

| Code  | Message               | Meaning                                                     | Data                            |
| ----- | --------------------- | ----------------------------------------------------------- | ------------------------------- |
| 20101 | Version not supported | The version of the standard is not supported by the signer. | (`text`): The unsupported value |

- User action (**code: `3xx01`**)

| Code  | Message                | Meaning                              | Data |
| ----- | ---------------------- | ------------------------------------ | ---- |
| 30101 | Permission not granted | The signer has rejected the request. | N/A  |
| 30201 | Action aborted         | The user has canceled the action.    | N/A  |

- Network (**code: `4xx01`**)

| Code  | Message       | Meaning                  | Data                                                                                                                            |
| ----- | ------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 40001 | Network error | The network call failed. | (optional) Error details: <ul> <li>`status` (`int`): HTTP status code</li> <li>`message` (`text`, optional): message</li> </ul> |

### Example

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "error": {
    "code": "10001",
    "message": "Unknown error"
  }
}
```
