# Canister Call Consent Messages

## Summary
This specification describes a protocol for obtaining human-readable consent messages for canister calls. These messages are intended to be shown to users to help them make informed decisions about whether to approve a canister call / sign a transaction.

The protocol is designed in such a way that it can be used interactively (e.g. in a browser-based wallet) or non-interactively (e.g. in a cold wallet).

## Terminology

* wallet: a service that manages the keys of a user and can sign canister calls on their behalf. This component displays the consent message to the user.
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
type consent_preferences = record {
    // Same semantics as HTTP Accept-Language header
    language: text;

};

type consent_message_request = record {
    // Method name of the canister call.
    method: text;
    // Argument of the canister call.
    arg: blob;
    // User preferences with regards to the consent message presented to the end-user.
    consent_preferences: consent_preferences;
};

type consent_info = record {
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

type error_info = record {
    // Machine parsable error. Can be chosen by the target canister but should indicate the error category.
    error_code: nat;
    // Human readable technical description of the error intended for developers, not the end-user.
    description: text;
};

type consent_message_response = variant {
    // The call is valid,
    valid: consent_info;
    // The call is not allowed (i.e. because calls to this method are not supposed to be signed by end-users, the arguments exceed certain bounds, etc.)
    forbidden: error_info;
    // The call is malformed and would cause an error (i.e. the method does not exist, the arguments cannot be decoded, etc.).
    malformed_call: error_info;
};

service : {
    consent_message: (consent_message_request) -> (consent_message_response);
}
```

In addition to implementing the above interface, it is recommended that the canister also provides its full candid interface in the public `candid:service` metadata section, as discussed [here](https://forum.dfinity.org/t/rfc-canister-metadata-standard). This is required to properly decode the arguments if the wallet also wants to display technical information about the canister call.

## Use-Cases

The canister call is designed to be used with both cold and hot wallets. In addition to the wallet use-cases it can also be used to enhance the documentation on generic canister interfaces.

### Hot Wallet Use-Case

This section describes the interactions between the wallet and the relying party for _hot_ wallets:

1. The relying party connects to the wallet and requests a signature on a canister call.
2. The wallet fetches the consent message from the target canister and validates the response.
3. The consent message is presented to the user.
4. The user approves the canister call.
5. The request is signed, alongside with the read state request for the matching request id and sent back to the relying party.

### Cold Wallet Use-Case

This section describes the interactions between the wallet and the relying party for _cold_ wallets:
* the wallet is not able to interact with canisters
* no knowledge of time is assumed

1. The relying party fetches the consent message from the target canister matching the canister call.
2. The canister call and the consent message request as well as the certified response are transferred to the wallet.
3. The wallet validates the consent message:
   1. The consent message request must match the canister call.
   2. The consent message response must be certified and valid.
   3. The consent message response certificate `time` must be recent with respect to the `ingress_expiry` of the canister call.
   4. The consent message user preferences must match the user preferences of the wallet. In particular, the consent message must be in a language understood by the user.
4. If validation is successful, the consent message is presented to the user.
   * Otherwise, the wallet must abort the signing process and display an error message to the user.
5. The user approves the canister call.
6. The request is signed, alongside with the read state request for the matching request id and sent back to the relying party.

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

Argument for the ledger canister call to `consent_message`:

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
      valid = record {
         consent_text = "Transfer 7.89 ICP to account ed2182..., include memo: 123. Fee: 0.0001 ICP.";
         language = "en-US"
      }
   }
)
```
