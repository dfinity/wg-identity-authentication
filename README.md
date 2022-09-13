# Identity & Authentication Working Group

This is the repository of the [identity and authentication working group](https://wiki.internetcomputer.org/wiki/Identity_%26_Authentication). This repository is used to collaborate, document decisions, discuss changes, raise issues and provide feedback.

## Working Group Members

The working group sessions are public and everybody is welcome. If you are interested in discussions about identity and authentication on the IC, please join us.

### Permanent Members
* DFINITY lead: [Frederik Rothenberger](https://github.com/frederikrothenberger)
* Community Leads:
  *  [Dan Ostrovsky](https://github.com/dostro) (Identity Labs)
  * [Bruce Huang](https://github.com/brutoshi) (AstroX)
* DFINITY Research Lead: [Michel Abdalla](https://github.com/michelabdalla-dfinity)
* Coordinator: [Emma Peretti](https://github.com/emmaperetti)

## Topics in Discussion
| Topic                                                                          | Description                                                                                                                                                                                                                                                                                                                          |
|--------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Mobile App Integration                                                         | Improving interactions between:<br/>1. native mobile apps (Android and iOS) and identity providers hosted on the IC.<br/>2. dapps hosted on the ic with native mobile wallets acting as identity providers                                                                                                                           |
| [Interoperability of Services using User Identity](topics/interoperability.md) | Currently, users either have different principals on each service or limited access rights to a specific list of canisters. While great for security some use-cases require to bridge this isolation in a controlled way. The working group needs to find a solution for this problem. Attribute sharing is part of this discussion. |
| Transaction Approval                                                           | Currently, access to a service can only be given entirely or not at all. This is not sufficient for high value interactions. In those cases, repeated and explicit user consent for the particular interaction is desired (e.g. authorizing asset transfers). Developers should have an easy to use way to achieve that.             |

