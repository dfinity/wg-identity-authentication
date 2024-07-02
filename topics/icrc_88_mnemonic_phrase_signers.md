# ICRC-88: Mnemonic Phrase Signers and Account Identity Derivation

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)

<!-- TOC -->
* [ICRC-88: Mnemonic Phrase Signers and Account Identity Derivation](#icrc-88-mnemonic-phrase-signers-and-account-identity-derivation)
  * [Summary](#summary)
  * [1. Mnemonic Phrases](#1-mnemonic-phrases)
  * [2. Account Identity Derivation](#2-account-identity-derivation)
    * [2.1 Relying Party Accounts](#21-relying-party-accounts)
  * [3. Support for multiple accounts, addresses, and RP-accounts](#3-support-for-multiple-accounts-addresses-and-rp-accounts)
<!-- TOC -->

## Summary

ICRC-88 mandates the use of [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) for mnemonic phrase generation and [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) for account identity derivation. This ensures robust security and interoperability across different platforms.

Special provisions are made for relying party (RP) accounts to isolate their identities, defining a custom path for RP accounts where all derivation paths are hardened.

Signers are encouraged to support multiple accounts, addresses, and RP-accounts, allowing users flexibility in managing their cryptographic identities.

## 1. Mnemonic Phrases

Mnemonic phrase signers MUST use [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) for generating mnemonic phrases and SHOULD support importing mnemonic phrases of 12, 18 and 24 words.

## 2. Account Identity Derivation

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
  `t6hat-wb7i4-5gey2-filnh-eoy2i-o3kj5-7xaih-t22be-4u4wd-z4mwp-nqe`

### 2.1 Relying Party Accounts

For relying party (RP) accounts, as defined in ICRC-34, special considerations ensure isolated identities.

**The derivation path used for Relying Party Accounts follows this structure:**
```
m/purpose'/coin_type'/account'/change'/segment1'/segment2'/segment3'/segment4'/segment5'
```

- The change index MUST be `29296'`.
  > This 32 bit index is the UTF-8 encoded bits of the string "rp" starting with a positive bit (1), indicating it is a hardened index.
- Relying Party origin identifier index segments MUST be created according to the following steps:
    - Hash the UTF-8 encoded bits of the relying party identifier using SHA-256.
    - Chunk the first 155 bits into 31-bit segments.
    - Prefix each segment with a positive bit (1) to indicate it is a hardened index.

**Path for Relying Party Account (with origin "https://example.com"):**
```
m/44'/223'/0'/29296'/134430806'/1427847593'/788432362'/770915148'/2128951988'
```

**Example of Derived Extended Keys and Principal for Relying Party Account (with origin "https://example.com"):**
- Mnemonic:  
  `unfold depth bean excess cause suit couple top model dish flavor hospital`
- Master Seed (derived from the mnemonic):  
  `50dd2a9e38fc42312576f6f53cebc123feb834fbdf2fe97cab9c0b67daeb2d31035ae2088378e6c2249bb0edd17d448589609d22dd50565151f8b3465ce4c553`
- Extended Private Key:  
  `xprvABKWiVtKuQ6i4ncC5d3N7V6bmWurWgXDLJwc1SLv6CTCsFeFw6E9ahGXe5n4ZDYpp5ZQFW84opGrYP9x3uqKaLiX42hk6tH4jQyLCLTwQZQ`
- Extended Public Key:  
  `xpub6QJs81RDjmf1HGgfBeaNUd3LKYkLv9F4hXsCopkXeXzBk3yQUdYQ8Vb1VMpEDXBnjV7jyFvoq6XBv4ckzj4QWt7fofiiTA9wgrLWLVkHLu3`
- Principal:  
  `6c7za-syw4s-nsviv-e57hh-tnnfm-icpyh-ob4gj-sx52p-dnwla-nfkwk-2qe`

## 3. Support for multiple accounts, addresses, and RP-accounts

- Signers SHOULD support multiple accounts or, at a minimum, allow users to define the account index in e.g. advanced settings.
- Signers SHOULD support multiple addresses or, at a minimum, allow users to define the address index in e.g. advanced settings.
- Signers SHOULD support multiple RP-accounts or, at a minimum, allow users to define the RP-account index in e.g. advanced settings.
