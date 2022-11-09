### Context

#### Common pattern

Web3 DApp, for example, DEX or Marketplace, usually wants to access the user's wallet. The common pattern is to treat the user's address as a wallet address and use it to access his/her assets stored in the ledger. This pattern is widely used in various blockchain ecosystems, mostly used in Ethereum. DApps on IC use this pattern as well, for example, Sonic.ooo, Entrepot.app, icDex.io. And also current token standards are also affected by this pattern.

It seems nothing wrong that developers choose this way.

### Problems in general

1. Fragmentation of wallet creation and assets management.
2. Cross DApp wallet usage and applied to the industry-wide pattern.

#### Problems illustration

However, on IC, 2 problems remain unresolved. If the community is not realizing these problems. The liquidity of assets and interoperability between DApps will be severely limited. Less liquidity means fewer transactions( or data exchanging), and if the situation continues, the ecosystem will eventually collapse and fewer DApps will remain.

1. The first problem is issued in https://github.com/dfinity/wg-identity-authentication/issues/5, generally, it's protocol level requirement and solution for global delegation and interoperability of user identity. We believe DFINITY will try its best to make this happens.

2. The second problem is related to the first one, but it's the interaction pattern of the canister. [NNS wallet](https://nns.ic0.app) and [AstroX ME Wallet](https://app.astrox.me) use` principal<>delegation identity<>ledger` to create wallet instances for users. And developers try to access users' NNS or ME wallet from their DApp, and they want to use wallet identity to call their DApp backend canister because they assume that assets are stored in NNS or ME wallet. Because both NNS and ME uses session key in their frontend, and for security reason (sessionKey exposure), NNS and ME wallet can not provide such kind of function call.

Bigger DApp nowadays even creates a wallet for each user, just like NNS and ME wallet does. The consequence will be each user login to each DApp will have a different wallet identity (because II creates a different identity for each DApp, also mentioned in https://github.com/dfinity/wg-identity-authentication/issues/5). Users will have a hard time managing not only their identities but also their wallets. And even worse, because delegation identity is calculated by **frontend URL**, the identity will become unstable when frontend URL changes and the wallet and assets tied to the identity will potentially be lost ( maybe \*\*FOREVER\*\*).

Let's elaborate on the problem in examples:

- There is no DApp can use NNS Wallet as a user's wallet, but the user may use NNS principal/account id to receive NFTs or Tokens, however, you can transfer out of NNS Wallet, because it's not integrated to any NFTs or token standards. NNS Wallet becomes an island that can not communicate with other DApps.

- Yumi.io is an NFT marketplace, like most marketplace DApp, Yumi.io uses "principal id<>ledger" pattern to create a wallet for each user. Recently uses II and AstroX ME wallet as identity provider options. Because ME wallet is also a mobile-first wallet, users can see the balance and NFT stored in their account, however, when users log in to Yumi.io, they find the wallet address is different from ME Wallet. Users complain but they do not have a choice but to manually transfer NFT between ME Wallet and Yumi.io.

- For SNS(published soon) frontend, people will participate in decentralized sales using it. However, users will have to manually copy the SNS account id to NNS frontend to deposit ICPs, a lot of confusion and tractions will happen here.
  Then, when it comes to governance of DApps, for example, voting on proposals. The user will have to first login to DApp for example OpenChat.io, click the voting widget, manually copy 'principal/canister ID", go to SNS DApp, paste to the "hotkey" as input, submit and complete the voting.
  Last but least, whenever the user can have their Tokens dissolving, he/she may want to put the tokens into a liquidity pool for decentralized exchanges. And because SNS (also a wallet) can not be called from DEXs like Sonic or InfinitySwap, the user will have to log in to DApp first, and copy the destination account id, then paste it back to SNS DApp. A lot of confusion and errors can happen here.

### Solution in general

1. Introducing a canister-based wallet architect, create/install/update/remove by user's main identity
2. When it comes to DApps, users can use delegation identity as an authorized principal added to ACL, and use a canister to call target canister functions.
   Extra security mechanisms and methods can be added to the wallet canister.

### Benefits

1. Users can own/control his/her wallet, and use them at will.
2. DApps can use identity to log in and use wallet calls seamlessly.
3. The canister-based wallet can enable many advanced features forward.

### Proposed solution detail

![avatar](/diagrams/canister_wallet_architect.png).

We have at least 1 canister to be built.

1. The controller of this canister should be one of the user's principal ids (or trusted principal/canister id).
2. In this canister, we have an ACL to access specific functions, authorized principal id(s) can be added to this list. Similar to `hotKey` design of NNS or `AddressBook` of Cycles wallet, only the authorized principal id(s) can access specific functions. [Example](https://github.com/dfinity/cycles-wallet/blob/fa86dd3a65b2509ca1e0c2bb9d7d4c5be95de378/wallet/src/address.rs#L88)
3. One of the authorized function calls is `wallet_call`, here we use `async/await` to call cdk API, which is `ic_cdk::api::call::call128`. [Example](https://github.com/dfinity/cycles-wallet/blob/fa86dd3a65b2509ca1e0c2bb9d7d4c5be95de378/wallet/src/lib.rs#L898)

The trusted setting here is to allow a user to `own` this canister because we assume this canister works as a private wallet, which should be served privately to the user him/herself, not to the public. Only the user can have the ability to create/upgrade/stop/delete this canister, the power can be delegated to a trusted 3rd party service under the user's permission. We shall have another topic to discuss this scheme.

We have 2 assumptions here:

- We assume the controller of this wallet canister is the user's NNS delegation Identity.
- The whole flow is running on the user's browser

Now we can design the authentication and authorize flow:

1. User logins with II, the DApp frontend will receive a delegation identity principal (DIP). For DApps don't need to use the wallet, the DIP will work as the normal function caller.
2. When DApp wants to access the user's wallet canister, there is another button we call `Connect Wallet`. When this button is clicked, a new window appears and shows the wallet canister owned by the NNS delegation identity.
3. Also in this window, there are a few necessary pieces of information will be shown to the user:
   - **DIP**, whether it can be added to the wallet canister's ACL.
   - **Expiration**, for how long the authorization and DIP will live.
   - **Target canisters**, which canisters are allowed to call, with ICScan links.
   - **Target functions(capabilities)**, a list of function names and usage, the user can choose to call or not
   - Other necessary information for example trusted/audited badge.
   - Other validation processes can be run here, for example, a simulation call by a trusted 3rd party.
4. If the user confirms, the DIP can be added to the wallet canister, and all valid authorization calls will be saved before expiration. And for fine control, we can also provide a UI that allows users to change authorized functions at his/her will.
5. If the user rejects it, the `connect wallet` process will be terminated.
6. When the wallet call happens, a few arguments will be passed to function, including:

### Limitations and potential problems

1. The Canister-based wallet has a principal id, but its canister id, the length(10) is different from the public key principal id. And it is the actual caller to the target canister, not the delegation identity of the frontend. An extra parameter is passed if DApp needs to recognize login identity and wallet.
2. The Caller is due when the wallet makes an inter-canister call, and can not be anonymous or customized or delegated to another principal. If we want the user to have more privacy we need to compensate with other mechanisms like zkSnark integration for example SpinnerCash.
3. We use dynamic calls here, thus some dangerous or malicious canister function calls may need to be taken care. So that we need to introduce extra protection mechanisms like filters, guardians, or 2FA methods here.
