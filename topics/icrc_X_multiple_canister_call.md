# ICRC-X: Call batch canisters

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](#)
[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./icrc_25_signer_interaction_standard.md)
[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--49-ffcc222.svg)](./icrc_49_call_canister.md)

<!-- TOC -->

- [ICRC-X: Call batch canisters](#icrc-x-call-batch-canisters)
  - [Summary](#summary)
  - [Processing](#processing)
  - [Error handling](#error-handling)
    - [Examples](#examples)
      - [Successful Batch Call](#successful-batch-call)
      - [Batch Call with Error](#batch-call-with-error)

## Summary

This Method can be used by the relying party to request batch call to 3rd party canister executed by the signer using the requested identity. In order to prevent misuse of this method all `icrcX_call_batch_canisters` requests are subject to user approval.

There is two main parameter for this standard

1. `mode` : The mode to execute transaction in sequence or in parallel
2. `requests` : An array of icrc49_call_canister RPC call

## Processing

When a signer receives a call, it must process `icrc49_call_canister` requests based on the provided mode:

- mode `sequence`: Execute each request one after the other, ensuring that each request is completed before starting the next one.

- mode `parallel`: Execute all requests simultaneously, without waiting for any individual request to complete before starting the next one.

**IMPORTANT**

1. If any call fails, whether due to a canister return error or a signer call error, the execution will not stop until all requests have been processed.

## Error handling

- For canister return error it treat like
- For canister trapped error it treat like

### Examples

#### Successful Batch Call

Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrcX_batch_call_canisters",
  "params": {
    "mode": "sequence",
    "requests": [
      {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "icrc49_call_canister",
        "params": {
          "canisterId": "xhy27-fqaaa-aaaao-a2hlq-ca",
          "sender": "b7gqo-ulk5n-2kpo7-oalt7-p2kyl-o4j5l-kiuwo-eeybr-dab4l-ur6up-pqe",
          "method": "transfer",
          "arg": "RElETARte24AbAKzsNrDA2ithsqDBQFsA/vKAQKi3pTrBgHYo4yoDX0BAwEdV+ztKgq7E4l1ffuTuwEmw8AtYSjlrJ+WLO5ofQIAAMgB"
        }
      },
      {
        "id": 2,
        "jsonrpc": "2.0",
        "method": "icrc49_call_canister",
        "params": {
          "canisterId": "xhy27-fqaaa-aaaao-a2hlq-ca",
          "sender": "b7gqo-ulk5n-2kpo7-oalt7-p2kyl-o4j5l-kiuwo-eeybr-dab4l-ur6up-pqe",
          "method": "transfer",
          "arg": "RElETARte24AbAKzsNrDA2ithsqDBQFsA/vKAQKi3pTrBgHYo4yoDX0BAwEdV+ztKgq7E4l1ffuTuwEmw8AtYSjlrJ+WLO5ofQIAAMgB"
        }
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
    "responses": [
      {
        "id": 1,
        "jsonrpc": "2.0",
        "result": {
          "version": "1",
          "Ok": "16509194"
        }
      },
      {
        "id": 2,
        "jsonrpc": "2.0",
        "result": {
          "version": "1",
          "Ok": "16509195"
        }
      }
    ]
  }
}
```

#### Batch Call with Error

Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrcX_batch_call_canisters",
  "params": {
    "mode": "",
    "requests": [
      {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "icrc49_call_canister",
        "params": {
          "canisterId": "xhy27-fqaaa-aaaao-a2hlq-ca",
          "sender": "b7gqo-ulk5n-2kpo7-oalt7-p2kyl-o4j5l-kiuwo-eeybr-dab4l-ur6up-pqe",
          "method": "transfer",
          "arg": "RElETARte24AbAKzsNrDA2ithsqDBQFsA/vKAQKi3pTrBgHYo4yoDX0BAwEdV+ztKgq7E4l1ffuTuwEmw8AtYSjlrJ+WLO5ofQIAAMgB"
        }
      },
      {
        "id": 2,
        "jsonrpc": "2.0",
        "method": "icrc49_call_canister",
        "params": {
          "canisterId": "xhy27-fqaaa-aaaao-a2hlq-ca",
          "sender": "b7gqo-ulk5n-2kpo7-oalt7-p2kyl-o4j5l-kiuwo-eeybr-dab4l-ur6up-pqe",
          "method": "transfer",
          "arg": "RElETARte24AbAKzsNrDA2ithsqDBQFsA/vKAQKi3pTrBgHYo4yoDX0BAwEdV+ztKgq7E4l1ffuTuwEmw8AtYSjlrJ+WLO5ofQIAAMgB"
        }
      },
      ,
      {
        "id": 3,
        "jsonrpc": "2.0",
        "method": "icrc49_call_canister",
        "params": {
          "canisterId": "xhy27-fqaaa-aaaao-a2hlq-ca",
          "sender": "b7gqo-ulk5n-2kpo7-oalt7-p2kyl-o4j5l-kiuwo-eeybr-dab4l-ur6up-pqe",
          "method": "transfer",
          "arg": "RElETARte24AbAKzsNrDA2ithsqDBQFsA/vKAQKi3pTrBgHYo4yoDX0BAwEdV+ztKgq7E4l1ffuTuwEmw8AtYSjlrJ+WLO5ofQIAAMgB"
        }
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
    "responses": [
      {
        "id": 1,
        "jsonrpc": "2.0",
        "result": {
          "version": "1",
          "Ok": "16509194"
        }
      },
      {
        "id": 2,
        "jsonrpc": "2.0",
        "result": {
          "version": "1",
          "Err": {
            "InsufficientFunds": {
              "balance": {
                "e8s": "0"
              }
            }
          }
        }
      },
      {
        "id": 3,
        "jsonrpc": "2.0",
        "error": {
          "code": 1000,
          "message": "Network error: Unable to establish a connection to the server"
        }
      }
    ]
  }
}
```
