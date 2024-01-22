# ICRC-39: Batch Calling

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)
[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./icrc_25_signer_interaction_standard.md)

<!-- TOC -->
* [ICRC-39: Batch Calling](#icrc-39-batch-calling)
  * [Summary](#summary)
  * [Batch Processing](#batch-processing)
    * [Examples](#examples)
      * [Successful Batch Call](#successful-batch-call)
      * [Batch Call with Error](#batch-call-with-error)
  * [Errors](#errors)
<!-- TOC -->

## Summary

JSON-RPC defines a [batch call](https://www.jsonrpc.org/specification#batch) as a JSON array of requests. By supporting this standard a signer declares that all methods offered by the signer may also be invoked as part of a batch.

If a signer receives a batch call, it must process each request sequentially in order of the id and reply with a batch response. If any call results in an error response the signer must not process any further calls in the batch but add an error for any not executed call in the batch.

## Batch Processing

Batch call must be processed by signers as follows:

1. Order all requests in the batch by their id in ascending order.
2. Sequentially, for each request in the batch
   1. Process the request as defined in the appropriate standard.
   2. Evaluate the result of processing the request:
      1. If the result is a successful response, add the result to the batch response. Proceed with processing the next request in the batch.
      2. If the result is an error, add an error to the batch response and stop processing the batch. For any request in the batch that has not been processed yet, add an error response with code `10101` to the batch response.
3. Send the batch response to the relying party.


### Examples

#### Successful Batch Call

Request

```json
[
    {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "icrc25_request_permissions",
        "params": {
            "version": "1",
            "scopes": [
                {
                    "method": "icrc31_get_principals"
                }
            ]
        }
    },
    {
        "id": 2,
        "jsonrpc": "2.0",
        "method": "icrc31_get_principals",
        "params": {
            "version": "1"
        }
    }
]
```

Response

```json
[
    {
        "id": 1,
        "jsonrpc": "2.0",
        "result": {
            "version": "1",
            "scopes": [
                {
                    "method": "icrc31_get_principals"
                }
            ]
        }
    },
    {
        "id": 2,
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
]
```

#### Batch Call with Error

Request

```json
[
    {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "icrc25_request_permissions",
        "params": {
            "version": "1",
            "scopes": [
                {
                    "method": "icrc31_get_principals"
                }
            ]
        }
    },
    {
        "id": 2,
        "jsonrpc": "2.0",
        "method": "icrc31_get_principals",
        "params": {
            "version": "1"
        }
    }
]
```

Response

```json
[
    {
        "id": "1",
        "jsonrpc": "2.0",
        "error": {
            "code": 30101,
            "message": "Permission not granted"
        }
    },
    {
        "id": "2",
        "jsonrpc": "2.0",
        "error": {
            "code": 10101,
            "message": "Not processed due to batch request failure"
        }
    }
]
```

## Errors

In addition to the errors defined in [ICRC-25](./icrc_25_signer_interaction_standard.md#errors-3) this standard defines the following errors:


| Code  | Message                                    | Meaning                                                                                          | Data                                                                                |
|-------|--------------------------------------------|--------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| 10101 | Not processed due to batch request failure | The message was not processed as one of the preceding request in the batch resulted in an error. | (optional) Error details: <ul> <li>`message` (`text`, optional): message</li> </ul> |