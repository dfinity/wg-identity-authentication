# ICRC-25 Reference Implementation

This folder contains a reference implementation of the [ICRC-25 standard](../../topics/icrc_25_signer_interaction_standard.md).

## Structure

The reference implementation comprises three components:

- [Relying Party](./relying-party/) - a reference implementation of the relying party as described in the standard
- [Signer](./signer/) - a reference implementation of the signer as described in the standard
- [Canister](./canister/) - a simple target canister adhering to the [ICRC-21 standard](../../topics/icrc_21_consent_msg.md)

## Usage

### Getting Started

To begin using the reference implementation, follow these steps:

1. Navigate to each project component and build it according to its respective instructions. Ensure all components run correctly.
2. Open the **Signer** tab and import an account by pasting a BIP-39 mnemonic into the `Import Account` text area and click the `Import Account` button.
2. Click the `Mint` button to mint new tokens for the imported account.

### Test `permission` messages

To test the `permission` messages exchange:

1. Open the **Relying Party** tab and click the `Request Permission` button. Copy the sync QR code.
2. Return to the **Signer** tab and paste the sync code by clicking the `Paste Sync Code` button, and accept the permission request.

### Test `canister_call` messages

*Note: This step assumes that the Relying Party and Signer have already exchanged the permission messages.*

To test the `canister_call` messages:

1. Open the **Relying Party** and, in the `Trasfer` section, provide the recipient's principal and the amount to send. Then, click `Send`.
2. In the **Signer** tab, wait for the consent message to show and accept it.
3. Navigate back to the **Relying Party** tab and observe the response.