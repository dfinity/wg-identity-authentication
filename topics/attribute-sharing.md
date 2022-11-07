# Attribute Support on the Internet Computer

## Problem description

For identity providers such as the Internet Identity, the principal under which a user is known to a dapp is not only unique to that dapp but its value is also unpredictable. While this separation provides several security and privacy benefits, it makes it hard for dapps to share information about their users with one another, such as user attributes, since the same user will be known under a different identity for each dapp, as indicated in the figure below. Hence, the goal of this project is to provide means for third-party dapps (relying parties) to handle attributes issued by other dapps (issuers) in a privacy preserving manner.  ![User principals with issuer and relying party dapps](../diagrams/user-principals.png)

## Design options

In order to solve this problem, there are a few parameters that need to be specified in the architecture.
* Who can issue credentials
   - **Trusted identity providers**: In some architectures such as Concordium's blockchain [[Concordium](https://concordium.com/ "The Cordordium blockchain")], trusted identity providers are responsible for issuing and managing attributes to users.
  - **Any entity or user**: In other cases, such as in the W3C's verifiable credential standard [[VC-DATA-MODEL](https://www.w3.org/TR/vc-data-model/ "Verifiable Credentials Data Model v1.1")], any entity is allowed to be an issuer. In this case, it is up to relying party dapps to decide which issuers they are willing to trust during the verification process.
* Who decides which issuers to trust
  - **Off-chain**: In some architectures, such as Concordium's blockchain [[Concordium](https://concordium.com/ "The Cordordium blockchain")], there is a particular entity such as the Foundation who is responsible for managing the registration of identity providers
  - **RP - relying party**: In the W3C's verifiable credential standard [[VC-DATA-MODEL](https://www.w3.org/TR/vc-data-model/ "Verifiable Credentials Data Model v1.1")], the relying party is the one that decides which issuers can be trusted.
  - **NNS / SNS**: Another possibility is for Decentralized Autonomous Organizations (DAOs), such as the NNS or an SNS, to decide which issuers to trust.
* Who pays for the service
  - **Self-sovereign identity**: In this setting, the owner of identity would be responsible for paying for the service being provided by the issuer. This option potentially provides better privacy since the issuer in principle would not be aware of which relying party is verifying the user attributes.
  - **Relying party - RP**: In this setting, the relying party in charge of verifying a user's attribute would be responsible for paying for the service being provided by the issuer. This option is hard to implement securely because the identity provider needs to guarantee that the relying party gets charged correctly by the issuer without compromising the unlinkability among the principals in the RP and issuer dapps.
* Who defines the semantics for attributes 
  - **Application**: In this setting, the specification of attributes would be done at the application level and independently of the identity provider, which would only help pass this information between the RP and issuer dapps.
  - **Identity provider**: In this case, the semantics of attributes would be defined by the identity provider and applications would have to adhere to it.
* Who specifies the policy
  - **Each dapp**: this is the most general setting and would allow different dapps to specify their own policies.
  - **Replica / subnet**: this option is more restrictive but possibly simpler to implement.  
* How to handle revocation of credentials
  - **Query-based revocation**: In this setting, RP dapps need to query the issuer dapp to check the status of a credential. If this query relies solely on the principal id at the issuer dapp, then this query would need support from the identity provider.  Although query-based revocation provides up-to-date status information, it can potentially leak the user access pattern to the issuer. 
  - **Whitelist-based revocation**: In this setting, the issuer would maintain a public list with the current set of valid credentials. If the credential is associated with the principal at the issuer dapp, the RP dapp would need help from the identity provider to check this information. This solution has the disadvantage of unnecessarily leaking the list of valid credentials. 
  - **Blacklist-based revocation**: In this setting, the issuer would maintain a public list with the current set of revoked credentials. As for whitelists, the RP dapp would need help from the identity provider to check this information if credentials are associated with principals at the issuer dapp.
* Handling credentials from multiple issuers
  - Certain RP dapps may require the verification of credentials issued by multiple dapps and we need to consider how these credentials can be safely combined to provide a verifiable presentation which does not break the unlikability of principals.

## Design choices

Given the different options listed above, we propose the following design choices which are more consistent with the decentralized philosophy of the Internet Computer:
* Allow **any entity** to issue credentials
* Let **relying party dapps** decide which issuers to trust
* Let **applications** define the semantics for attributes
* Support for revocation lists and the handling of multiple credentials
* Support for both **self-sovereign identities** and **relying parties** to pay for the service 

In order to meet these requirements, we propose to first provide a solution focused on self-sovereign identities without any payment support and then to add payment support at a second step so that relying parties can pay for the issuance of credentials.

## Proposed solution: Intuition

In order to provide attribute support in a privacy-preserving manner, our proposed solution is for the identity provider to securely link user principals without revealing both principals to issuers and relying parties, so that attributes can be mapped from one principal to another, as indicated in the figure below. ![diagram of mapping between attributes associated with issuer and relying party dapps](../diagrams/rp-issuer-diagram.png)

Let P<sub>Issuer</sub> and P<sub>RP</sub> be the identities under which a user is known to the issuing and relying party dapp canisters. In order to securely link these principals, our proposal is to let the identity provider create a joint identifier P<sub>New</sub> to be shared between these dapps and to provide separate signatures securely linking P<sub>New</sub> to P<sub>Issuer</sub> and P<sub>RP</sub> respectively. ![Joint user principals shared between issuer and relying party dapps](../diagrams/user-principals-private.png)

