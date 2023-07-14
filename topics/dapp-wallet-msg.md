# Messages

## Permission

A `permission_request` message is sent in order to establish a connection:
1. The relying party sends `permission_request` to the wallet. The message includes:
    - basic information about the relying party (`appMetadata`),
    - a list of networks on which the relying party plans to operate (`networks`),
    - a list of permission scopes it requires (`scopes`).
2. The wallet receives the message, presents the details of the to-be-established connection to the user and asks the user to select the account that will be paired in response.
    - If the user approves the request, the wallet sends `permission_response` back to the relying party. The message includes:
        - basic information about the wallet (`appMetadata`),
        - a list of networks on which the user has agreed the relying part can operate, should be a subset of the equivalent from `permission_request` (`networks`),
        - a list of permission scopes the user has agreed the relying party can be granted, should be a subset of the equivalent from `permission_request` (`scopes`)
        - the account details (princial or public key (*TBD what is required*) and optional subaccount) of the user selected account (`account`)
    - If the user rejects the request, the wallet sends `error` back to the relying party with appropriate explanation.

```
{ // Request
    type: "permission_request"
    appMetadata: /* dApp */ {
        name: String
        icon: Optional<String>
    }
    networks: Array<{
        type: "mainnet" | "testnet"
        name: Optional<String>
        rpcUrl: Optional<String>
    }>
    scopes: Array<"canister_call">
}

{ // Response
    type: "permission_response"
    appMetadata: /* wallet */ {
        name: String
        icon: Optional<String>
    }
    networks: Array<{
        type: "mainnet" | "testnet"
        name: Optional<String>
        rpcUrl: Optional<String>
    }>
    scopes: Array<"canister_call">
    account: {
        owner: String /* principal / publicKey */
        subaccount: Optional<String>
    }
}
```

## Canister Call

Once the connection between the relying party and wallet is established, the relying party can request the wallet to execute canister calls:
1. The relying party sends `canister_call_request`. The message incudes:
    - the network details on which the call should be executed,
    - the ID of the target canister,
    - the name of the call method to be executed,
    - the arguments for the call.
2. The wallet receives the request, validates if the relying party has permission to request the action and processes the message (in accordance with the ICRC-21 specification).
    - If the user approves the request, the wallet sends the call to the IC and, upon receiving a successful response, sends `canister_call_response` back to the relying party. The message includes:
        - the response from IC,
        - optionally (*TBD*), the parameters (or their subset) of the request.
    - If the user rejects the request or wallet fails to complete the requested action for any reason, the wallet sends `error` back to the relying party with appropriate explanation.

```
{ // Request
    type: "canister_call_request"
    network: {
        type: "mainnet" | "testnet"
        name: Optional<String>
        rpcUrl: Optional<String>
    }
    canisterId: String
    method: String
    args: String /* encoded */ / Object /* decoded */
}

{ // Response
    type: "canister_call_response"
    response: String /* encoded */ / Object /* decoded */
    // network: {
    //     type: "mainnet" | "testnet"
    //     name: Optional<String>
    //     rpcUrl: Optional<String>
    // }
    // canisterId: String
    // method: String
    // args: String /* encoded */ / Object /* decoded */
}
```

## Error

While processing a request from the relying party, the wallet can cancel it at any time by sending `error` in response. The message includes:
- the reason behind the cancellation (`errorType`),
- an optional description of the error (`description`).

```
{
    type: "error"
    errorType:
        | "ABORTED" /* the user has canceled the action */
        | "NETWORK_NOT_SUPPORTED" /* the network on which the action was requested is not supported by the wallet */
        | "NOT_GRANTED" /* the wallet has not granted permission to perform the action */
        | "NETWORK" /* the network call failed */
        | "UNKNOWN"
    description: Optional<String>
}
```
