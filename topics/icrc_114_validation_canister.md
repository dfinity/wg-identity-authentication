# ICRC-114: Validate batch response

![APPROVED] [![EXTENDS 25]](./icrc_25_signer_interaction_standard.md)

**Authors:** [Long Tran](https://github.com/baolongt)

<!-- TOC -->

- [ICRC-Y: Validate batch response](#icrc-y-validate-batch-response)
  - [Summary](#summary)
  - [Methods](#methods)
    - [icrcy_validate](#icrcy_validate)
    - [icrc25_supported_standards](#icrc25_supported_standards)
  - [Use-Cases](#use-cases)

## Summary

This standard is used for validating the response of batch transactions to ensure that all requests have been processed correctly.

## Methods

### icrcy_validate

This method received the response from previous canister call send it as blob.

Eg: Canister call response

```
// signer received payload
{
  "contentMap": "2dn3p2NhcmdYTkRscmVxdWVzdF90eXBlZGNhbGxmc2VuZGVyWB1q63Snu+4C5/fpWFu4nq1IpZxCYDEYA8XSPqPfAg==",
  "certificate": "..."
}
```

It can be `Ok` or `Err` in Rust and Motoko. In order to decide continue execute ICRC-112 or not. This validate canister have to parse the contentMap and return the boolean value of that request

**Candid**

```
type CanisterCall = record {
    canister_id: principal;
    method: text;
    nonce: optional blob;
    arg: blob;
    res: blob;
};
icrc114_validate : (vec CanisterCall) -> bool
```

## icrc25_supported_standards

An ICRC-25 compliant signer must implement the [icrc25_supported_standards](icrc_25_signer_interaction_standard.md#icrc25_supported_standards) method which returns the list of supported standards. 
Any signer implementing ICRC-114 must include a record with the name field equal to "ICRC-114" in that list.

## Use-Cases

- Validate the results of batch transactions to ensure all requests were processed successfully.
- Provide a mechanism to check the success or failure of each individual request within a batch.

```mermaid
sequenceDiagram
    participant S as Signer
    participant C as Target Canister
    Note over C, S: Interactions follow ICRC-112 <br /> standard batch execution
    S ->> C: Call ICRC-Y with response
    C ->> S: Return result
    S ->> S: Decide continue ICRC-112 or not


```
