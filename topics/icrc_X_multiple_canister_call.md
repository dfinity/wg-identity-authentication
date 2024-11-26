# ICRC-X: Call batch canisters

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](#)
[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./icrc_25_signer_interaction_standard.md)
[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--49-ffcc222.svg)](./icrc_49_call_canister.md)

<!-- TOC -->

- [ICRC-X: Call batch canisters](#icrc-x-call-batch-canisters)
  - [Summary](#summary)
  - [Processing](#processing)
    - [Examples](#examples)
      - [Successful Batch Call](#successful-batch-call)
      - [Batch Call with Error](#batch-call-with-error)

## Summary

This Method can be used by the relying party to request batch call to 3rd party canister executed by the signer using the requested identity. In order to prevent misuse of this method all `icrcX_call_batch_canisters` requests are subject to user approval.

There is two main parameter for this standard

1. `mode` : The mode to execute transaction in sequence or in parallel
2. `requests` : An array of canister call requests

## Processing
**How it works**
1. Relying party requests a ICRCX batch transaction request to the signer. The request can be either `parallel` mode or `sequence` mode (see more details below). Unfortunately there is currently no mode to execute all transactions in the batch in one block.

2. The signer fetches consent messages and shows a warning to user to approve the batch transaction. 

3. The signer submits canister calls to target canisters:
- mode `parallel`: Execute all requests simultaneously, without waiting for any individual request to complete before starting the next.
- mode `sequence`: Execute each request one after the other, ensuring that each request is completed before starting the next one.

4. The signer, once it has collected responses from all the transactions, displays a response message to the user, and forwards the response to the relying partner. 

5. The relying partner, if any of the transactions failed, implements error handling.

**Important**
- With `parallel` processing, all transactions will be started. But it is not guaranteed that all transactions will succeed.
- With `sequence` processing, transactions will be executed in the designated sequence. If any transaction fails, the execution of the batch will stop without executing remaining queued transactions. 

The response of the individual transactions will be aggregated into the response of the batch call. If there are any errors in the response, it is up to the relying party to decide how to handle the error. 

**Flow**

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer
    participant U as User
    participant C as Target Canister

    RP ->> S: Request batch canisters call
    alt Relying party has not been granted the `icrcX_call_canister` permission scope<br>or the request does not comply with scope restrictions
        S ->> RP: Error response: Permission not granted (3000)
    else

        alt If signer want to use consent message from canisters
            loop for each call of calls in the `icrcX_call_canister`
                S ->> C: Get the consent message
                C ->> S: Return consent message
            end
        end

        S ->> U: Showing signing message from consent message or blind message


        alt Approved

            Note over S,C: Call the request for each canister in one of following two ways: <br/> - `parallel` <br /> - `sequence` abort if result is not success
                %% this is a comment 
                U ->> S: Approve request
                S ->> C: Submit canister call
                S ->> S: Wait for the canister call result
                S ->> S: Add call result to batch call response
            Note over S,C: End of the execution
        
        S ->> U: Display success/failed message
        S ->> RP: Return the batch call response
            
        else Rejected
             S ->> U: Display reject message
            S ->> RP: Error response: Action aborted (3001)
        end
    end
```

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
    "sender": "b7gqo-ulk5n-2kpo7-oalt7-p2kyl-o4j5l-kiuwo-eeybr-dab4l-ur6up-pqe",
    "requests": [
      {
        "id": 1,
        "canisterId": "xhy27-fqaaa-aaaao-a2hlq-ca",
        "method": "transfer",
        "arg": "RElETARte24AbAKzsNrDA2ithsqDBQFsA/vKAQKi3pTrBgHYo4yoDX0BAwEdV+ztKgq7E4l1ffuTuwEmw8AtYSjlrJ+WLO5ofQIAAMgB"
      },
      {
        "id": 2,
        "canisterId": "xhy27-fqaaa-aaaao-a2hlq-ca",
        "method": "transfer",
        "arg": "RElETARte24AbAKzsNrDA2ithsqDBQFsA/vKAQKi3pTrBgHYo4yoDX0BAwEdV+ztKgq7E4l1ffuTuwEmw8AtYSjlrJ+WLO5ofQIAAMgB"
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
        "result": {
          "Ok": "16509194"
        }
      },
      {
        "id": 2,
        "result": {
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
    "sender": "b7gqo-ulk5n-2kpo7-oalt7-p2kyl-o4j5l-kiuwo-eeybr-dab4l-ur6up-pqe",
    "isAnonymous": false,
    "requests": [
      {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "icrc49_call_canister",
        "params": {
          "canisterId": "xhy27-fqaaa-aaaao-a2hlq-ca",
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
        "result": {
          "version": "1",
          "Ok": "16509194"
        }
      },
      {
        "id": 2,
        "result": {
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
        "error": {
          "code": 1000,
          "message": "Network error: Unable to establish a connection to the server"
        }
      }
    ]
  }
}
```
