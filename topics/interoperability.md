# Interoperability of Services using User Identity

## Introduction
This is a call for feedback on the topic of bringing interoperability and composability together with the privacy-friendly design of Internet Identity and other identity providers. This is an initiative of the Identity and Authentication Working Group. Community members are encouraged to actively participate and take part in the monthly working group sessions.

This is a live document and will be expanded continuously as we go along the process outlined below.


## Goal
The goal is to **derive the requirements, a solution design and ultimately an MVP implementation** to address the most pressing needs of the community regarding interoperability & composability with respect to identity on the IC.


## Process
This feature will go through the following process:
1. Validate the problem statement (current step)
2. Gather requirements from the community
3. Form consent in the Identity and Authentication Working Group on a consolidated set of MVP requirements.
4. Start process to find possible solutions to address the MVP requirements.
5. Form consent in the Identity and Authentication Working Group on an implementation ready MVP specification.
6. Create an NNS proposal to vote on whether the MVP spec should be accepted as a standard.
7. If the NNS proposal is accepted: implement the specification in the IC (as required to unblock identity providers).

### Forming Consent
We use GitHub to organize our collaboration but also want to keep the process lightweight and easy to participate in. As such we can use issues to track and discuss concerns community members might have. The goal should be to reach consent by dealing with all issues raised in a manner acceptable to all participants.

If this is not possible in a reasonably efficient way the working group may need to revise this process.

## Problem description

The problem can be phrased slightly differently depending on the type of identity provider issuing the delegations:
* if application specific principals are used (and not using the delegation target): The goal of this project is to provide means for users to allow services limited access to other services using their application specific principal. ![diagram of interactions with applications specific principals](../diagrams/interop_app_specific_principal.png)
* if global principals are used (in conjunction with delegation targets): The goal of this project is to provide means for users to allow additional delegation targets with limited permissions. ![diagram of interactions with global principals](../diagrams/interop_global_principal.png)


## Permission Request Flow

The following is a flow loosely based on the OAuth 2.0 / OpenID Connect flows that are generally used by Web 2.0 applications. A flow like this will be familiar to most users.
Nonetheless, it should only be used as a starting point and can be shaped to the needs of the community.

![sequence diagram of user flow](../diagrams/interop_seq_diagram.svg)

## Consent Screen
This is a mock-up of what a consent-screen could look like. The goal should be to clearly communicate to the users what the implications of consenting to permission delegation are.

Identity providers are free to implement this screen as they wish. It is included here as a starting point for the discussion regarding user interaction.

![diagram of interactions with applications specific principals](../diagrams/interop_consent_screen_mockup.png)

## Problem Parameters
In order to solve this problem, there are a few parameters that need to be specified in the architecture:
* How to specify permissions
  * Format
  * Semantics
  * Human readable descriptions
    * How to deal with internationalization
* How to issue credentials
* Credential validity durations
  * For a single session
  * For a longer time period
* How to revoke permission delegations / credentials
* Which component verifies the credential matches the permission given on a specific canister call
  * The service provider dapp
  * The replica
* How to collect consent from the user
* How to handle revocation of credentials
* How to handle unlinkability between principals
  * It is likely that unlikability cannot be maintained in the general case: Consider a service provider that allows delegation of a permission that gives consumer access to a function that reveals the caller principal. However there might be a means to mitigate this issue.
* Retain extensibility of the protocol for further development
  * E.g. allow delegation of capabilities between canisters

### Further considerations
* What if the canister call (consumer → service provider) requires payment?
  * Out of scope, needs to be handled by the consumer
  * Provide means to allow users to pay for the access
* Do we need to maintain compatibility with Web 2.0 services
  * for consumers
  * for service providers
* Given an existing infrastructure dapp such as Internet Identity or the NNS dapp:
  * expected set of permissions

## Requirements
List of requirements gathered so far:


