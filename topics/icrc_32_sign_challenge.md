# ICRC-32: Sign Challenge

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)
[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./icrc_25_signer_interaction_standard.md)

<!-- TOC -->

- [ICRC-32: Sign Challenge](#icrc-32-sign-challenge)
  - [Summary](#summary)
  - [Method](#method)
  - [Request](#request)
    - [Example RPC Request ](#example-rpc-request)
  - [Response](#response)
    - [Example RPC Response ](#example-rpc-response)
  - [Message Processing](#message-processing)
  - [Errors](#errors)

## Summary

The purpose of the `icrc32_sign_challenge` method is for the relying party to receive a cryptographic proof of ownership for the users identities.

## Method

**Name and Scope:** `icrc32_sign_challenge`

**Prerequisite:** Active session with granted permission scope `icrc32_sign_challenge` or `*`.

## Request

**`version` (`text`):** The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

**`principal` (`text`):** The identity to use to create the signature.

**`challenge` (`blob`):** A challenge used for the signer to sign in order to prove its access to the identity. The challenge should be an array of 32 cryptographically random bytes generated from a secure random source by the sender of the request.

### Example RPC Request

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "icrc32_sign_challenge",
  "params": {
    "version": "1",
    "principal": "rwlgt-iiaaa-aaaaa-aaaaa-cai",
    "challenge": "UjwgsORvEzp98TmB1cAIseNOoD9+GLyN/1DzJ5+jxZM="
  }
}
```

## Response

`version` (`text`): The version of the standard used. It must match the `version` from the request.

`signedChallenge`: Object containing the signed challenge and related data to verify the signature.

- `publicKey` (`blob`): The DER-encoded public key associated with the identity, derived in accordance with one of [the signature algorithms supported by the IC](https://internetcomputer.org/docs/current/references/ic-interface-spec/#signatures). The public key can be used to [derive a self-authenticating principal](https://internetcomputer.org/docs/current/references/ic-interface-spec/#principal).
- `signature` (`blob`): The signature produced by signing the concatenation of the domain separator `\x13ic-signer-challenge` (UTF-8 encoded) and the challenge with the private key associated with the identity.
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
    // TODO: example response has to be updated
    "signedChallenge": {
      "publicKey": "MIIBIjANBgkqhkiG",
      "signature": "MEUCIQDQ8Z3Z"
    }
  }
}
```

## Message Processing

1. The relying party sends a `icrc32_sign_challenge` request to the signer.
2. Upon receiving the message, the signer first checks if it can process the message.
    - If the request version is not supported by the signer, the signer sends a response with an error back to the relying party.
    - If the relying party has not been granted the permission to request the action, the signer sends a response with an error back to the relying party.
3. The signer signs the challenge with the private keys associated with the identity associated with the given principal and sends a successful response with the signature back to the relying party.
4. After receiving a successful response, the relying party verifies that the signer has access to the private key associated with the provided identity:
    - Determine the public key for verifying the signature of the challenge:
      - If `delegation` is present and non-empty:
        - If the `delegation` array contains more than 20 elements, the relying party rejects the response.
        - The relying party validates that the delegation is not expired by checking the `expiration` timestamp.
        - The relying party validates the `signature` value. For the first delegation in the array, this signature must be valid with respect to the public key corresponding to the `publicKey` field of the identity, all subsequent delegations are signed with the key corresponding to the public key contained in the preceding delegation. The key to validate the challenge signature is the public key contained in the last delegation in the array.
      - Otherwise the key to validate the challenge signature with is the public key contained in the `publicKey` field of the identity.
    - The relying party retrieves the public key to verify the challenge from each identity according to the previous step, determines the `signature` scheme and verifies whether it was generated by signing the concatenation of the domain separator `\x13ic-signer-challenge` (UTF-8 encoded) and the `challenge` from the request with the private key associated with that public key.
        - If the signature verification succeeds for all `identities`, the relying party accepts the response.
        - If the signature verification fails for any `identities` value, the relying party rejects the response.

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer
    participant U as User

    RP ->> S: Request Signature
    alt Version is not supported
        S ->> RP: Error response: Version not supported (20101)
    else Scope `icrc31_list_identities` not granted
        S ->> RP: Error response: Permission not granted (30101)
    else
        opt retrieve delegation
            S ->> U: Ask to approve delegation creation for principal
            U ->> S: Approved delegation
        end
        S ->> S: Sign the challenge
        S ->> RP: Signatures response
        RP ->> RP: Verify the signatures
    end
```

## Errors

This standard does not define additional errors. See [ICRC-25](./icrc_25_signer_interaction_standard.md#errors-4) for a list of errors that can be returned by all methods.