# Identity and Wallet Standards

## Mission Statement

This group works towards the development and adoption of ICRC standards related to identity and wallets on the Internet
Computer. This repository is used to collaborate, document decisions, discuss changes, raise issues and provide
feedback.

## Topics

| Standard                                                                                                          | Topic                                                                                                                                                             | Lead                                                             | Status                                                                                                               | Links                                                                                                                                      |
|-------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| ICRC-#                                                                                                            | Verifiable Credentials and Presentations                                                                                                                          | [Bartosz Przydatek](https://github.com/przydatek)                | Reference Implementation<br>(MVP impelementation in II, spec will be finalized after)                                | [w3c Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)                                                                         |
| [ICRC-21](./topics/icrc_21_consent_msg.md)                                                                        | Canister Call Consent Messages                                                                                                                                    | [Frederik Rothenberger](https://github.com/frederikrothenberger) | [![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31) | [Signer Standards Overview](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/signer_standards_overview.md)           |
| [ICRC-25](./topics/icrc_25_signer_interaction_standard.md)                                                        | Signer Interaction Standard                                                                                                                                       | [Philipp Litzenberger](https://github.com/plitzenberger)         | [![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31) | [Signer Standards Overview](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/signer_standards_overview.md)           |
| [ICRC-27](./topics/icrc_27_get_icrc_1_accounts.md)                                                                | ICRC-1 ledger accounts<br>[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./topics/icrc_25_signer_interaction_standard.md)        | [sea-snake](https://github.com/sea-snake)                        | [![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31) | [Signer Standards Overview](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/signer_standards_overview.md)           |
| [ICRC-28](https://github.com/dfinity/ICRC/issues/32)                                                              | Global Delegation Request Standard                                                                                                                                | [Dan Ostrovsky](https://github.com/dostro)                       | [![Status Badge](https://img.shields.io/badge/STATUS-ISSUE-blue.svg)](https://github.com/orgs/dfinity/projects/31)   |                                                                                                                                            |
| [ICRC-29](./topics/icrc_29_window_post_message_transport.md)                                                      | Window Post Message Transport<br>[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./topics/icrc_25_signer_interaction_standard.md) | [Frederik Rothenberger](https://github.com/frederikrothenberger) | [![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31) | [Signer Standards Overview](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/signer_standards_overview.md)           |
| [ICRC-31](./topics/icrc_31_get_principals.md)                                                                     | Get Principals<br>[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./topics/icrc_25_signer_interaction_standard.md)                | [Philipp Litzenberger](https://github.com/plitzenberger)         | [![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31) | [Signer Standards Overview](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/signer_standards_overview.md)           |
| [ICRC-32](./topics/icrc_32_sign_challenge.md)                                                                     | Sign Challenge<br>[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./topics/icrc_25_signer_interaction_standard.md)                | [Philipp Litzenberger](https://github.com/plitzenberger)         | [![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31) | [Signer Standards Overview](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/signer_standards_overview.md)           |
| [ICRC-34](./topics/icrc_34_get_delegation.md)                                                                     | Get Delegation<br>[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./topics/icrc_25_signer_interaction_standard.md)                | [Philipp Litzenberger](https://github.com/plitzenberger)         | [![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31) | [Signer Standards Overview](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/signer_standards_overview.md)           |
| [ICRC-35](./topics/icrc_35_webpage_apis.md)                                                                       | Browser-Based Interoperability Framework                                                                                                                          | [Sasha Vtyurin](https://github.com/seniorjoinu)                  | [![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31) |                                                                                                                                            |
| [ICRC-39](./topics/icrc_39_batch_calling.md)                                                                      | Batch Calling<br>[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./topics/icrc_25_signer_interaction_standard.md)                 | [Frederik Rothenberger](https://github.com/frederikrothenberger) | [![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31) | [Signer Standards Overview](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/signer_standards_overview.md)           |
| [ICRC-49](./topics/icrc_49_call_canister.md)                                                                      | Call Canister<br>[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./topics/icrc_25_signer_interaction_standard.md)                 | [Philipp Litzenberger](https://github.com/plitzenberger)         | [![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31) | [Signer Standards Overview](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/signer_standards_overview.md)           |
| [ICRC-#]((https://github.com/dfinity/wg-identity-authentication/issues/26) )                                      | DID registry                                                                                                                                                      | [Quint Daenen](https://github.com/q-uint)                        | [![Status Badge](https://img.shields.io/badge/STATUS-ISSUE-blue.svg)](https://github.com/orgs/dfinity/projects/31)   | [w3c DID registries](https://www.w3.org/TR/did-spec-registries/)                                                                           |
| [CAIP-2](https://github.com/icvc/icp-namespace/pull/1)<br>[CAIP-10](https://github.com/icvc/icp-namespace/pull/2) | CAIP Specifications                                                                                                                                               | [Quint Daenen](https://github.com/q-uint)                        | [![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31) | [Issue 25](https://github.com/dfinity/wg-identity-authentication/issues/25), [CAIP Specifications](https://github.com/ChainAgnostic/CAIPs) |

A status overview of the standards owned by this working group can be
found [here](https://github.com/orgs/dfinity/projects/31/views/1).

## Process

| Status                   | Description                                                                                                              |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------|
| Issue                    | Propose a topic as an issue                                                                                              |
| Draft Standard           | Write a draft of the final standard                                                                                      |
| Reference Implementation | Build a reference implementation applying the standard in a practical scenario                                           |
| Approved Spec            | Agree on solution design in the working group, which should represent the industry (sign off from X people in the group) |
| Community Approval       | Socialize spec (sign off from Y people in the community, including)                                                      |
| Standard                 | ICRC Standard                                                                                                            |

## Meetings

Meetings happen every two weeks. All meeting recordings can be
found [this google folder](https://drive.google.com/drive/folders/14unuYLiYtUeOw47eRwYnB4FCa9YPr6zv).

Please consult
the [working group calendar](https://calendar.google.com/calendar/u/0?cid=Y19jZ29lcTkxN3JwZWFwN3ZzZTNpczFobDMxMEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t) ([browser view](https://calendar.google.com/calendar/embed?src=c_cgoeq917rpeap7vse3is1hl310%40group.calendar.google.com&ctz=Europe%2FZurich))
for the next meeting date.

We also have a discord channel for the working group. Please join
the [Identity and Wallet Standards](https://discord.gg/pgsR7ksV) channel.

## Contributing

Everyone is welcome to join the public meetings of the working group.

* If you want to discuss a specific topic, please create and issue or pull-request. We will go over all the newly
  created issues and PRs in the next meeting.
* If you own a cool project related to Identity and built on the IC you are welcome to do a presentation in one of the
  meetings. If you wish to do so, please open an issue and include information about your presentation (title, short
  summary and estimated time required).

## Working Group Members

The working group sessions are public and everybody is welcome. If you are interested in discussions about identity and
authentication on the IC, please join us.

### Permanent Members

* DFINITY lead: [Frederik Rothenberger](https://github.com/frederikrothenberger)
* Community Leads:
    * [Dan Ostrovsky](https://github.com/dostro) (Identity Labs)
    * [Bruce Huang](https://github.com/brutoshi) (AstroX)
* Coordinator: [Mary Dwyer](https://github.com/marydwyer)











                                                                                                                                                                                                                                                                                                    
