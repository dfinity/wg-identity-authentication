# ICRC-27: Ledger extension for Wallet Interaction Standard

| Status |
|:------:|
| Draft  |

## Summary

This specification describes a ledger extension for the ICRC--25 Wallet Interation Standard.

## Terminology

* wallet: A service that manages a user's keys and can sign and perform canister calls on their behalf.
* relying party: A service that wants to request calls on a specific canister.

## Messages

### `permission`

Additional `ledger` scope is passed in the request and in the response an additional `subaccounts` property is returned in each `identity` when the wallet supports this extension.

There are many types of wallets:
- Wallets that support many different standards
- Wallets that support multiple networks
- Wallets that keep a list of subaccounts per ledger
- Wallets that keep a list of subaccounts used across all ledgers

#### Request

The `ledger` scope is passed to the ICRC-25 `permission` request message scopes, no additional fields in the request are required in this spec.

#### Response

`identities`: Same as ICRC-25 response with additional `ledger` field.
  - `subaccounts` (`vec`): List of ledger subaccounts for this identity.
    - `networks` (`vec text`): List of network chain ids for this subaccount, this should be equal to or a subset of the networks in the permission request.
    - `standards` (`vec text`): List of standards for this subaccount
    - `canisterIds` (`opt vec principal`): Optional list of ledger canister ids for this subaccount, subaccount is assumed to be for any supported ledger if undefined.
    - `bytes` (`blob`): Subaccount bytes used to derive the subaccount identity, this is 32 bytes for ICRC-1 but could differ for other standards and networks.
    - `name` (`opt text`): Optional name for this subaccount.

#### Use-Case

The relying party can use the subaccounts in the ledger information to manage funds and assets held by these subaccounts.

Example usages:
- Relying party needs to know which subaccount of the user contains ICP tokens to request a transfer of ICP tokens to make a payment
- Relying party needs to know all subaccounts on the IC network to create tax reports
- Relying party needs to know the ckBTC subaccounts to make a ckBTC payment
- Relying party needs to know all subaccounts for the ICRC-1 standard to show all NFTs the user owns and is able to list on the marketplace

#### Example

```json
// Request
{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "permission",
    "params": {
        ...
        "scopes": ["ledger"],
    }
}

// Response
{
    "id": 1,
    "jsonrpc": "2.0",
    "result": {
        ...
        "scopes": ["ledger"],
        "identities": [
            {
                ...
                "subaccounts": [
                  {
                    "networks": ["icp:737ba355e855bd4b61279056603e0550"],
                    "standards": ["icrc1"],
                    "canisterIds": ["ryjl3-tyaaa-aaaaa-aaaba-cai"],
                    "bytes": "0000000000000000000000000000000000000000000000000000000000e73f5c",
                    "name": "Account 3"
                  }
                ]
            }
        ]
    }
}
```