In order to preserve user privacy, the value of P<sub>New</sub> needs to be unpredictable. One way of achieving this is to choose a random new value for every session in which the relying party dapp needs to obtain attributes from an issuing dapp. However, for simplicity and efficiency reasons, we recommend to set the value of P<sub>New</sub> as a (pseudorandom) deterministic functions (PRFs) [[PRF](https://en.wikipedia.org/wiki/Pseudorandom_function_family "Pseudorandom function families")] of the user anchors and the frontend origins at the issuing and relying party dapps.

## Proposal focused on self-sovereign identities

Following the intuition above, we now propose a specific flow focused on self-sovereign identities, which does __not__ provide payment support. ![diagram of message flow among the issuer, identity provider, and relying party dapps](../diagrams/attribute-sharing-flow.png)

This proposal has the following features:
* It provides user privacy via the establishment of a new joint identifier computed as a function of the issuer and the relying party frontend origins and the identities under which the user is known to these dapps. This is represented by steps (7) and (8).
* It allows relying parties and identity providers to agree on the user attributes that need to be included in the user credential via a presentation exchange. This protocol exchange can be based on the Presentation Exchange Specification [[DIF-Presentation-Exchange](https://identity.foundation/presentation-exchange/ "DIF Presentation Exchange")] by the Decentralized Identity Foundation (DIF). This is represented by steps (3) and (12).
* It allows issuers to specify the inputs that are required from a subject to process a request for credential issuance via the use of credential manifests [[DIF-Credential-Manifests](https://identity.foundation/credential-manifest/ "DIF Credential Manifest")]. This is represented by steps (4) and (5).
* Identity providers can use the credential manifest information to submit the credential application for the user. This is represented by step (11).
* If the issuer accepted the credential application by the user, it issues a credential using the new joint identifier for the user, as indicated in step (14).  The credential format can be based on the verifiable credentials data model [[VC-DATA-MODEL](https://www.w3.org/TR/vc-data-model/ "Verifiable Credentials Data Model v1.1")].
* It allows users to use different anchors with respect to the issuer and relying party dapps, as indicated in step (7).

## Flow description

1. Sign up / login
   * User logins with the relying party (RP) or creates an account 
   * RP frontend checks whether user attributes have been verified
   * Generate key pair (RP<sub>SK</sub>,RP<sub>PK</sub>)
2. RP frontend opens the Identity Provider (IdP) frontend on a separate window, sending:
   * Presentation request (see [[DIF-Presentation-Exchange](https://identity.foundation/presentation-exchange/ "DIF Presentation Exchange")])
   * RP<sub>PK</sub>
   * Issuing dapp 
   * RP dapp
3. IdP frontend requests credential manifest from the issuer backend
   * Data format can be based on DIF's credential manifest [[DIF-Credential-Manifest](https://identity.foundation/credential-manifest/ "DIF Credential Manifests")]
   * This step may not be needed if the IdP has previously obtained the manifest. 
4. Issuer backend replies with the credential manifest
   * This step may not be needed if the IdP has previously obtained the manifest.
5. User logins with anchor<sub>RP</sub> and anchor<sub>Issuer</sub>
6. User is presented with an authorization request based on the presentation request from the RP and the credential manifest from the issuer  
   * User authorizes delegations to IdP<sub>1</sub> (anchor<sub>RP</sub>) and IdP<sub>2</sub> (anchor<sub>Issuer</sub>)
7. IdP frontend requests from backend a session to generate a credential, including 
   * anchor<sub>RP</sub> 
   * anchor<sub>Issuer</sub>
   * Issuing dapp frontend origin 
   * RP dapp frontend origin
8. IdP backend returns the following to the IdP frontend:
   * A signed pair (P<sub>New</sub>, P<sub>Issuer</sub>)<sub>🔒</sub>
   * A signed pair (P<sub>New</sub>, P<sub>RP</sub>)<sub>🔒</sub>
   * P<sub>New</sub> = PRF<sub>seed</sub>(anchor<sub>RP</sub>,anchor<sub>Issuer</sub>,RP<sub>orig</sub>,IS<sub>orig</sub>)
   * where PRF<sub>seed</sub> is a pseudorandom function with secret key __seed__ [[PRF](https://en.wikipedia.org/wiki/Pseudorandom_function_family "Pseudorandom function families")]
9. IdP frontend opens the issuer frontend on a separate window, requesting session key
10. Issuer frontend generates session key and sends it to the IdP frontend
    * Generate key pair (IS<sub>SK</sub>,IS<sub>PK</sub>)
    * Send (IS<sub>PK</sub> + request reference)
11. IdP frontend requests credential for P<sub>Issuer</sub> under P<sub>New</sub>, including 
    * Credential application [[DIF-Credential-Manifests](https://identity.foundation/credential-manifest/ "DIF Credential Manifests")]
    * A signed pair (P<sub>New</sub>, P<sub>Issuer</sub>)<sub>🔒</sub>
    * IdP<sub>2</sub> delegation to P<sub>Issuer</sub> 
    * Request reference
12. Issuer frontend contacts its backend to verify attributes and request the credential 
    * This may require interaction with the user to verify the user's attributes
    * The frontend sends both  P<sub>Issuer</sub> and P<sub>New</sub> to the backend 
    * If the user passes the verification, the backend issues a credential for P<sub>New</sub> 
13. Issuer backend returns a signed credential for P<sub>New</sub>
14. Issuer frontend sends credential to the IdP frontend, including:
     * Credential for P<sub>New</sub> 
     * Request reference
15. IdP frontend forwards the credential to the RP frontend, including:
     * A signed pair (P<sub>New</sub>, P<sub>RP</sub>)<sub>🔒</sub>
     * IdP<sub>1</sub> delegation to P<sub>RP</sub> 
     * Credential for P<sub>New</sub>
16. RP frontend interacts with its backend to update the user status


## Proposal with payment support 
To be done at a later time.

