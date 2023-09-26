# ICRC-21: Canister Call Consent Messages


| Status |
|:------:|
| Draft  |


## Summary
This specification describes a protocol for obtaining human-readable consent messages for canister calls. These messages are intended to be shown to users to help them make informed decisions about whether to approve a canister call / sign a transaction.

The protocol is designed in such a way that it can be used interactively (e.g. in a browser-based wallet) or non-interactively (e.g. in a cold wallet).

## Terminology

* wallet: a service that manages the keys of a user and can sign canister calls on their behalf. This component displays the consent message to the user. The wallet may be split in a hot (with connection to the IC) and cold (offline) component.
* relying party: the service that requests a signature on a specific canister call.
* target canister: the canister that is the target of the canister call.

## Motivation

Interactions with canisters can have significant consequences. For example, a canister might transfer funds or provide access to sensitive information. At the same time interactions with canisters are often technical and require a deep understanding of the canister's implementation to accurately assess the consequences of a specific canister call. This makes it very difficult for users to make informed decisions about whether to sign a canister call.

The mechanisms described in this specification ease the technical burden and empower users to make informed decisions before signing canister calls.

## Assumptions
* The wallet is trusted by the user.
* The relying party is _not_ trusted and might be malicious.
* The target canister is trusted by the user. Interactions with malicious canisters are not covered by this specification. In particular, interacting with a malicious canister can produce arbitrary outcomes regardless of how user consent was collected.

## Canister Call Consent Message Interface

The following interface must be implemented to support canister call consent messages:

```
type icrc21_consent_preferences = record {
    // Same semantics as HTTP Accept-Language header
    language: text;

};

type icrc21_consent_message_request = record {
    // Method name of the canister call.
    method: text;
    // Argument of the canister call.
    arg: blob;
    // User preferences with regards to the consent message presented to the end-user.
    consent_preferences: icrc21_consent_preferences;
};

type icrc21_consent_info = record {
    // Consent message describing in a human-readable format what the call will do.
    // Markdown formatting can be used. No external resources (e.g. images) are allowed.
    //
    // The message should be in the language specified in the consent_preferences.
    // If the message is not available in the specified language, a fall back
    // language may be used. The language of the message must be indicated using
    // the language field.
    //
    // The message should be short and concise.
    // It should only contain information that is:
    // * relevant to the user
    // * relevant given the canister call argument
    consent_message: text;
    // Same semantics as HTTP lang attribute
    language: text;
};

type icrc21_error_info = record {
    // Machine parsable error. Can be chosen by the target canister but should indicate the error category.
    error_code: nat;
    // Human readable technical description of the error intended for developers, not the end-user.
    description: text;
};

type icrc21_error = variant {
    // The call is not allowed (i.e. because calls to this method are not supposed to be signed by end-users, the arguments exceed certain bounds, etc.)
    Forbidden: icrc21_error_info;
    // The call is malformed and would cause an error (i.e. the method does not exist, the arguments cannot be decoded, etc.).
    MalformedCall: icrc21_error_info;
    // The call does not have a consent message (yet). This error should be used by canister developers that want to gradually
    // roll out support for the consent message interface. I.e. as a placeholder result for canister calls that will provide
    // a consent message or a definitive error result (see above) in the future.
    NotSupported: icrc21_error_info;
    // Any error not covered by the above variants.
    GenericError: icrc21_error_info;
};

type icrc21_consent_message_response = variant {
    // The call is ok, consent message is provided.
    Ok: icrc21_consent_info;
    // The call is not ok, error is provided.
    Err: icrc21_error;
};

service : {
    // Returns a human-readable consent message for the given canister call.
    // The return type is `opt` to allow future extension of the consent_message_response variant.
    // (see recommendation here: https://internetcomputer.org/docs/current/references/candid-ref#type-variant--n--t--)
    // This call requires authentication (i.e. must not be made with the anonymous sender).
    icrc21_consent_message: (icrc21_consent_message_request) -> (opt icrc21_consent_message_response);

    // Returns a list of supported standards related to consent messages that this canister implements.
    // The result should always have at least one entry: record { name = "ICRC-21"; url = "https://github.com/dfinity/wg-identity-authentication" }
    // This query call must not require authentication.
    icrc21_supported_standards : () -> (vec record { name : text; url : text }) query;
}
```

