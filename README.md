# Identity & Authentication Working Group

This is the repository of the [identity and authentication working group](https://wiki.internetcomputer.org/wiki/Identity_%26_Authentication). This repository is used to collaborate, document decisions, discuss changes, raise issues and provide feedback.

## Meetings

Meetings happen every two weeks.

The agenda will consist of discussing new and active issues and pull-requests, as well as going through the list of announced presentations in [this Google doc](https://docs.google.com/document/d/1wSVgXE23LYB4YACm9w2DY92PF5e587I0F5n1fTCWXOE/edit#heading=h.1gqbu1vngt6i).

Please consult the [working group calendar](https://calendar.google.com/calendar/u/0/embed?src=c_ck0gr79bkgcooicn1p87mo1ero@group.calendar.google.com&ctz=Europe/Zurich) for the next meeting date.

## Contributing

Everyone is welcome to join the public meetings of the working group.
* If you want to discuss a specific topic, please create and issue or pull-request. We will go over all the newly created issues and PRs in the next meeting.
* If you own a cool project related to Identity and built on the IC you are welcome to do a presentation in one of the meetings. If you wish to do so, please add your presentation (title, short summary and estimated time required) to [this Google doc](https://docs.google.com/document/d/1wSVgXE23LYB4YACm9w2DY92PF5e587I0F5n1fTCWXOE/edit#heading=h.1gqbu1vngt6i).  

## Working Group Members

The working group sessions are public and everybody is welcome. If you are interested in discussions about identity and authentication on the IC, please join us.

### Permanent Members
* DFINITY lead: [Frederik Rothenberger](https://github.com/frederikrothenberger)
* Community Leads:
  *  [Dan Ostrovsky](https://github.com/dostro) (Identity Labs)
  * [Bruce Huang](https://github.com/brutoshi) (AstroX)
* DFINITY Research Lead: [Michel Abdalla](https://github.com/michelabdalla-dfinity)
* Coordinator: [Mary Dwyer](https://github.com/marydwyer)

## Topics in Discussion
| Topic                                                                                         | Description                                                                                                                                                                                                                                                                                                                          |
|-----------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Mobile App Integration                                                                        | Improving interactions between:<br/>1. native mobile apps (Android and iOS) and identity providers hosted on the IC.<br/>2. dapps hosted on the ic with native mobile wallets acting as identity providers                                                                                                                           |
| [Interoperability of Services using User Identity](topics/interoperability.md)                | Currently, users either have different principals on each service or limited access rights to a specific list of canisters. While great for security some use-cases require to bridge this isolation in a controlled way. The working group needs to find a solution for this problem. Attribute sharing is part of this discussion. |
| [Proxied Canister Calls](topics/proxied_canister_calls.md)<br>(formerly Transaction Approval) | Currently, access to a service can only be given entirely or not at all. This is not sufficient for high value interactions. In those cases, repeated and explicit user consent for the particular interaction is desired (e.g. authorizing asset transfers). Developers should have an easy way to achieve that.                    |
| [Attribute Support on the Internet Computer](topics/attribute-sharing.md)                     | For identity providers such as the Internet Identity, the principal under which a user is known to a dapp is both unique to that dapp and unpredictable, making it hard for dapps to share information about their users with one another. Here we discuss ways of addressing this problem in a privacy preserving manner.           |

