# ICRC-21: Canister Call Consent Messages

![APPROVED]

**Authors:** [Frederik Rothenberger](https://github.com/frederikrothenberger), [Thomas Gladdines](https://github.com/sea-snake)

## Summary
This specification describes a protocol for obtaining human-readable consent messages for canister calls. These messages are intended to be shown to users to help them make informed decisions about whether to approve a canister call / sign a transaction.

The protocol is designed in such a way that it can be used interactively (e.g. in a browser-based signer) or non-interactively (e.g. in a cold signer).

## Terminology

* signer: a service that manages the keys of a user and can sign canister calls on their behalf. This component displays the consent message to the user. The signer may be split in a hot (with connection to the IC) and cold (offline) component.
* relying party: the service that requests a signature on a specific canister call.
* target canister: the canister that is the target of the canister call.

## Motivation

Interactions with canisters can have significant consequences. For example, a canister might transfer funds or provide access to sensitive information. At the same time interactions with canisters are often technical and require a deep understanding of the canister's implementation to accurately assess the consequences of a specific canister call. This makes it very difficult for users to make informed decisions about whether to sign a canister call.

The mechanisms described in this specification ease the technical burden and empower users to make informed decisions before signing canister calls.

## Assumptions
* The signer is trusted by the user.
* The relying party is _not_ trusted and might be malicious.
* The target canister is trusted by the user. Interactions with malicious canisters are not covered by this specification. In particular, interacting with a malicious canister can produce arbitrary outcomes regardless of how user consent was collected.

## Canister Call Consent Message Interface

The interface specified in [ICRC-21.did](ICRC-21.did) must be implemented to support canister call consent messages.
In addition to implementing this interface, it is recommended that the canister also provides its full candid interface in the public `candid:service` metadata section, as discussed [here](https://forum.dfinity.org/t/rfc-canister-metadata-standard). This is required to properly decode the arguments if the signer also wants to display technical information about the canister call.

### Authentication

The signer may send the `icrc21_canister_call_consent_message` call using the same identity as it would for the actual canister call for which the consent message was issued.

Any canister implementing the `icrc21_canister_call_consent_message` interface must not require authentication for this call. Anonymous consent messages are required in the [cold signer use-case](#cold-signer-use-case) which would otherwise require two interactions with the cold signer component, making the flow very cumbersome for users.

Canisters may add additional or different information if a non-anonymous `sender` is used.
For example, a canister might include private information in the consent message, if the call is made by the owner of that information.

> **_WARNING:_**  Canister developers must take care to not rely on the current state of the canister / identity attached data when issuing the consent message. There might be a significant time delay (depending on the signer used) between retrieving the consent message and submitting the canister call. The consent message must accurately describe all possible outcomes of the canister call, accounting for that time delay.

> **_NOTE:_** The `icrc21_canister_call_consent_message` method is currently declared as an `update` call, due to the necessity
> of supporting dynamic data in a secure way. As soon as secure (replicated) query calls are available, this will be changed to such a replicated query call.

## Use-Cases

The canister call is designed to be used with both cold and hot signers. In addition to the signer use-cases it can also be used to enhance the documentation on generic canister interfaces.

### Hot Signer Use-Case

This section describes the interactions between the signer and the relying party for _hot_ signers:

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Signer
    participant T as Target Canister
    participant U as User

    Note over RP, S: Interactions follow ICRC-25 standard
    RP ->> S: Request canister call
    S ->> T: Consent message request
    T ->> S: Consent message response
    S ->> S: Validate consent message
    alt Received consent message
        S ->> U: Display consent message
    else No consent message
        S ->> U: Display warning
    end
    U ->> S: Approve / reject canister call
    alt Approved
    S ->> S: Sign canister call
    S ->> T: Submit canister call
    T ->> S: Canister call response
    S ->> U: Display success / failure message
    S ->> RP: Canister call response
    else Rejected
    S ->> RP: Rejection response
    end
```

1. The relying party connects to the signer and requests a signature on a canister call.
2. The signer fetches the consent message from the target canister and validates the response:
   * `icrc21_consent_message_request.method` must match the canister call method.
   * `icrc21_consent_message_request.arg` must match the canister call argument.
   * The signer must use the same identity for the `icrc21_canister_call_consent_message` request as is used for signing the canister call (in step 6).
   * The `icrc21_canister_call_consent_message` canister call must be made to the target canister.
   * The response to the `icrc21_canister_call_consent_message` canister call (fetched using `read_state`) must be delivered in a valid certificate (see [Certification](https://internetcomputer.org/docs/current/references/ic-interface-spec#certification)).
   * The decoded response must not be `null` and match the `icrc21_consent_message_response::OK` variant.
3. The consent message is presented to the user.
4. User approval:
   * If the user approves the canister call, continue with step 5.
   * If the user rejects the canister call (or does not respond within a certain time frame), the signer returns an error to the relying party. No further steps are executed.
5. The request is signed, submitted to the IC.
6. The certified response is retrieved using read state requests
7. A message should be displayed to the user that indicates whether the canister call was successful or not.
8. The response returned to the relying party.

### Cold Signer Use-Case

This section describes the interactions between the signer and the relying party for signers that have a _cold_ component:
* the cold signer component is not able to interact with canisters
* the cold signer component has no knowledge of time

```mermaid
sequenceDiagram
    participant RP as Relying Party
    participant S as Chain Connected Signer Component
    participant CS as Cold Signer Component
    participant T as Target Canister
    participant U as User

    Note over RP, S: Interactions follow ICRC-25 standard
    RP ->> S: Request canister call
    S ->> T: Consent message request
    T ->> S: Consent message response
    S ->> CS: - Canister call request<br>- Consent message request and response
    CS ->> CS: Validate consent message
    alt Received consent message
        CS ->> U: Display consent message
    else No consent message
        CS ->> U: Display warning
    end
    U ->> CS: Approve / reject canister call
    alt Approved
    CS ->> CS: Sign canister call
    CS ->> S: Transfer signed canister call
    S ->> T: Submit canister call
    T ->> S: Canister call response
    S ->> U: Display success / failure message
    S ->> RP: Canister call response
    else Rejected
    S ->> RP: Rejection response
    end
```

1. The relying party connects to the signer and requests a signature on a canister call.
2. The chain-connected signer component fetches the consent message from the target canister:
   * `icrc21_consent_message_request.method` must match the canister call method.
   * `icrc21_consent_message_request.arg` must match the canister call argument.
   * The chain-connected signer component must use the anonymous identity for the `icrc21_canister_call_consent_message` request.
   * The `icrc21_canister_call_consent_message` canister call must be made to the target canister.
   * The response to the `icrc21_canister_call_consent_message` canister call (fetched using `read_state`) must be delivered in a valid certificate (see [Certification](https://internetcomputer.org/docs/current/references/ic-interface-spec#certification)).
   * The decoded response must not be `null` and match the `icrc21_consent_message_response::OK` variant.
3. The canister call and the consent message request as well as the certified response are transferred to the cold signer component.
4. The cold signer component validates the consent message:
   1. The consent message request must match the canister call:
      * `icrc21_consent_message_request.method` must match the canister call method.
      * `icrc21_consent_message_request.arg` must match the canister call argument.
      * The `icrc21_canister_call_consent_message` request `sender` must be anonymous or match the identity used to sign the canister call request (in step 7).
      * The `icrc21_canister_call_consent_message` request `canister_id` must match the target canister id.
   2. The consent message response must be certified and valid:
      * The response to the `icrc21_canister_call_consent_message` canister call must be provided in a valid certificate (see [Certification](https://internetcomputer.org/docs/current/references/ic-interface-spec#certification)).
      * The decoded response must not be `null` and match the `icrc21_consent_message_response::Ok` variant.
   3. The consent message response certificate `time` must be recent with respect to the `ingress_expiry` of the canister call.
   4. The consent message user preferences must match the user preferences of the signer. In particular, the consent message must be in a language understood by the user.
5. If validation is successful, the consent message is presented to the user.
   * Otherwise, the signer must abort the signing process and display an error message to the user. No further steps are executed.
6. User approval:
   * If the user approves the canister call, continue with step 7.
   * If the user rejects the canister call (or does not respond within a certain time frame), the signer returns an error to the relying party (via the chain connected component). No further steps are executed.
7. The request is signed and transferred to the chain connected component.
8. The request is submitted to the IC.
9. The certified response is retrieved using read state requests
10. A message should be displayed to the user that indicates whether the canister call was successful or not.
11. The response returned to the relying party.

## Example

The following is a non-normative example of how the canister call consent message interface could be used for the ledger transfer method.

### Consent Message Request

Argument for the ledger canister call to `transfer`:

```
(
  record {
    to = blob "ed2182...";
    fee = record { e8s = 10_000 : nat64 };
    memo = 123 : nat64;
    from_subaccount = null;
    created_at_time = null;
    amount = record { e8s = 789_123_000 : nat64 };
  },
)
```

Argument for the ledger canister call to `icrc21_canister_call_consent_message`:

```
(
   record {
      method = "transfer";
      arg = blob "4449..."; // candid encoded argument
      consent_preferences = record {
        language = "en-US"
      }
   }
)
```

### Consent Message Response

```
(
   variant {
      Ok = record {
         consent_message = "Transfer 7.89 ICP to account ed2182..., include memo: 123. Fee: 0.0001 ICP.";
         language = "en-US"
      }
   }
)
```
### Signer UI Approval Screen

The message will then be shown to the user in the following context:

```
┌─────────────────────────────────┐
│  Approve the following action?  │
│  ┌───────────────────────────┐  │
│  │ Transfer 7.89 ICP to      │  │
│  │ account ed2182...,        │  │
│  │ include memo: 123.        │  │
│  │ Fee: 0.0001 ICP.          │  │
│  └───────────────────────────┘  │
│  ┌───────────┐   ┌───────────┐  │
│  │  Reject   │   │  Approve  │  │
│  └───────────┘   └───────────┘  │
└─────────────────────────────────┘
```

[APPROVED]: https://img.shields.io/badge/STATUS-APPROVED-ed1e7a.svg