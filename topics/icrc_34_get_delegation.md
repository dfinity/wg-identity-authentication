# ICRC-34: Get Delegation

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)
[![Extension Badge](https://img.shields.io/badge/EXTENDS-ICRC--25-ffcc222.svg)](./icrc_25_signer_interaction_standard.md)

<!-- TOC -->

- [ICRC-34: Get Delegation](#icrc-34-get-delegation)
  - [Summary](#summary)
  - [Method](#method)
  - [Scope (according to the ICRC-25 standard)](#scope-according-to-the-icrc-25-standard)
    - [Example RPC Request ](#example-rpc-request-permission)
  - [Request](#request)
    - [Example RPC Request ](#example-rpc-request)
  - [Response](#response)
    - [Example RPC Response ](#example-rpc-response)
  - [Errors](#errors)

## Summary

The purpose of the `icrc34_get_delegation` method is for the relying party to receive delegation identity.

## Method

**Name and Scope:** `icrc34_get_delegation`

**Prerequisite:** Active session with granted permission scope `icrc34_get_delegation` or `*`.

## Scope (according to the [ICRC-25 standard](./icrc_25_signer_interaction_standard.md))

**Scope:** `icrc34_get_delegation` 

**Optional Properties:**
- `targets` (`text` array): A list of target canister ids (textual representation) the scope is restricted to. If the list is not present, the scope applies to all canisters (i.e. the permission is not restricted).

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
                "method": "icrc34_get_delegation",
                "targets": ["ryjl3-tyaaa-aaaaa-aaaba-cai"],
            }
        ]
    }
}
```

## Request

**`version` (`text`):** The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

### Example RPC Request
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc34_get_delegation",
    "params": {
        "version": "1",
    }
}
```

### Response

`version` (`text`): The version of the standard used. It must match the `version` from the request.

`identities`: A list of identities the user has selected to share with the relying party.
- `delegation` (optional): An array of delegations (as defined by the [IC interface specification, authentication section](https://internetcomputer.org/docs/current/references/ic-interface-spec/#authentication)):
- object with the following properties:
    - `pubkey` (`blob`): Public key as described in the [IC interface specification, signatures section](https://internetcomputer.org/docs/current/references/ic-interface-spec/#signatures).
    - `expiration` (`text`): Expiration of the delegation, in nanoseconds since 1970-01-01, as a base-10 string.
    - `targets` (`text` array): A list of target canister ids (textual representation) the delegation is restricted to making canister calls to. If the list is not present, the delegation applies to all canisters (i.e. it is not restricted).
- `signature` (`blob`): Signature on the 32-byte representation-independent hash of the map contained in the delegation field as described in [IC interface specification, signatures section](https://internetcomputer.org/docs/current/references/ic-interface-spec/#signatures), using the 27 bytes `\x1Aic-request-auth-delegation` as the domain separator. 

### Example RPC Response

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "version": "1",
    "identities": [
      {
        "tbd": "tbd"
      }
    ]
  }
}

```
## Message Processing

TODO

## Errors

This standard does not define additional errors. See [ICRC-25](./icrc_25_signer_interaction_standard.md#errors-3) for a list of errors that can be returned by all methods.