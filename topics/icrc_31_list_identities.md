# ICRC-31: List Identities

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)
[![Extention Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./icrc_25_signer_interaction_standard.md)


<!-- TOC -->

- [ICRC-31: List Idenities](#icrc-31-list-identities)
    - [Summary](#summary)
    - [Method](#method)
    - [Request](#request)
      - [Example RPC Request ](#example-rpc-request)
    - [Response](#response)
      - [Example RPC Response ](#example-rpc-response)
    - [Errors](#errors)

## Summary

The purpose of the `icrc31_list_identities` message is for the relying party to receive information about the identities managed by the signer.

## Method

**Name and Scope:** `icrc31_list_identities`

**Prerequisite:** Active session with granted permission scope `icrc31_list_identities` or `*`.

## Request

**`version` (`text`):** The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

### Example RPC Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc31_list_identities",
  "params": {
    "version": "1"
  }
}
```

## Response

`version` (`text`): The version of the standard used. It must match the `version` from the request.

`identities`: A list of identities the user has selected to share with the relying party.

- `publicKey` (`blob`): The DER-encoded public key associated with the identity, derived in accordance with one of [the signature algorithms supported by the IC](https://internetcomputer.org/docs/current/references/ic-interface-spec/#signatures). The public key can be used to [derive a self-authenticating principal](https://internetcomputer.org/docs/current/references/ic-interface-spec/#principal).

### Example RPC Response

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "version": "1",
    "identities": [
      {
        "publicKey": "MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEOTdHYwpFTr/oPXOfLQcteymk8AQE41VwPQ1W7Xpm0Zt1AY4+5aOnMAbAIjXEchxPuGbPWqPqwntXMPs3w4rOaA=="
      }
    ]
  }
}
```

## Errors

This standard does not define additional errors. See [ICRC-25](./icrc_25_signer_interaction_standard.md#errors-4) for a list of errors that can be returned by all methods.