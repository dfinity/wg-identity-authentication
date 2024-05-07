# ICRC-25: Signer Interaction Standard

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)

<!-- TOC -->
* [ICRC-25: Signer Interaction Standard](#icrc-25-signer-interaction-standard)
  * [Summary](#summary)
  * [Terminology](#terminology)
  * [Types](#types)
  * [Transport Requirements](#transport-requirements)
  * [Sessions](#sessions)
  * [Scopes](#scopes)
    * [Scope Objects](#scope-objects)
  * [Extensions](#extensions)
  * [Methods](#methods)
    * [`icrc25_request_permissions`](#icrc25_request_permissions)
      * [Prerequisites](#prerequisites)
      * [Request Params](#request-params)
      * [Result](#result)
      * [Errors](#errors)
      * [Message Processing](#message-processing)
      * [Example](#example)
    * [`icrc25_granted_permissions`](#icrc25_granted_permissions)
      * [Prerequisites](#prerequisites-1)
      * [Request Params](#request-params-1)
      * [Result](#result-1)
      * [Errors](#errors-1)
      * [Message Processing](#message-processing-1)
      * [Example](#example-1)
    * [`icrc25_revoke_permissions`](#icrc25_revoke_permissions)
      * [Prerequisites](#prerequisites-2)
      * [Request Params](#request-params-2)
      * [Result](#result-2)
      * [Errors](#errors-2)
      * [Message Processing](#message-processing-2)
      * [Example](#example-2)
    * [`icrc25_supported_standards`](#icrc25_supported_standards)
      * [Prerequisites](#prerequisites-3)
      * [Request Params](#request-params-3)
      * [Result](#result-3)
      * [Errors](#errors-3)
      * [Message Processing](#message-processing-3)
      * [Example](#example-3)
  * [Errors](#errors-4)
    * [Example](#example-4)
<!-- TOC -->

## Summary

This specification describes a communication protocol between dapps (decentralized applications) and signers. It defines messages that both sides should use to interact with each other and provides guidelines on how to process them.

## Terminology

* signer: A service that manages a user's keys and can sign and perform canister calls on their behalf.
* relying party: A service that wants to request calls on a specific canister.

## Types

- `text`: A plain `string` value.
- `blob`: A `string` value describing binary data encoded in base64.
- `int`: An integer value.

## Transport Requirements

This standard is agnostic to the transport channel used to send the messages, as long as it provides authenticity and integrity: this means that the communicating parties know the other participant and can be sure that the messages they receive are sent by the party they expect and that the messages have not been tampered with.

The transport channel is not required to provide confidentiality.

## Sessions

ICRC-25 may use sessions to store user-choices and determine the lifetime of granted permission [scopes](#scopes). Permission scopes (see [`icrc25_request_permissions` message](#icrc25_request_permissions)) are granted for the duration of a single session only. 

A session is established when the first permission request is granted. A session can be revoked by the relying party at any time by sending a [`icrc25_revoke_permissions` message](#icrc25_revoke_permissions) to the signer. The signer can also terminate the session at any time and should offer the user a method to do so.

A session must be terminated automatically after a certain period of inactivity. The session might be extended automatically if the interaction between the relying party and the signer is still _actively_ ongoing when the default session timeout is reached. There must be a maximum session duration (regardless of activity).

Signers that do not maintain sessions (i.e. stateless signers) MUST prompt the user to approve each request individually for each method defined in an ICRC-25 extension.

## Scopes

A scope is the permission to invoke a specific JSON-RPC 2.0 method on the signer. A scope is identified by the `method` property which matches the `method` name of the JSON-RPC 2.0 call it relates to. The relying party requests scopes using the [`icrc25_request_permissions`](#icrc25_request_permissions) method and may revoke them using  [`icrc25_revoke_permissions`](#icrc25_revoke_permissions).

None of the methods defined in this standard require a scope.

### Scope Objects

Scopes are represented in JSON-RPC 2.0 messages as JSON objects with the following properties:
- `method` (`text`): JSON-RPC 2.0 method the scope is associated with.

Extensions to this standard may define additional properties on scope objects.

## Extensions

This standard is the signer interaction _base_ standard. As such it intentionally excludes all methods that could be handled by an extension, for example:

- Getting principals: [ICRC-27](./icrc_27_get_accounts.md)
- Proving ownership of principals: [ICRC-32](./icrc_32_sign_challenge.md)
- Canister calls: [ICRC-49](./icrc_49_call_canister.md)

This allows signer developers to choose which extensions they want to support and only implement those.

The standard defines the `icrc25_supported_standards` endpoint to accommodate these and other future extensions.
This endpoint returns names of all specifications (e.g., `"ICRC-27"`) implemented by the signer.

## Methods

### `icrc25_request_permissions`

The purpose of the `icrc25_request_permissions` method is for the relying party to request [permission scopes](#scopes) to perform further actions. If the set of granted scopes is not empty and there was no session before, a new [session](#sessions) is created.

#### Prerequisites

None

#### Request Params

`scopes`: Array of permission [scope objects](#scope-objects) the relying party requires. If the signer does not support a requested scope, it should ignore that particular scope and proceed as if the `scopes` array did not include that object.

#### Result

`scopes`: Array of permission [scope objects](#scope-objects) that the signer supports and the user has granted the relying party. This must be a subset of the `scopes` field from the original request. Additionally, scope restrictions must be the same or more restrictive than the ones requested by the relying party.

#### Errors

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:
- `1000 Generic error`
- `3000 Permission not granted`

#### Message Processing

1. The relying party sends a `icrc25_request_permissions` message to the signer.
2. The signer removes any unrecognized scopes from the array of requested scopes.
3. Depending on whether the signer supports sessions:
   - If the signer does _not_ support sessions, it may send a response immediately _without_ prompting the user. Scopes should be granted subject to a static signer policy. Skip to step 6.
     > **Note:** Stateless signers MUST prompt the user to approve each request individually for each method defined in an ICRC-25 extension.
   - Otherwise, continue with step 4.
   > **Note:** It is recommended that signers assist users when granting permissions to relying parties, e.g. by maintaining a list of well-known relying parties and displaying additional information about the relying party, such as its name, logo, etc., or in the case of an unknown relying party, by displaying a warning.
4. Depending on the session state the signer either skips or displays the details of the to-be-established connection to the user:
    - If there is an active session with the relying party, skip to the next step, otherwise:
        - the signer presents the details of the to-be-established connection to the user. If the user has never interacted with this relying party before, the signer may display information explaining that the user is about to establish a connection with a new relying party.
        - If the user approves the connection, the signer creates a new session for the relying party.
            - Otherwise, the signer sends a response with an error back to the relying party and step 5 is skipped.
5. The signer displays the requested scopes to the user and asks the user to approve or reject the request. The user may also be allowed to approve only a subset of the requested scopes or add additional restrictions (see [optional scope restrictions](#optional-properties)).
    - If all requested scopes have already been granted, the signer may skip the user interaction and reply with the array of granted scopes immediately.
    - If the user approves the request, the signer saves information about the granted permission scopes on the current session. Then the signer sends a successful response back to the relying party with the array of granted scopes.
    - If the user rejects the request, the signer sends a response with an error back to the relying party.
6. After receiving a response, the relying party may send additional messages depending on the granted scopes.

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer
    participant U as User

    RP ->> S: Request permission
    alt Stateless Signer
        S ->> RP: Permission response
    else Signer supports sessions 
        S ->> U: Show relying party details<br>and requested permissions
        alt Approved
            U ->> S: Approve request
            S ->> S: Store the granted permission scopes
            S ->> RP: Permission response
        else Rejected
            U ->> S: Reject request
            S ->> RP: Error response: Permission not granted (3000)
        end
    end
```

#### Example

Request
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc25_request_permissions",
    "params": {
        "scopes": [
            {
                "method": "icrc27_get_accounts"
            },
            {
                "method": "icrc49_call_canister",
                "targets": ["ryjl3-tyaaa-aaaaa-aaaba-cai"]
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
        "scopes": [
            {
                "method": "icrc27_get_accounts"
            },
            {
                "method": "icrc49_call_canister",
                "targets": ["ryjl3-tyaaa-aaaaa-aaaba-cai"],
                "senders": ["btbdd-ob3pe-dz6kv-7n4gh-k2xtm-xjthz-kcvpk-fwbnv-w5qbk-iqjm4-4qe"]
            }
        ]
    }
}
```

### `icrc25_granted_permissions`

The purpose of the `icrc25_granted_permissions` method is for the relying party to query the granted [permission scopes](#scopes) on the active session.

#### Prerequisites

None

#### Request Params

None

#### Result

`scopes`: Array of permission [scope objects](#scope-objects) that the signer supports and the user has previously granted to the relying party during the active session.

#### Errors

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:
- `1000 Generic error`

#### Message Processing

1. The relying party sends a `icrc25_granted_permissions` message to the signer.
2. The signer replies with the granted [permission scopes](#scopes) that are active on the current session, if any.

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer

    RP ->> S: Query granted permissions
    S ->> RP: Granted permissions response
```

#### Example

Request
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc25_granted_permissions"
}
```

Response
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "result": {
        "scopes": [
            {
                "method": "icrc27_get_accounts"
            },
            {
                "method": "icrc49_call_canister",
                "targets": ["ryjl3-tyaaa-aaaaa-aaaba-cai"],
                "senders": ["btbdd-ob3pe-dz6kv-7n4gh-k2xtm-xjthz-kcvpk-fwbnv-w5qbk-iqjm4-4qe"]
            }
        ]
    }
}
```

### `icrc25_revoke_permissions`

The relying party can request to revoke all or a subset of the previously granted permission [scopes](#scopes). If all granted permission scopes are revoked, the session (if any) is terminated.

#### Prerequisites

None

#### Request Params

`scopes` (optional): Array of permission [scope objects](#scope-objects) the relying party wants to revoke. If empty or undefined, the signer revokes all granted permission scopes and terminates the session. If the signer does not recognize a provided scope, or if it has not been granted on the current session, it should ignore that particular scope and proceed as if the `scopes` array did not include that object.

#### Result

`scopes`: Array of [scope objects](#scope-objects) that remain granted on the current session (if any) after applying the revocation. May be empty.

#### Errors

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:
- `1000 Generic error`

#### Message Processing

1. The relying party sends a `icrc25_revoke_permissions` request to the signer.
2. Next, the signer revokes the requested permission scopes. If no scopes are provided, the signer revokes all granted permission scopes.
3. The signer sends a response back to the relying party with the array of remaining permission scopes. If no scopes remain granted, the signer terminates the session.

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer

    RP ->> S: Revoke permission
    S ->> S: Revoke the permission scopes
    S ->> RP: Reply with remaining permission scopes
```

#### Example

Request
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc25_revoke_permissions",
    "params": {
        "scopes": [{
          "method": "icrc49_call_canister"
        }]
    }
}
```

Response
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "result": {
        "scopes": []
    }
}
```

### `icrc25_supported_standards`

The relying party can query the list of standards supported by the signer.

#### Prerequisites

None

#### Request Params

None

#### Result

`suportedStandards`: Array of standards the signer implements.
  - `name` (`text`): The name of the standard.
  - `url` (`text`): Link to the standard.

#### Errors

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:
- `1000 Generic error`

#### Message Processing

1. The relying party sends a `icrc25_supported_standards` request to the signer.
2. The signer sends a response back to the relying party with the list of supported standards.
   - The list must always at least include ICRC-25.

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer

    RP ->> S: Request supported standards
    S ->> RP: Reply with supported standards
```

#### Example

Request
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc25_supported_standards"
}
```

Response
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "supportedStandards": [
      {
        "name": "ICRC-25",
        "url": "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-25/ICRC-25.md"
      },
      {
        "name": "ICRC-31",
        "url": "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-31/ICRC-31.md"
      }
    ]
  }
}
```

## Errors

The error is an object comprising the `code`, `message` and optional `data` fields as described in the [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification#error_object). In addition to the pre-defined errors, the following values are defined applying to all methods (including extension standards):

- General (**code: `1xxx`**)

| Code | Message       | Meaning                                                          | Data                                                       |
|------|---------------|------------------------------------------------------------------|------------------------------------------------------------|
| 1000 | Generic error | Generic error not fitting another, more specific error category. | (`text`): description of the error intended for developers |

- Not supported (**code: `2xxx`**)

| Code | Message       | Meaning                                       | Data                                                       |
|------|---------------|-----------------------------------------------|------------------------------------------------------------|
| 2000 | Not supported | The operation is not supported by the signer. | (`text`): description of the error intended for developers |

- User action (**code: `3xxx`**)

| Code | Message                | Meaning                                                              | Data |
|------|------------------------|----------------------------------------------------------------------|------|
| 3000 | Permission not granted | The signer has rejected the request due to insufficient permissions. | N/A  |
| 3001 | Action aborted         | The user has canceled the action.                                    | N/A  |

- Network (**code: `4xxx`**)

| Code | Message       | Meaning                  | Data                                                                                                                            |
|------|---------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| 4000 | Network error | The network call failed. | (optional) Error details: <ul> <li>`status` (`int`): HTTP status code</li> <li>`message` (`text`, optional): message</li> </ul> |

### Example

```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "error": {
        "code": 1000,
        "message": "Generic error",
        "description": "The signer has encountered an internal error while processing the request."
    }
}
```
