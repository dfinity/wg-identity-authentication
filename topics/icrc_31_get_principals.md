# ICRC-31: Get Principals

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)
[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./icrc_25_signer_interaction_standard.md)


<!-- TOC -->

- [ICRC-31: Get Principals](#icrc-31-get-principals)
    - [Summary](#summary)
    - [Method](#method)
    - [Request](#request)
      - [Example RPC Request ](#example-rpc-request)
    - [Response](#response)
      - [Example RPC Response ](#example-rpc-response)
    - [Errors](#errors)

## Summary

The purpose of the `icrc31_get_principals` message is for the relying party to receive information about the identities managed by the signer.

## Method

**Name and Scope:** `icrc31_get_principals`

**Prerequisite:** Active session with granted permission scope `icrc31_get_principals` or `*`.

## Request

**`version` (`text`):** The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

### Example RPC Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc31_get_principals",
  "params": {
    "version": "1"
  }
}
```

## Response

`version` (`text`): The version of the standard used. It must match the `version` from the request.

`principals` (`text` array): A list of principals (textual representation) the user has selected to share with the relying party.

### Example RPC Response

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "version": "1",
    "principals": [
      "gyu2j-2ni7o-o6yjt-n7lyh-x3sxq-zh7hp-sjvqe-t7oul-4eehb-2gvtt-jae",
      "fwpnd-r2y37-lv4ue-vyo3g-4u7zt-f5ncq-2ytan-zjs7b-2ioqf-n7j6u-gqe",
      "xnxbw-3qubw-pc2f7-6uu6l-sy7xq-ghk7l-mpxib-3ttyv-uw2x7-vfdhf-2ae"
    ]
  }
}
```

## Errors

This standard does not define additional errors. See [ICRC-25](./icrc_25_signer_interaction_standard.md#errors-4) for a list of errors that can be returned by all methods.