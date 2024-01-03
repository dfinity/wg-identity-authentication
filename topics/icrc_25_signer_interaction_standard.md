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
    * [Scopes Defined by this Standard](#scopes-defined-by-this-standard)
  * [Batch Calls](#batch-calls)
  * [Extensions](#extensions)
  * [Methods](#methods)
    * [`icrc25_request_permissions`](#icrc25_request_permissions)
      * [Prerequisites](#prerequisites)
      * [Request](#request)
      * [Response](#response)
      * [Errors](#errors)
      * [Message Processing](#message-processing)
      * [Example](#example)
    * [`icrc25_granted_permissions`](#icrc25_granted_permissions)
      * [Prerequisites](#prerequisites-1)
      * [Request](#request-1)
      * [Response](#response-1)
      * [Errors](#errors-1)
      * [Message Processing](#message-processing-1)
      * [Example](#example-1)
    * [`icrc25_revoke_permissions`](#icrc25_revoke_permissions)
      * [Prerequisites](#prerequisites-2)
      * [Request](#request-2)
      * [Response](#response-2)
      * [Errors](#errors-2)
      * [Message Processing](#message-processing-2)
      * [Example](#example-2)
    * [`icrc25_supported_standards`](#icrc25_supported_standards)
      * [Prerequisites](#prerequisites-3)
      * [Request](#request-3)
      * [Response](#response-3)
      * [Errors](#errors-3)
      * [Message Processing](#message-processing-3)
      * [Example](#example-3)
  * [Errors](#errors-4)
    * [Version `1` errors (**code: `xxx01`**)](#version-1-errors-code-xxx01)
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

ICRC-25 uses sessions to determine the lifetime of granted permission [scopes](#scopes). Permission scopes (see [`icrc25_request_permissions` message](#icrc25_request_permissions)) are granted for the duration of a single session only. 

A session is established when the first permission request is granted. A session can be revoked by the relying party at any time by sending a [`icrc25_revoke_permissions` message](#icrc25_revoke_permissions) to the signer. The signer can also terminate the session at any time and should offer the user a method to do so.

A session must be terminated automatically after a certain period of inactivity. The session might be extended automatically if the interaction between the relying party and the signer is still _actively_ ongoing when the default session timeout is reached. There must be a maximum session duration (regardless of activity).

## Scopes

A scope is the permission to invoke a specific JSON-RPC 2.0 method on the signer. A scope is identified by the `method` property which matches the `method` name of the JSON-RPC 2.0 call it relates to. The relying party requests scopes using the [`icrc25_request_permissions`](#icrc25_request_permissions) method and may revoke them using  [`icrc25_revoke_permissions`](#icrc25_revoke_permissions).

None of the methods defined in this standard require a scope.

### Scope Objects

Scopes are represented in JSON-RPC 2.0 messages as JSON objects with the following properties:
- `method` (`text`): JSON-RPC 2.0 method the scope is associated with.

Extensions to this standard may define additional properties on scope objects.

### Scopes Defined by this Standard

This standard defines the wildcard (`*`) scope. It means that the relying party requests permission to invoke any method on the signer.

**Example:**
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc25_request_permissions",
    "params": {
        "version": "1",
        "scopes": [
            {
                "method": "*"
            }
        ]
    }
}
```

Extensions to this standard may define additional scopes.

## Batch Calls

JSON-RPC defines a [batch call](https://www.jsonrpc.org/specification#batch) as a JSON array of requests. All methods defined in this standard may also be invoked as part of a batch.

If a signer receives a batch call, it must process each request sequentially in order of the id and reply with a batch response. Calls resulting in error responses do not prevent the processing of subsequent calls in the batch.

## Extensions

This standard is the signer interaction _base_ standard. As such it intentionally excludes all methods that could be handled by an extension, for example:

- Getting principals: [ICRC-31](./icrc_31_get_principals.md)
- Proving ownership of principals: [ICRC-32](./icrc_32_sign_challenge.md)
- Canister calls: [ICRC-33](./icrc_33_call_canister.md)

This allows signer developers to choose which extensions they want to support and only implement those.

The standard defines the `icrc25_supported_standards` endpoint to accommodate these and other future extensions.
This endpoint returns names of all specifications (e.g., `"ICRC-31"`) implemented by the signer.

## Methods

### `icrc25_request_permissions`

The purpose of the `icrc25_request_permissions` method is for the relying party to request [permission scopes](#scopes) to perform further actions. If the set of granted scopes is not empty and there was no session before, a new [session](#sessions) is created.

#### Prerequisites

None

#### Request

`version` (`text`): The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

`scopes`: Array of permission [scope objects](#scope-objects) the relying party requires. If the signer does not support a requested scope, it should ignore that particular scope and proceed as if the `scopes` array did not include that object.

#### Response

`version` (`text`): The version of the standard used. It must match the `version` from the request.

`scopes`: Array of permission [scope objects](#scope-objects) that the signer supports and the user has granted the relying party. This must be a subset of the `scopes` field from the original request. Additionally, scope restrictions must be the same or more restrictive than the ones requested by the relying party.

#### Errors

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:
- `10001 Unknown error`
- `20101 Version not supported`
- `30101 Permission not granted`

#### Message Processing

1. The relying party sends a `icrc25_request_permissions` message to the signer.
2. Upon receiving the message, the signer first checks if it can process the message.
    - If the request version is not supported by the signer, the signer sends a response with an error back to the relying party.
3. The signer removes any unrecognized scopes from the array of requested scopes.
4. Depending on the session state the signer either skips or displays the details of the to-be-established connection to the user:
    - If there is an active session with the relying party, skip to the next step, otherwise:
        - the signer presents the details of the to-be-established connection to the user. If the user has never interacted with this relying party before, the signer should display information explaining that the user is about to establish a connection with a new relying party.
        - If the user approves the connection, the signer creates a new session for the relying party.
            - Otherwise, the signer sends a response with an error back to the relying party and step 5 is skipped.

      > **Note:** The signer should maintain a list of relying parties that are trusted by the user. It is recommended that signers assist users when deciding to grant permissions to new relying parties, e.g. by maintaining a list of well-known relying parties and displaying additional information about the relying party, such as its name, logo, etc., or in the case of an unknown relying party, by displaying a warning.
      
5. The signer displays the requested scopes to the user and asks the user to approve or reject the request. The user should also be allowed to approve only a subset of the requested scopes or add additional restrictions (see [optional scope restrictions](#optional-properties)).
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
    alt Version is not supported
        S ->> RP: Error response: Version not supported (20101)
    else
        opt If there is no active session<br>with the relying party
            S ->> U: Show connection details
        end
        alt Approved
            Note over S,U: If either approval is not given,<br>jump to "Rejected" branch
            U ->> S: Approve connection or existing session
            S ->> U: Display requested scopes

            U ->> S: Approve request
            S ->> S: Store the granted permission scopes
            S ->> RP: Permission response
        else Rejected
            U ->> S: Reject request
            S ->> RP: Error response: Permission not granted (30101)
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
        "version": "1",
        "scopes": [
            {
                "method": "icrc31_get_principals"
            },
            {
                "method": "icrc33_canister_call",
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
        "version": "1",
        "scopes": [
            {
                "method": "icrc31_get_principals"
            },
            {
                "method": "icrc33_canister_call",
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

#### Request

`version` (`text`): The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

#### Response

`version` (`text`): The version of the standard used. It must match the `version` from the request.

`scopes`: Array of permission [scope objects](#scope-objects) that the signer supports and the user has previously granted to the relying party during the active session.

#### Errors

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:
- `10001 Unknown error`
- `20101 Version not supported`

#### Message Processing

1. The relying party sends a `icrc25_granted_permissions` message to the signer.
2. Upon receiving the message, the signer first checks if it can process the message.
    - If the request version is not supported by the signer, the signer sends a response with an error back to the relying party.
3. The signer replies with the granted [permission scopes](#scopes) that are active on the current session, if any.

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer

    RP ->> S: Query granted permissions
    alt Version is not supported
        S ->> RP: Error response: Version not supported (20101)
    else
        S ->> RP: Granted permissions response
    end
```

#### Example

Request
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc25_granted_permissions",
    "params": {
        "version": "1"
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
        "scopes": [
            {
                "method": "icrc31_get_principals"
            },
            {
                "method": "icrc33_canister_call",
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

#### Request

`version` (`text`): The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

`scopes` (optional): Array of permission [scope objects](#scope-objects) the relying party wants to revoke. If empty or undefined, the signer revokes all granted permission scopes and terminates the session. If the signer does not recognize a provided scope, or if it has not been granted on the current session, it should ignore that particular scope and proceed as if the `scopes` array did not include that object.

#### Response

`version` (`text`): The version of the standard used. It must match the `version` from the request.

`scopes`: Array of [scope objects](#scope-objects) that remain granted on the current session (if any) after applying the revocation. May be empty.

#### Errors

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:
- `10001 Unknown Error`
- `20101 Version not supported`

#### Message Processing

1. The relying party sends a `icrc25_revoke_permissions` request to the signer.
2. Upon receiving the request, the signer validates whether it can process the message.
    - If the request version is not supported by the signer, the signer sends a response with an error back to the relying party.
3. Next, the signer revokes the requested permission scopes. If no scopes are provided, the signer revokes all granted permission scopes.
4. The signer sends a response back to the relying party with the array of remaining permission scopes. If no scopes remain granted, the signer terminates the session.

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer

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
        "scopes": [{
          "method": "icrc33_canister_call"
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
        "version": "1",
        "scopes": []
    }
}
```

### `icrc25_supported_standards`

The relying party can query the list of standards supported by the signer.

#### Prerequisites

None

#### Request

`version` (`text`): The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

#### Response

`version` (`text`): The version of the standard used. It must match the `version` from the request.

`suportedStandards`: Array of standards the signer implements.
  - `name` (`text`): The name of the standard.
  - `url` (`text`): Link to the standard.

#### Errors

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:
- `10001 Unknown Error`
- `20101 Version not supported`

#### Message Processing

1. The relying party sends a `icrc25_supported_standards` request to the signer.
2. Upon receiving the request, the signer validates whether it can process the message.
    - If the request version is not supported by the signer, the signer sends a response with an error back to the relying party.
3. The signer sends a response back to the relying party with the list of supported standards.
   - The list must always at least include ICRC-25.

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer

    RP ->> S: Revoke supported standards
    alt Version is not supported
        S ->> RP: Error response: Version not supported (20101)
    else
        S ->> RP: Reply with supported standards
    end
```

#### Example

Request
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc25_supported_standards",
    "params": {
        "version": "1"
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
    "supportedStandards": [
      {
        "name": "ICRC-25",
        "url": "https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_25_signer_interaction_standard.md"
      },
      {
        "name": "ICRC-31",
        "url": "https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_31_get_principals.md"
      }
    ]
  }
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

| Code  | Message                | Meaning                                                                       | Data                                                                     |
| ----- | ---------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 20101 | Version not supported  | The version of the standard is not supported by the signer.                   | (`text`): The unsupported value                                          |

- User action (**code: `3xx01`**)

| Code  | Message                | Meaning                              | Data |
| ----- | ---------------------- | ------------------------------------ | ---- |
| 30101 | Permission not granted | The signer has rejected the request. | N/A  |
| 30201 | Action aborted         | The user has canceled the action.    | N/A  |

- Network (**code: `4xx01`**)

| Code  | Message                | Meaning                  | Data                                                                                                                            |
| ----- | ---------------------- | -------------------------| ------------------------------------------------------------------------------------------------------------------------------- |
| 40001 | Network error          | The network call failed. | (optional) Error details: <ul> <li>`status` (`int`): HTTP status code</li> <li>`message` (`text`, optional): message</li> </ul> |

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