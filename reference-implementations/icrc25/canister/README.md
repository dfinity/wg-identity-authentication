# Example ICRC-21 Canister

A simple ledger canister adhering to the [ICRC-21 standard](../../../topics/icrc_21_consent_msg.md) and used in the reference implementation of the [ICRC-25 standard](../../../topics/icrc_25_signer_interaction_standard.md).

## Running the project locally

Make sure [the IC SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/) is installed on your machine. Then run:

```bash
# Starts the replica, running in the background
dfx start --background --clean

# Switches to your default account
dfx identity use default

# Deploys the ledger canister with a fixed id, sets the icrc21_backend canister as minter and current (default) identity as the canister's controller
dfx deploy ledger --specified-id wkw6r-kyaaa-aaaao-a2hma-cai --argument "(variant {Init = record { token_name = \"DEV\"; token_symbol = \"DEV\"; transfer_fee = 1; metadata = vec {}; minting_account = record {owner = principal \"xhy27-fqaaa-aaaao-a2hlq-cai\";}; initial_balances = vec {}; archive_options = record {num_blocks_to_archive = 1000000; trigger_threshold = 1000000; controller_id = principal \"$(dfx identity get-principal)\"}; }})"

# Deploys the icrc21_backend canister with a fixed id
dfx deploy icrc21_backend --specified-id xhy27-fqaaa-aaaao-a2hlq-cai --argument "(opt record { ledger_canister_id = principal \"wkw6r-kyaaa-aaaao-a2hma-cai\"; })"
```

Once the job completes, your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.
