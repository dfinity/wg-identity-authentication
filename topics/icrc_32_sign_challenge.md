# ICRC-32: Sign Challenge

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)
[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./icrc_25_signer_interaction_standard.md)

<!-- TOC -->
* [ICRC-32: Sign Challenge](#icrc-32-sign-challenge)
  * [Summary](#summary)
  * [Method](#method)
  * [Scope (according to the ICRC-25 standard)](#scope-according-to-the-icrc-25-standard)
    * [Example Permission Requests](#example-permission-requests)
  * [`icrc25_supported_standards`](#icrc25_supported_standards)
  * [Request](#request)
    * [Example RPC Request](#example-rpc-request)
  * [Response](#response)
    * [Example RPC Response](#example-rpc-response)
  * [Message Processing](#message-processing)
  * [Errors](#errors)
<!-- TOC -->
## Summary

The purpose of the `icrc32_sign_challenge` method is for the relying party to receive a cryptographic proof of ownership for the users identities.

## Method

**Name:** `icrc32_sign_challenge`

**Prerequisite:** Active session with granted permission scope `icrc32_sign_challenge` or `*`.
* This scope may be restricted to specific principals.

## Scope (according to the [ICRC-25 standard](./icrc_25_signer_interaction_standard.md))

**Scope:** `icrc32_sign_challenge`

**Optional Properties:**
- `principals` (`text` array): A list of principals (textual representation) the scope is restricted to. If the list is not present, the scope applies to all senders (i.e. the permission is not restricted).

### Example Permission Requests

No restriction:
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc25_request_permissions",
    "params": {
        "version": "1",
        "scopes": [
            {
                "method": "icrc32_sign_challenge"
            }
        ]
    }
}
```
With restriction:
```json
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "icrc25_request_permissions",
    "params": {
        "version": "1",
        "scopes": [
            {
                "method": "icrc32_sign_challenge",
                "principals": [
                    "btbdd-ob3pe-dz6kv-7n4gh-k2xtm-xjthz-kcvpk-fwbnv-w5qbk-iqjm4-4qe",
                    "b7gqo-ulk5n-2kpo7-oalt7-p2kyl-o4j5l-kiuwo-eeybr-dab4l-ur6up-pqe"
                ]
            }
        ]
    }
}
```

## `icrc25_supported_standards`

An ICRC-25 compliant signer must implement the [icrc25_supported_standards](./icrc_25_signer_interaction_standard.md#icrc25_supported_standards) method which returns the list of supported standards. Any signer implementing ICRC-32 must include a record with the name field equal to "ICRC-32" in that list.

## Request

**`version` (`text`):** The version of the standard used. If the signer does not support the version of the request, it must send the `"VERSION_NOT_SUPPORTED"` error in response.

**`principal` (`text`):** Principal (textual representation) corresponding to the identity that the signer should provide the challenge signature for.

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
    - If the relying party has not been granted the permission to invoke the method for the specified principal, the signer sends a response with an error back to the relying party.
3. The signer may ask the user to approve the request.
    - If the user does not approve the request, the signer sends a response with an error back to the relying party.
4. The signer signs the challenge with the private keys associated with the identity corresponding to the given principal and sends a successful response with the signature (and optionally the associated `delegation`) back to the relying party.
5. After receiving a successful response, the relying party verifies that the signer is able to create signatures on behalf of the identity associated with the principal provided in the request:
    - The relying party validates that the self-authenticating principal derived from the `publicKey` in the `signedChallenge` is equal to the principal provided in the request. If this check fails, the relying party rejects the response.
    - Determine the public key for verifying the signature of the challenge:
      - If `delegation` is present and non-empty:
        - If the `delegation` array contains more than 20 elements, the relying party rejects the response.
        - The relying party validates that all delegations are not expired according to their respective `expiration` timestamp.
        - The relying party validates all `signature` values of all delegations in the `delegation` list. For the first delegation in the array, this signature must be valid with respect to the public key corresponding to the `publicKey` field of the identity, all subsequent delegations are signed with the key corresponding to the public key contained in the preceding delegation. The key to validate the challenge signature is the public key contained in the last delegation in the array.
      - Otherwise, the key to validate the challenge signature with is the public key contained in the `publicKey` field of the identity.
    - The relying party retrieves the public key to verify the challenge according to the previous step, determines the `signature` scheme and verifies whether it was generated by signing the concatenation of the domain separator `\x13ic-signer-challenge` (UTF-8 encoded) and the `challenge` from the request with the private key associated with that public key.
        - If the signature verification succeeds, the relying party accepts the response.
        - If the signature verification fails, the relying party rejects the response.

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer
    participant U as User

    RP ->> S: Request challenge signature
    alt Version is not supported
        S ->> RP: Error response: Version not supported (20101)
    else Scope `icrc32_sign_challenge` not granted for the principal
        S ->> RP: Error response: Permission not granted (30101)
    else
        S ->> U: Ask to approve sign challenge request
        U ->> S: Approve sign challenge request
        S ->> S: Sign the challenge
        S ->> RP: Challenge signature response
        RP ->> RP: Verify the challenge signature
    end
```

## Errors

This standard does not define additional errors. See [ICRC-25](./icrc_25_signer_interaction_standard.md#errors-3) for a list of errors that can be returned by all methods.