| #   | Requirement                                                                                                                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Source                                              |
|-----|---------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| R1  | Dapps can specify permission sets that can be requested by other (third party) services.                                        | The permission sets should consist of the following information:<ul><li>Metadata<ul><li>Human readable title and description.<ul><li>Developers should be able to provide this in multiple languages.</li><li>The description should be able to reference requested values (i.e. “Allow access to account **1234**?”).</li></ul></li><li>Identifier to refer to the given permissions.</li></ul></li><li>Restrictions<ul><li>Restrictions on canister calls<ul><li>Allowed functions</li><li>Allowed arguments<ul><li>(multiple) value ranges</li><li>Single values</li><li>Set of values</li><li>Patterns?</li></ul></li></ul></li><li>Max allowed validity period</li></ul></li></ul>                |                                                     |
| R2  | Permissioned delegations allow a service to access another using the application-specific principal of the other service.       | Given a user that has delegated some permissions from service B to service A.<p>Service A will be able to:<ul><li>access service B using the application-specific principal of service B for actions allowed within the limits set by the granted permissions.</li><li>access service B using the application-specific principal of service A with unrestricted permissions (current situation).</li></ul></p>                                                                                                                                                                                                                                                                                         |                                                     |
| R3  | Permissioned delegations should reveal as little information as possible about the attributes of the user.                      | A service should learn as little information as possible from the permissioned delegation about the user whose permission it received.<br>(However, this does not prevent services from revealing the user principals themselves.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                                     |
| R4  | Once granted, a dapp should not have to request the same permissions again within the validity period of the issued credential. | Example:<ol><li>Service A authenticates with IDP → delegation for principal A</li><li>Service A requests indefinite access to some permissions of Service B<ol><li>User grants consent to allow A to access B given the restrictions.</li><li>A does not learn the dapp specific principal of the User on Service B (see R2).</li></ol></li><li>User logs out of service A.</li><li>User logs into service A again.<ol><li>The IDP will issue a new delegation for principal A.</li><li>This new delegation can be used in conjunction with the (still valid) credential issued in step 2 to access Service B again.</li></ol></li></ol>                                                               |                                                     |
| R5  | Developers should have the ability to offer users the functionality to list and revoke granted permissions.                     | The platform should allow developer to build infrastructure for users which allows them to:<ul><li>list of all active permissions the user has granted.</li><li>revoke the granted permissions. Revocation must take effect within a reasonably short timeframe (e.g. 5 minutes).</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                            |                                                     |
| R6  | The replica must enforce the restrictions associated with the granted permissions.                                              | Similar to the existing delegations, the replica should validate and check that the current call is allowed given the permissions granted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                                     |
| R7  | The user consent-flow must be feasible for all combinations of supported platforms.                                             | The flow is feasible for the following participants:<ul><li>IDPs<ul><li>dapp accessed via browser</li><li>Browser extension (wallet)</li><li>native mobile app (wallet)</li></ul></li><li>Relying parties<ul><li>dapp accessed via browser</li><li>native mobile app</li></ul></li></ul>                                                                                                                                                                                                                                                                                                                                                                                                               |                                                     |
| R8  | Permissioned delegations must be robust against changes.                                                                        | If a developer makes changes to a permission set, previously issued consents must become invalid.<br>This is because users and developers have a different notion which changes to permissions are compatible:<ul><li>For users, everything that is less permissive is compatible. Permissions cannot be widened because the user has never given consent to the extension.</li><li>For developers, everything that is more permissive is compatible. Permissions cannot be removed, because applications might break (i.e. rely on the fact that certain actions are allowed given a specific set of permissions).</li></ul>The only way to satisfy both points is to make permission sets immutable. |                                                     |
| R9  | Permissioned delegations must be usable by application front-ends as well as canisters.                                         | The permissioned delegations should be able to be used for front-end canister calls and inter-canister calls.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | [Björn Tackmann](https://github.com/Dfinity-Bjoern) |
| R10 | Cross-chain interoperability                                                                                                    | The solution should look to be compatible to standards that allow cross-chain interactions, such as:<ul><li>CACAOs (Chain agnostic capability object):<ul><li>https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-74.md </li><li> https://github.com/spruceid/cacao-rs </li></ul></li><li>UCANs:<ul><li>https://ucan.xyz/ </li><li> https://github.com/ucan-wg/rs-ucan </li></ul></li></ul>                                                                                                                                                                                                                                                                                                  | https://github.com/MioQuispe                        |



