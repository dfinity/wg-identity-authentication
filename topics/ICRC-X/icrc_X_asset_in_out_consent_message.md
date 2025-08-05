# ICRC-X: Content type for consent message

[Draft]

## Summary

This specification describes a protocol for content return by request consent message
This specification inherited functionalities from ICRC_21 standard

## Terminology

- signer: a service that manages the keys of a user and can sign canister calls on their behalf. This component displays the consent message to the user. The signer may be split in a hot (with connection to the IC) and cold (offline) component.
- relying party: the service that requests a signature on a specific canister call.
- target canister: the canister that is the target of the canister call.

## Motivation

ICRC-21 is great but it only support plain text or markdown text. But in blockchain there is some consent message need complicated schema than just a text

## Assumptions

- The signer is trusted by the user.
- The relying party is _not_ trusted and might be malicious.
- The target canister is trusted by the user. Interactions with malicious canisters are not covered by this specification. In particular, interacting with a malicious canister can produce arbitrary outcomes regardless of how user consent was collected.

## Canister Call Consent Message Interface

The interface specified in [ICRC-X.did](./ICRC-X.did) must be implemented to support canister call consent messages.
In addition to implementing this interface, it is recommended that the canister also provides its full candid interface in the public `candid:service` metadata section, as discussed [here](https://forum.dfinity.org/t/rfc-canister-metadata-standard). This is required to properly decode the arguments if the signer also wants to display technical information about the canister call.

### Authentication

The signer may send the `icrc21_consent_message` call using the same identity as it would for the actual canister call for which the consent message was issued.

Any canister implementing the `icrc21_consent_message` interface must not require authentication for this call. Anonymous consent messages are required in the [cold signer use-case](#cold-signer-use-case) which would otherwise require two interactions with the cold signer component, making the flow very cumbersome for users.

Canisters may add additional or different information if a non-anonymous `sender` is used.
For example, a canister might include private information in the consent message, if the call is made by the owner of that information.

> **_WARNING:_** Canister developers must take care to not rely on the current state of the canister / identity attached data when issuing the consent message. There might be a significant time delay (depending on the signer used) between retrieving the consent message and submitting the canister call. The consent message must accurately describe all possible outcomes of the canister call, accounting for that time delay.

> **_NOTE:_** The `icrc21_consent_message` method is currently declared as an `update` call, due to the necessity
> of supporting dynamic data in a secure way. As soon as secure (replicated) query calls are available, this will be changed to such a replicated query call.

## Use-Cases

The canister called need return a other content type rather than a normal text

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
      user_preferences = record {
        language = "en-US"
      };
      content_type: "application/json";
   }
)
```

### Consent Message Response

```
(
   variant {
      Ok = record {
         consent_message = "{"message":"This call will transfer 100 tokens from your account to the recipient account.","assetIn":[{"address":"0x1234","amount":100}],"assetOut":[{"address":"0x1234","amount":100}],"to":"0x1234","from":"0x1234","fee":100}";
         metadata: record {
            language = "en-US";
         }
      }
   }
)
```

### Signer UI Approval Screen

The message will then be returned to the client in the following context:

```
{
  "message": "This call will transfer 100 tokens from your account to the recipient account.",
  "assetIn": [
    {
      "address": "0x1234",
      "amount": 100
    }
  ],
  "assetOut": [
    {
      "address": "0x1234",
      "amount": 100
    }
  ],
  "to": "0x1234",
  "from": "0x1234",
  "fee": 100
}
```
