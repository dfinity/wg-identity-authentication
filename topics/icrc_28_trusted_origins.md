# ICRC-28: Trusted Origins

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)
[![Standard Issue](https://img.shields.io/badge/ISSUE-ICRC--28-blue?logo=github)](https://github.com/dfinity/wg-identity-authentication/issues/115)

<!-- TOC -->

* [ICRC-28: Trusted Origins](#icrc-28-trusted-origins)
    * [Summary](#summary)
    * [Identify](#identify)
    * [Verify](#verify)
        * [icrc28_get_trusted_origins](#icrc28_get_trusted_origins)
    * [Supported standards](#supported-standards)
        * [icrc28_supported_standards](#icrc28_supported_standards)
    * [Use-Cases](#use-cases)
        * [Hot Signer Use-Case](#hot-signer-use-case)
        * [Cold Signer Use-Case](#cold-signer-use-case)

<!-- TOC -->

## Summary

When a relying party wants to authenticate as a user, it uses a session key (e.g., Ed25519 or ECDSA), and by way of the
authentication flow ([ICRC-34](./icrc_34_get_global_delegation.md) or [ICRC-57](./icrc_57_get_session_delegation.md))
obtains a delegation chain that allows the session key to sign for the user's global or session identity.

In case the global authentication flow ([ICRC-34](./icrc_34_get_global_delegation.md)) is used, a delegation chain for
the user's global identity is obtained. Since a global identity is not scoped per relying party, canisters from other
relying parties can be called on behalf of the user without user approval unless the delegation chain is restricted.

Therefore, a signer **MUST** restrict the delegation chain for the user's global identity to a set of canister
targets that trust the relying party that requested the delegation chain. This standard describes how a canister can
indicate that a relying party is trusted.

## Identify

The window origin (as defined in https://developer.mozilla.org/en-US/docs/Glossary/Origin) is used to identify one
relying party from another.

> The origin is the concatenation of the protocol and "://", the host name if one exists, and ":" followed by a port
> number if a port is present and differs from the default port for the given protocol. Examples of typical origins
> are https://example.org (implying port 443), http://example.net (implying port 80), and http://example.com:8080.

When the signer obtains the origin of the relying party, it **MUST** make sure that it's genuine. Which means that the
transport channel used between the relying party and signer, must return a origin that can be trusted to be genuine
e.g. [ICRC-29](./icrc_29_window_post_message_transport.md).

## Verify

When the signer receives a delegation chain request for a global identity, it must verify that the canisters targets
trust the relying party making the request. The signer can use the below method to get a list of trusted origins for
each canister target and then verify if the relying party is within each list.

### icrc28_get_trusted_origins

Returns a list of origins trusted by the canister.

```
icrc28_get_trusted_origins : () -> (vec text);
```

## Supported standards

The signer can use below method to check if the ICRC-28 standard and any related standards are supported.

### icrc28_supported_standards

Returns a list of supported standards related to trusted origins that this canister implements. This query call must not
require authentication.

```
icrc28_supported_standards : () -> (vec record { name : text; url : text }) query;
```

The result should always have at least one entry:

```
record { name = "ICRC-28"; url = "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-28/ICRC-28.md" }
```

## Use-Cases

The `icrc28_get_trusted_origins` method is designed to be used with both cold and hot signers.

### Hot Signer Use-Case

This section describes the interactions between the signer and the relying party for _hot_ signers:

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer
    participant C as Target Canister
    Note over RP, S: Interactions follow ICRC-34 standard
    RP ->> S: Request global delegation
    loop For every target canister
        S ->> C: Get trusted origins
        C ->> S: List of trusted origins
    end
    alt Origin is trusted by all targets canisters
        S ->> RP: Signed delegation
    else
        S ->> RP: Error response
    end
```

1. The relying party connects to the signer and requests a global delegation for a given principal and list of target
   canisters.
2. For every target canister the signer:
    1. Gets the `icp:public trusted_origins` metadata using read state request
    2. The metadata response must be certified and valid:
        * The `icp:public trusted_origins` metadata must be provided in a valid certificate (
          see [Certification](https://internetcomputer.org/docs/current/references/ic-interface-spec#certification)).
        * The `icp:public trusted_origins` metadata must not be `null` and match `vec text`.
3. The signer verifies that relying party origin is within the `icp:public trusted_origins` metadata for all targets.
    * If the origin is trusted by all targets, continue with step 4.
    * If the origin is not trusted by all targets, the signer returns an error to the relying party. No further steps
      are executed.
4. The global delegation returned to the relying party.

### Cold Signer Use-Case

This section describes the interactions between the signer and the relying party for _cold_ signers:

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Chain Connected Signer Component
    participant C as Target Canister
    participant CS as Cold Signer Component
    participant U as User
    Note over RP, S: Interactions follow ICRC-34 standard
    RP ->> S: Request global delegation
    loop For every target canister
        S ->> C: Get trusted origins
        C ->> S: List of trusted origins
    end
    S ->> CS: - Relying party origin<br>- Delegation request<br>- Trusted origins responses
    CS ->> CS: Validate delegation request
    alt Invalid
        CS ->> S: Transfer error
        S ->> RP: Error response
    else
        U ->> CS: Verify origin and approve / reject
        alt Approved
            CS ->> CS: Sign delegation request
            CS ->> S: Transfer signed delegation
            S ->> RP: Signed delegation
        else Invalid
            CS ->> S: Transfer error
            S ->> RP: Error response
        end
    end
```

1. The relying party connects to the signer and requests a global delegation for a given principal and list of target
   canisters.
2. For every target canister the signer gets the `icp:public trusted_origins` metadata using read state request
3. The relying party origin and global delegation request as well as the certified metadata responses are transferred to
   the cold signer component.
4. The cold signer component validates the delegation request:
    1. The metadata responses must match the delegation request targets:
    2. The metadata responses must be certified and valid:
        * The `icp:public trusted_origins` metadata must be provided in a valid certificate (
          see [Certification](https://internetcomputer.org/docs/current/references/ic-interface-spec#certification)).
        * The time of all metadata responses must all be within the same reasonable time range.
        * The `icp:public trusted_origins` metadata must not be `null` and match `vec text`.
    3. The relying party origin must be within the `icp:public trusted_origins` of all metadata responses.
5. If validation is successful, the origin is presented to the user.
    * If the user recognizes the origin and approves, continue with step 6.
    * If the user rejects (or does not respond within a certain time frame), the signer returns an error to the relying
      party (via the chain connected component). No further steps are executed.
6. The delegation request is signed and transferred to the chain connected component.
    * The expiry of the delegation request is set to the most recent time within the metadata responses plus a
      reasonable session length that is less than or equal to the maxTimeToLive value in the delegation request.
7. The delegation is returned to the relying party.

> It's recommended to have the Chain Connected Signer Component verify the delegation request beforehand as described in
> above _hot_ signer interaction use-case. To reject invalid requests early before interacting with the cold signer.
