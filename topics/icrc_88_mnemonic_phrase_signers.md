### ICRC-88: Mnemonic Phrase Signers and Account Identity Derivation

#### Summary

ICRC-88 mandates the use of BIP39 for mnemonic phrase generation and BIP44 for account identity derivation. This ensures robust security and interoperability across different platforms.

Special provisions are made for relying party (RP) accounts to isolate their identities, requiring all derivation paths to be hardened. 

Signers are encouraged to support multiple accounts, sub-accounts, and RP-accounts, allowing users flexibility in managing their cryptographic identities.

#### 1. Mnemonic Phrases

Mnemonic phrase signers MUST use BIP39 for generating mnemonic phrases and SHOULD support importing mnemonic phrases of 12, 18 and 24 words.

#### 2. Account Identity Derivation

Account identities MUST be derived from the master seed using BIP44.

- The coin type index MUST be 223 (as specified in SLIP10).
- The change index MUST be 0.
- The derived private and public key MUST conform to the secp256k1 curve.

**Path for Main Account:** `m/44'/223'/0'/0/0`

**Example of Derived Extended Keys and Principal for Main Account:**
- Mnemonic:  
  `unfold depth bean excess cause suit couple top model dish flavor hospital`
- Master Seed (derived from the mnemonic):  
  `d12dd257e0e7069ab5e79244c4e5a2a1e5ed84693c4cc9f3e2c4912dd2c9aafd`
- Extended Private Key:  
  `xprv9s21ZrQH143K3AKjczf5Zs3bFXGHg8Xcyg9dpEgLNUJm5S9gCdxwaKTZhBhax4gj8Tx6PMzLbT6zG51z1EdA5erqSVyBBHSe1ZYY1MX2Fgj`
- Extended Public Key:  
  `xpub6CUGRUonZSQ4TWtTMmzXdrXDtyPWKiUV5F1XHxn6xkthHG6VznCrcJomZ4xzLiFAm7GptSKApKtTL1gD6K4rhRHDJFvhXRyoAjV5rbPx8qV`
- Principal:  
  `s2gs4-vlb3k-rxqv4-7ulgr-5up6z-fjtsq-cqyy7-q3hsi-bxppy-bvxtm-vae`

##### 2.1 Relying Party Accounts

For relying party (RP) accounts, as defined in ICRC-34, special considerations ensure isolated identities.

**The derivation path used for Relying Party Accounts follows this structure:**
```
m/purpose'/coin_type'/account'/change'/rp_type'/segment1'/segment2'/segment3'/segment4'/segment5'
```

- The change index MUST be `29296'`.
  > This 32 bit index is the UTF-8 encoded bits of the string "rp" starting with a positive bit (1), indicating it is a hardened index.
- The hardened index `0'` indicates that the RP identifier type is origin.
  > Future relying party identifier specifications may use other indices for different identifier types.
- Origin identifier index segments MUST be created according to the following steps:
  - Hash the UTF-8 encoded bits of the relying party identifier using SHA-256.
  - Chunk the first 155 bits into 31-bit segments.
  - Prefix each segment with a positive bit (1) to indicate it is a hardened index.

**Path for Relying Party Account (with origin "https://example.com"):**
```
m/44'/223'/0'/29296'/0'/134430806'/1427847593'/788432362'/770915148'/2128951988'
```

**Example of Derived Extended Keys and Principal for RP Account:**
- Extended Private Key:  
  `xprv9yLYKDUhYtmT5XfBLzKFTygEz3d9Mztnbc78GcTZQAiW4ow2BXYdRvU8Q6sFywSbUN2Qq66gN1gZR4MbhGH2BpPnhQWcu2T7Fsyv8d3peNL`
- Extended Public Key:  
  `xpub6DpZGS5LF1L4Pce7pXyJDLcwU6gRj3erYAKUmJRFujfTZ9tktFt8PC2Dykzkz4mVxHYwBgxhfT7g2Wh3EDC9pHVPrd9UwaWkX2ak6X2JKyn`
- Principal:  
  `avltv-z6aeo-qkvjv-6llam-wxf7j-fsqg6-hhviu-b2czx-mjyvl-qm2tt-4ae`

#### 3. Support for Multiple Accounts, Account Adresses, ICRC-1 Sub-Accounts, and RP-Accounts

- Signers SHOULD support multiple accounts or, at a minimum, allow users to define the account index in e.g. advanced settings.
- Signers SHOULD support multiple addresses or, at a minimum, allow users to define the address index in e.g. advanced settings.
- Signers SHOULD support ICRC-1 sub-accounts or, at a minimum, allow users to define the sub-account index in e.g. advanced settings.
- Signers SHOULD support multiple RP-accounts or, at a minimum, allow users to define the RP-account index in e.g. advanced settings.
