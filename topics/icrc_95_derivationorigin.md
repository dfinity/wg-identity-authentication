# ICRC-95: Derivation Origin

![APPROVED] [![EXTENDS 25]](./icrc_25_signer_interaction_standard.md)

**Authors:** [Dan Ostrovsky](https://github.com/dostro)

<!-- TOC -->
* [ICRC-95: Derivation Origin](#icrc-95-derivation-origin)
  * [Summary](#summary)
  * [Motivation](#motivation)
  * [Specification](#specification)
    * [Definitions](#definitions)
    * [derivationOrigin Parameter](#derivationorigin-parameter)
  * [Reference Implementation](#reference-implementation)
    * [Signer](#signer)
  * [DApp Implementation](#dapp-implementation)
<!-- TOC -->

## Summary

A definition of the `derivationOrigin` parameter for inclusion in ICRC-25 and all of its extensions.

## Motivation

Internet Identity, NFID Wallet, and other such on-chain signers currently use a relying party's origin to derive principal identifiers. When relying parties switch DNS names or add subdomains to their applications, users will authenticate with different identifiers and therefore be unable to access their original data.

In this proposal, we present a solution that focuses on incorporating the existing method for authenticating users with the same principal identifiers across different domains, but in a way that extends the current framework of ICRC standards.

## Specification

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in [RFC-2119](https://www.rfc-editor.org/rfc/rfc2119).

### Definitions

Signer: A user agent that manages keys and facilitates transactions with ICP.

Relying party: A web page that relies upon one or many Web3 platform APIs which are exposed to the web page via the signer.

### derivationOrigin Parameter

ICRC-25 and all of its extensions (in particular, ICRC-27, ICRC-34, ICRC-49) will have the option of adding another parameter to its request named `icrc95DerivationOrigin`.

Principal identifiers are derived by the origin. If you want to derive principals by another domain, this is the standard to do that 
and the verification spec can be found [here](https://internetcomputer.org/docs/current/references/ii-spec#alternative-frontend-origins).

## Reference Implementation

### Signer

Here is a reference implementation for a Signer to [validate the derivationOrigin](https://github.com/dfinity/internet-identity/blob/51f050b3f0bf5c21e55f62577bcb4d51c954f738/src/frontend/src/utils/validateDerivationOrigin.ts#L20).

## DApp Implementation

Here is the DApp's request for a delegation using ICRC-95: derivationOrigin:

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc34_delegation",
  "params": {
    "publicKey": "MDwwDAYKKwYBBAGDuEMBAgMsAAoAAAAAAGAAJwEB9YN/ErQ8yN+14qewhrU0Hm2rZZ77SrydLsSMRYHoNxM=",
    "icrc95DerivationOrigin": "https://app.nfidvaults.com",
    "targets": [
      "xhy27-fqaaa-aaaao-a2hlq-cai"
    ],
    "maxTimeToLive": "28800000000000"
  }
}
```

[APPROVED]: https://img.shields.io/badge/STATUS-APPROVED-ed1e7a.svg

[EXTENDS 25]: https://img.shields.io/badge/EXTENDS-ICRC--25-ed1e7a.svg