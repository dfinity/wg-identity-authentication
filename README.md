# Identity and Wallet Standards

## Mission Statement

This group works towards the development and adoption of ICRC standards related to identity and wallets on the Internet
Computer. This repository is used to collaborate, document decisions, discuss changes, raise issues and provide
feedback.

## Process

The following process is followed for standards within this working group.

If you have a good idea or a need for a standard, feel free join a meeting or bring it up on the [forum][FORUM]
or [Discord][DISCORD].

Keep in mind it should be related to Identity and/or Wallets built on the IC to be picked up. In case you have other
ideas, still feel free to reach out, we'll try to help you find the right working group.

These ideas are then translated into the draft standards by their original contributor and/or with help of members
within this working group. Draft standards enable developers to create early reference implementations.

Approved standards are actively being implemented by developers and are candidates for an official ICRC standard once
adoption has reached an adequate level.

| Status        | Description                                       |
|---------------|---------------------------------------------------|
| ![IDEA]       | Ongoing idea in meetings, on the forum or Discord |
| ![ISSUE]      | Topic is under discussion in either issue or PR   |
| ![DRAFT]      | Draft of the final standard, subject to change    |
| ![APPROVED]   | Approved standard within the working group        |
| ![STANDARD]   | Official NNS approved ICRC Standard               |
| ![ON HOLD]    | Waiting to be picked up again once prioritized    |
| ![UNKNOWN]    | Hasn't progressed and/or had updates for a while  |
| ![ABANDONED]  | Abandoned and is no longer actively pursued       |
| ![SUPERSEDED] | Another standard has replaced this standard       |

## Standards

Before jumping into the standards, it's recommended to read the overview [here](./topics/signer_standards_overview.md).

### JSON-RPC Messages

Standards that describe interactions between relying parties and signers through JSON-RPC messages.

