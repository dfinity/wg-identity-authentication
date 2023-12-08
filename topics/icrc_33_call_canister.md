# ICRC-33: Call Canister

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)
[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./icrc_25_signer_interaction_standard.md)

<!-- TOC -->
* [ICRC-33: Call Canister Standard](#icrc-33-call-canister)
    * [Summary](#summary)
    * [Method](#method)
    * [Scope (according to the ICRC-25 standard)](#scope-according-to-the-icrc-25-standard)
        * [Example RPC Request ](#example-rpc-request-permission)
    * [Request](#request)
        * [Example RPC Request ](#example-rpc-request)
    * [Response](#response)
        * [Example RPC Response ](#example-rpc-response)
    * [Message Processing](#message-processing)
    * [Errors](#errors)

## Summary

This Method can be used by the relying party to request calls to 3rd party canister executed by the signer using the selected or requested identity.

## Method

**Name:** `icrc33_call_canister`

**Prerequisite:** Active session with granted permission scope `icrc33_call_canister` or `*`.
  * This scope may be restricted to specific target canister ids and/or sender principals.

## Scope (according to the [ICRC-25 standard](./icrc_25_signer_interaction_standard.md))

**Scope:** `icrc33_call_canister` 

**Optional Properties:**
- `targets` (`text` array): A list of target canister ids (textual representation) the scope is restricted to. If the list is not present, the scope applies to all canisters (i.e. the permission is not restricted).
- `senders` (`text` array): A list of sender principal ids (textual representation) the scope is restricted to. If the list is not present, the scope applies to all senders (i.e. the permission is not restricted).

### Example RPC Request Permission
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc25_request_permissions",
    "params": {
        "version": "1",
        "scopes": [
            {
                "method": "icrc33_call_canister",
                "targets": ["ryjl3-tyaaa-aaaaa-aaaba-cai"],
                "senders": ["ryjl3-tyaaa-aaaaa-aaaba-cai"]
            }
        ]
    }
}
```

## Request

**`version` (`text`):** The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

**`canisterId` (`text`):** The id of the canister on which the call should be executed.

**`sender` (`text`):** The principal (textual representation) requested to execute the call.

**`method` (`text`):** The name of the call method to be executed.

**`arg` (`blob`):** The arguments for the call.

### Example RPC Request

```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc33_call_canister",
    "params": {
        "version": "1",
        "canisterId": "xhy27-fqaaa-aaaao-a2hlq-ca",
        "sender": "b7gqo-ulk5n-2kpo7-oalt7-p2kyl-o4j5l-kiuwo-eeybr-dab4l-ur6up-pqe",
        "method": "transfer",
        "arg": "RElETARte24AbAKzsNrDA2ithsqDBQFsA/vKAQKi3pTrBgHYo4yoDX0BAwEdV+ztKgq7E4l1ffuTuwEmw8AtYSjlrJ+WLO5ofQIAAMgB"
    }
}
```



## Response

**`version` (`text`):** The version of the standard used. It must match the `version` from the request.

**`contentMap` (`blob`):** The CBOR-encoded content map of the actual request as specified [here](https://internetcomputer.org/docs/current/references/ic-interface-spec/#http-call).

**`certificate` (`blob`):** The certificate returned by the `read_state` call as specified [here](https://internetcomputer.org/docs/current/references/ic-interface-spec/#certificate). The value is CBOR-encoded.

### Example RPC Response

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

## Message Processing

1. The relying party sends a `icrc33_call_canister` request to the signer.
2. Upon receiving the request, the signer validates whether it can process the message.
    - If the request version is not supported by the signer, the signer sends a response with an error back to the relying party.
    - If the relying party has not been granted the permission to request the action, the signer sends a response with an error back to the relying party.
        - The sender must make sure that the request complies with additional scope restrictions defined by the signer (if any), such as limitations on the target canister id or the sender principal, etc. 
3. Next, the signer processes the message following the [ICRC-21](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/consent-msg.md) specification. If the target canister does not support ICRC-21, the signer should display a warning, try to decode the arguments by itself and display raw canister call details. If the arguments cannot be decoded, a strong warning must be displayed.
    - If the user approves the request:
        - The signer sends the call to the IC (in order to get a certified results, all calls, including queries, should be sent as `update` calls), retrieves its [content map](https://internetcomputer.org/docs/current/references/ic-interface-spec/#http-call) and [calculates a request id](https://internetcomputer.org/docs/current/references/ic-interface-spec/#request-id) based on it.
            - The signer continues to call `read_state` for the calculated request id until [the status of the call](https://internetcomputer.org/docs/current/references/ic-interface-spec/#state-tree-request-status) indicates that the call has been processed (succesfully or not).
                - If the status of the call is `replied`, `rejected` or `done`, the signer retrieves the CBOR-encoded [certificate](https://internetcomputer.org/docs/current/references/ic-interface-spec/#certificate) from [the `read_state` response](https://internetcomputer.org/docs/current/references/ic-interface-spec/#http-read-state) and sends it together with the content map in response back to the relying party.
            - If the status of the HTTP response for submitting the call to the IC is _not_ `202 Accepted` (indicating the call failed), the signer sends a response with an error back to the relying party.
    - If the user rejects the request or if the signer fails to complete the requested action for any reason, the signer sends a response with an error back to the relying party.

    > **Note:** Unlike other methods defined in this standard, user approval for the `icrc33_call_canister` method must never be skipped! The reason for this is that the canister call might not be idempotent and thus submitting a call twice might have undesired consequences.

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
    else Relying party has not been granted the `icrc33_call_canister` permission scope<br>or the request does not comply with scope restrictions
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



## Errors

See [ICRC-25](./icrc_25_signer_interaction_standard.md#errors-3) for a list of errors that can be returned by all methods.

While processing the request from the relying party, the signer can cancel it at any time by sending an [error](#errors) in response. In addition to the pre-defined JSON-RPC 2.0 errors ([-32600 to -32603 and -32700](https://www.jsonrpc.org/specification#error_object)), the following values are applicable:
- `30201 Action aborted`