In addition to implementing the above interface, it is recommended that the canister also provides its full candid interface in the public `candid:service` metadata section, as discussed [here](https://forum.dfinity.org/t/rfc-canister-metadata-standard). This is required to properly decode the arguments if the wallet also wants to display technical information about the canister call.

### Authentication

The wallet should send the `icrc21_consent_message` call using the same identity as it would for the actual canister call for which the consent message was issued.

Any canister implementing the `icrc21_consent_message` interface must require authentication for this call. In addition, the canister must ensure that if the actual call is made with a different identity that either:
* the call fails with an error and without side effects
* the call succeeds and the previously issued consent message (for a different identity) still accurately describes the outcome of the call

Requiring authentication on the `icrc21_consent_message` call ensures that canisters can protect themselves against clients maliciously generating consent messages to drain cycles.

> **_WARNING:_**  Canister developers must take care to not rely on the current state of the canister / identity attached data when issuing the consent message. There might be a significant time delay (depending on the wallet used) between retrieving the consent message and submitting the canister call. The consent message must accurately describe all possible outcomes of the canister call, accounting for that time delay.  

## Use-Cases

The canister call is designed to be used with both cold and hot wallets. In addition to the wallet use-cases it can also be used to enhance the documentation on generic canister interfaces.

### Hot Wallet Use-Case

This section describes the interactions between the wallet and the relying party for _hot_ wallets:

![](../diagrams/hot_wallet_consent_message_use_case.svg "Hot Wallet Use-Case Sequence Diagram")

1. The relying party connects to the wallet and requests a signature on a canister call.
2. The wallet fetches the consent message from the target canister and validates the response:
   * `icrc21_consent_message_request.method` must match the canister call method.
   * `icrc21_consent_message_request.arg` must match the canister call argument.
   * The `icrc21_consent_message` canister call must be made to the target canister.
   * The response to the `icrc21_consent_message` canister call (fetched using `read_state`) must be delivered in a valid certificate (see [Certification](https://internetcomputer.org/docs/current/references/ic-interface-spec#certification)).
   * The decoded response must not be `null` and match the `icrc21_consent_message_response.valid` variant.
3. The consent message is presented to the user.
4. User approval:
   * If the user approves the canister call, continue with step 5.
   * If the user rejects the canister call (or does not respond within a certain time frame), the wallet returns an error to the relying party. No further steps are executed.
5. The request is signed, submitted to the IC.
6. The certified response is retrieved using read state requests
7. A message should be displayed to the user that indicates whether the canister call was successful or not.
8. The response returned to the relying party.

### Cold Wallet Use-Case

This section describes the interactions between the wallet and the relying party for wallets that have a _cold_ component:
* the cold wallet component is not able to interact with canisters
* the cold wallet component has no knowledge of time

![](../diagrams/cold_wallet_consent_message_use_case.svg "Cold Wallet Use-Case Sequence Diagram")

1. The relying party connects to the wallet and requests a signature on a canister call.
2. The wallet fetches the consent message from the target canister:
3. The canister call and the consent message request as well as the certified response are transferred to the cold wallet component.
4. The cold wallet component validates the consent message:
   1. The consent message request must match the canister call:
      * `icrc21_consent_message_request.method` must match the canister call method.
      * `icrc21_consent_message_request.arg` must match the canister call argument.
      * The `icrc21_consent_message` request `canister_id` must match the target canister id.
   2. The consent message response must be certified and valid:
      * The response to the `icrc21_consent_message` canister call must be provided in a valid certificate (see [Certification](https://internetcomputer.org/docs/current/references/ic-interface-spec#certification)).
      * The decoded response must not be `null` and match the `icrc21_consent_message_response.valid` variant.
   3. The consent message response certificate `time` must be recent with respect to the `ingress_expiry` of the canister call.
   4. The consent message user preferences must match the user preferences of the wallet. In particular, the consent message must be in a language understood by the user.
5. If validation is successful, the consent message is presented to the user.
   * Otherwise, the wallet must abort the signing process and display an error message to the user. No further steps are executed.
6. User approval:
   * If the user approves the canister call, continue with step 7.
   * If the user rejects the canister call (or does not respond within a certain time frame), the wallet returns an error to the relying party (via the chain connected component). No further steps are executed.
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

Argument for the ledger canister call to `icrc21_consent_message`:

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