| Standard                                                                                      | Status      |
|-----------------------------------------------------------------------------------------------|-------------|
| [ICRC-25: Signer Interaction](./topics/icrc_25_signer_interaction_standard.md)                | ![APPROVED] |
| [ICRC-27: Accounts](./topics/icrc_27_accounts.md)                                             | ![APPROVED] |
| [ICRC-34: Delegation](./topics/icrc_34_delegation.md)                                         | ![APPROVED] |
| [ICRC-49: Call Canister](./topics/icrc_49_call_canister.md)                                   | ![APPROVED] |
| [ICRC-95: Derivation Origin](./topics/icrc_95_derivationorigin.md)                            | ![APPROVED] |
| [ICRC-#: Batch Call Canister](https://github.com/dfinity/wg-identity-authentication/pull/220) | ![ISSUE]    |

### Transport Channel

Standards that describe how the communication channel between a relying party and signer is established.

| Standard                                                                                                    | Status      |
|-------------------------------------------------------------------------------------------------------------|-------------|
| [ICRC-29: Browser Post Message Transport](./topics/icrc_29_window_post_message_transport.md)                | ![APPROVED] |
| [ICRC-94: Browser Extension Discovery and Transport](./topics/icrc_94_multi_injected_provider_discovery.md) | ![DRAFT]    |
| ICRC-#: Browser URL Transport                                                                               | ![IDEA]     |
| ICRC-#: Wallet Connect Transport                                                                            | ![IDEA]     |
| ICRC-#: Browser Web Signer Discovery                                                                        | ![IDEA]     |

### Canister Calls

Standards that describe canister call interfaces used by signers.

| Standard                                                                                           | Status      |
|----------------------------------------------------------------------------------------------------|-------------|
| [ICRC-21: Canister Call Consent Messages](./topics/ICRC-21/icrc_21_consent_msg.md)                 | ![APPROVED] |
| [ICRC-28: Trusted Origins](./topics/icrc_28_trusted_origins.md)                                    | ![APPROVED] |
| [ICRC-#: Dapp Metadata Registry](https://github.com/dfinity/wg-identity-authentication/issues/156) | ![ISSUE]    |

### Other

Standards that are currently not actively being pursued, abandoned or superseded.

| Standard                                                                                | Status        | Note                                                                                                                                                                          |
|-----------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ICRC-32: Sign Challenge](./topics/icrc_32_sign_challenge.md)                           | ![ON HOLD]    | De-prioritized to focus on IC use cases first                                                                                                                                 |
| [ICRC-#: DID Registry](https://github.com/dfinity/wg-identity-authentication/issues/26) | ![ON HOLD]    | Feel like picking this up? Contact the working group                                                                                                                          |
| [ICRC-#: CAIP-2 Blockhain ID](https://github.com/icvc/icp-namespace/pull/1)             | ![ON HOLD]    | Overlaps with work in NFT, Ledger & Tokenization working groups on [ICRC-91](https://github.com/dfinity/ICRC/pull/96) and [ICRC-22](https://github.com/dfinity/ICRC/pull/101) |
| [ICRC-#: CAIP-10 Account Address](https://github.com/icvc/icp-namespace/pull/2)         | ![ON HOLD]    | Overlaps with work in NFT, Ledger & Tokenization working groups on [ICRC-91](https://github.com/dfinity/ICRC/pull/96) and [ICRC-22](https://github.com/dfinity/ICRC/pull/101) |
| [ICRC-35: Browser-Based Interoperability Framework](./topics/icrc_35_webpage_apis.md)   | ![UNKNOWN]    | Hasn't received updates for a while                                                                                                                                           |
| ICRC-31: Get Principals                                                                 | ![SUPERSEDED] | See [ICRC-27: Accounts](./topics/icrc_27_accounts.md)                                                                                                                         |
| ICRC-57: Get Session Delegation                                                         | ![SUPERSEDED] | See [ICRC-34: Delegation](./topics/icrc_34_delegation.md)                                                                                                                     |

## Meetings

Meetings happen every two weeks. All meeting schedule announcements and summaries with links to recordings can be found
in [this forum thread][FORUM].

All meeting recordings can be found in [this Google Drive folder][RECORDINGS]. See
the [working group calendar][CALENDAR] for the next meeting date and the dates of other working groups.

Besides above forum thread, we also have a [discord channel][DISCORD] for the working group.

## Contributing

Everyone is welcome to join the public meetings of the working group.

Additionally, you can also join the discussion on the [forum][FORUM] or [Discord][DISCORD].

* If you want to discuss a specific topic for the next meeting, bring up the topic on the [forum][FORUM]
  or [Discord][DISCORD]. Additionally consider already creating an issue or pull-request.
* If you own a cool project related to Identity and/or Wallets built on the IC you are welcome to do a presentation in
  one of the meetings, please bring it up on the [forum][FORUM] or [Discord][DISCORD].

## Working Group Members

The working group sessions are public and everybody is welcome. If you are interested in discussions about identity and
authentication on the IC, please join us.

### Permanent Members

* DFINITY lead: [Thomas Gladdines](https://github.com/sea-snake)
* Community Lead: [Dan Ostrovsky](https://github.com/dostro) (Identity Labs)
* Coordinator: [Mary Dwyer](https://github.com/marydwyer)

## Supported Signers

The following list of signers have implemented or are implementing the standards in this working group:

- [NFID](https://nfid.one)
- [OISY](https://oisy.com)
- [Plug](https://www.plugwallet.ooo)
- [PrimeVault](https://www.primevault.com)

Wallets and identity providers not listed here, might still be supported through adapters available in libraries and
frameworks that implement the standards.

Have you implemented the standards and your wallet isn't listed here? Contact us on the [forum][FORUM]
or [Discord][DISCORD].

## Libraries and Frameworks

For a library that implements the above signer standards
see [signer-js](https://www.npmjs.com/package/@slide-computer/signer).

If you are looking to get started quickly, consider a framework like [IdentityKit](https://www.identitykit.xyz) that
already implements the user interface, error handling, sessions and other details around wallets interaction.

[//]: # (Status badges)

[IDEA]: https://img.shields.io/badge/STATUS-IDEA-29abe2.svg

[ISSUE]: https://img.shields.io/badge/STATUS-ISSUE-e7a237.svg

[DRAFT]: https://img.shields.io/badge/STATUS-DRAFT-f25a24.svg

[APPROVED]: https://img.shields.io/badge/STATUS-APPROVED-ed1e7a.svg

[STANDARD]: https://img.shields.io/badge/STATUS-STANDARD-572785.svg

[ON HOLD]: https://img.shields.io/badge/STATUS-ON_HOLD-222222.svg

[UNKNOWN]: https://img.shields.io/badge/STATUS-UNKNOWN-222222.svg

[ABANDONED]: https://img.shields.io/badge/STATUS-ABANDONED-222222.svg

[SUPERSEDED]: https://img.shields.io/badge/STATUS-SUPERSEDED-222222.svg

[//]: # (Common links)

[FORUM]: https://forum.dfinity.org/t/11902

[DISCORD]: https://discord.internetcomputer.org

[CALENDAR]: https://calendar.google.com/calendar/u/0/embed?src=c_cgoeq917rpeap7vse3is1hl310@group.calendar.google.com

[RECORDINGS]: https://drive.google.com/drive/folders/14unuYLiYtUeOw47eRwYnB4FCa9YPr6zv










                                                                                                                                                                                                                                                                                                    
