# ICRC-Y: Validate batch response

![APPROVED]

**Authors:** [Long Tran](https://github.com/baolongt)

<!-- TOC -->

- [ICRC-Y: Validate batch response](#icrc-y-validate-batch-response)
  - [Summary](#summary)
  - [Methods](#methods)
  - [Methods](#methods-1)
    - [icrcy_validate](#icrcy_validate)
    - [icrc10_supported_standards](#icrc10_supported_standards)
  - [Use-Cases](#use-cases)

## Summary

This standard is used for validating the response of batch transactions to ensure that all requests have been processed correctly.

## Methods

## Methods

### icrcy_validate

Return

```
icrcy_validate : (blob) -> bool
```

### icrc10_supported_standards

An implementation of ICRC-Y MUST implement the method icrc10_supported_standards as put forth in
[ICRC-10](https://github.com/dfinity/ICRC/ICRCs/ICRC-10).

The result of the call MUST always have at least the following entries:

```
// TODO: Fill detail url
```

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
