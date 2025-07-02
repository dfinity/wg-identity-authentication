# ICRC-146: Cross Chain JSON-RPC

![DRAFT] [![EXTENDS 25]](./icrc_25_signer_interaction_standard.md)

**Authors:** [Thomas Gladdines](https://github.com/sea-snake)

<!-- TOC -->
* [ICRC-146: Cross Chain JSON-RPC](#icrc-146-cross-chain-json-rpc)
  * [Summary](#summary)
  * [Supported chains](#supported-chains)
    * [Method](#method)
    * [Scope (according to the ICRC-25 standard)](#scope-according-to-the-icrc-25-standard)
      * [Example Permission Request](#example-permission-request)
    * [Request Params](#request-params)
      * [Example RPC Request](#example-rpc-request)
    * [Result](#result)
      * [Example RPC Response](#example-rpc-response)
  * [JSON-RPC call](#json-rpc-call)
    * [Method](#method-1)
    * [Scope (according to the ICRC-25 standard)](#scope-according-to-the-icrc-25-standard-1)
      * [Example Permission Request](#example-permission-request-1)
    * [Request Params](#request-params-1)
      * [Example RPC Request](#example-rpc-request-1)
      * [Example Batch RPC Request](#example-batch-rpc-request)
    * [Result](#result-1)
      * [Example RPC Response](#example-rpc-response-1)
      * [Example Batch RPC Response](#example-batch-rpc-response)
  * [Errors](#errors)
  * [`icrc25_supported_standards`](#icrc25_supported_standards)
<!-- TOC -->

## Summary

This standard defines a JSON-RPC interface for initiating and routing JSON-RPC calls across blockchains via CAIP-2 chain identifiers.

## Supported chains

Returns a list of supported CAIP-2 chain identifiers that the signer is capable of routing JSON-RPC requests to.

### Method

**Name:** `icrc146_chains`

**Prerequisite:** Granted permission scope `icrc146_chains`.

### Scope (according to the [ICRC-25 standard](./icrc_25_signer_interaction_standard.md))

**Scope:** `icrc146_chains`

#### Example Permission Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc25_request_permissions",
  "params": {
    "scopes": [
      {
        "method": "icrc146_chains"
      }
    ]
  }
}
```

### Request Params

None

#### Example RPC Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc146_chains"
}
```

### Result

**`chains` (`vec text`):** List of CAIP-2 chain identifiers.

#### Example RPC Response

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "chains": [
      "eip155:1",
      "bip122:000000000019d6689c085ae165831e93",
      "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
    ]
  }
}
```

## JSON-RPC call

Performs one or more JSON-RPC calls on a remote chain using a CAIP-2 chain identifier.

### Method

**Name:** `icrc146_rpc`

**Prerequisite:** Granted permission scope `icrc146_rpc`.

### Scope (according to the [ICRC-25 standard](./icrc_25_signer_interaction_standard.md))

**Scope:** `icrc146_rpc`

#### Example Permission Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc25_request_permissions",
  "params": {
    "scopes": [
      {
        "method": "icrc146_rpc"
      }
    ]
  }
}
```

### Request Params

**`chain` (`text`):** A CAIP-2 identifier for the target chain.

**`rpc`:** Either a single object or an array of JSON-RPC requests, each request **must** include:

- **`method`:** JSON-RPC method name.

- **`params`:** The arguments for the call.

#### Example RPC Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc146_rpc",
  "params": {
    "chainId": "eip155:1",
    "rpc": {
      "method": "eth_getBalance",
      "params": ["0x1234abcd...", "latest"]
    }
  }
}
```

#### Example Batch RPC Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc146_rpc",
  "params": {
    "chainId": "eip155:1",
    "rpc": [
      {
        "method": "eth_blockNumber",
        "params": []
      },
      {
        "method": "eth_getBalance",
        "params": ["0xabc...", "latest"]
      }
    ]
  }
}
```

### Result

Either a single object or an array of JSON-RPC responses, they **must** be in same order as requests and only include:

- **`result`:** JSON-RPC result.

_or_

- **`error`:** JSON-RPC error.


#### Example RPC Response

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "result": "0x0234c8a3397aab58"
  }
}
```

#### Example Batch RPC Response

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": [
    {
      "result": "0x12c4e2"
    },
    {
      "error": {
        "code": -32601,
        "message": "Method not found"
      }
    }
  ]
}
```

## Errors

See [ICRC-25](./icrc_25_signer_interaction_standard.md#errors-3) for a list of errors that can be returned by all methods.

This standard defines the following additional errors:

| Code | Message             | Meaning                                                                       | Data |
|------|---------------------|-------------------------------------------------------------------------------|------|
| 2002 | Chain not supported | The signer has rejected the request because the target chain is not supported | N/A  |

## `icrc25_supported_standards`

An ICRC-25 compliant signer must implement
the [icrc25_supported_standards](./icrc_25_signer_interaction_standard.md#icrc25_supported_standards) method which
returns the list of supported standards. Any signer implementing ICRC-146 must include a record with the name field equal
to "ICRC-146" in that list.


[DRAFT]: https://img.shields.io/badge/STATUS-DRAFT-f25a24.svg

[EXTENDS 25]: https://img.shields.io/badge/EXTENDS-ICRC--25-ed1e7a.svg