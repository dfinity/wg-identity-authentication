### ICRC-88: Mnemonic Phrase Signers and Account Identity Derivation

#### Summary

ICRC-88 mandates the use of [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) for mnemonic phrase generation and [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) for account identity derivation. This ensures robust security and interoperability across different platforms.

Special provisions are made for relying party (RP) accounts to isolate their identities, defining a custom path for RP accounts where all derivation paths are hardened. 

Signers are encouraged to support multiple accounts, sub-accounts, and RP-accounts, allowing users flexibility in managing their cryptographic identities.

#### 1. Mnemonic Phrases

Mnemonic phrase signers MUST use [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) for generating mnemonic phrases and SHOULD support importing mnemonic phrases of 12, 18 and 24 words.

#### 2. Account Identity Derivation

Account identities MUST be derived from the master seed using [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki).

**The derivation path defined in BIP44 follows this structure:**
```
m/purpose'/coin_type'/account'/change/address_index
```

- The purpose index MUST be `44'` (as specified in [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)).
- The coin type index MUST be `223'` (as specified in [SLIP44](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)).
- The change index MUST be `0`.

**Path for Main Account:** `m/44'/223'/0'/0/0`

**Example of Derived Extended Keys and Principal for Main Account:**
- Mnemonic:  
  `unfold depth bean excess cause suit couple top model dish flavor hospital`
- Master Seed (derived from the mnemonic):  
  `50dd2a9e38fc42312576f6f53cebc123feb834fbdf2fe97cab9c0b67daeb2d31035ae2088378e6c2249bb0edd17d448589609d22dd50565151f8b3465ce4c553`
- Extended Private Key:  
  `xprv9s21ZrQH143K2CjhnneZehT4D3L8pTGsBEkdkaax7DCyBiqpRNDTaDepwo8y1XfoXNV8SJPyx6CKfSwhDamaX3qigDj5dmKdximZdF1w2yR`
- Extended Public Key:  
  `xpub661MyMwAqRbcEgpAtpBa1qPnm5AdDuziYTgEYxzZfYjx4XAxxuXi81yJo6azGtULMApz5A2k6CPRzUoQdPN9QK9jw7XbPnucgfqiYvPqxne`
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
- The hardened index `0'` indicates that the RP identifier type is `origin`.
  > Future relying party identifier specifications may use other indices for different identifier types.
- Origin identifier index segments MUST be created according to the following steps:
  - Hash the UTF-8 encoded bits of the relying party identifier using SHA-256.
  - Chunk the first 155 bits into 31-bit segments.
  - Prefix each segment with a positive bit (1) to indicate it is a hardened index.

**Path for Relying Party Account (with origin "https://example.com"):**
```
m/44'/223'/0'/29296'/0'/134430806'/1427847593'/788432362'/770915148'/2128951988'
```

**Example of Derived Extended Keys and Principal for Relying Party Account (with origin "https://example.com"):**
- Extended Private Key:  
  `xprvADKqUASfRBhXY8BaET8ds4TF7qAN6BLgsL1zFBtC5pPfmk95zYBidv5LS5WJrsfVYEeDD58683wJCe2aMdRmRzurTZkfut8sukpmPc8GHuB`
- Extended Public Key:  
  `xpub6SKBsfyZFZFpkcG3LUfeECPyfrzrVe4YEYwb3aHoe9veeYUEY5VyBiPpHLXfL2kvqo6mkp944QPB32rmBbyfeJxKCHi9mJQkQmcNptxe6B7`
- Principal:  
  `avltv-z6aeo-qkvjv-6llam-wxf7j-fsqg6-hhviu-b2czx-mjyvl-qm2tt-4ae`

#### 3. Support for Multiple Accounts, Account Adresses, ICRC-1 Sub-Accounts, and RP-Accounts

- Signers SHOULD support multiple accounts or, at a minimum, allow users to define the account index in e.g. advanced settings.
- Signers SHOULD support multiple addresses or, at a minimum, allow users to define the address index in e.g. advanced settings.
- Signers SHOULD support ICRC-1 sub-accounts or, at a minimum, allow users to define the sub-account index in e.g. advanced settings.
- Signers SHOULD support multiple RP-accounts or, at a minimum, allow users to define the RP-account index in e.g. advanced settings.
