### ICRC-X Specification: Mnemonic Phrase Signers and Account Identity Derivation

This specification outlines the standards and methods for generating and using mnemonic phrases and deriving account identities in the context of ICRC-X. Compliance with these guidelines ensures interoperability and security.

#### 1. Mnemonic Phrases

**Mnemonic phrase signers MUST use BIP39 for generating mnemonic phrases.**

- **Example:** A mnemonic phrase generated using BIP39 might be: "unfold depth bean excess cause suit couple top model dish flavor hospital".

#### 2. Account Identity Derivation

**Account identities MUST be derived from the master seed using BIP44.**

- The coin type index MUST be 223 (as specified in SLIP10).
- The change index for general accounts MUST be 0.
- The derived private and public key MUST conform to the secp256k1 curve.

**Example Path for General Account:**
`m/44'/223'/0'/0/0`

**Example of Derived Extended Keys and Principal for Main Account (index 0):**
- Mnemonic: "unfold depth bean excess cause suit couple top model dish flavor hospital"
- Master Seed (derived from the mnemonic): `d12dd257e0e7069ab5e79244c4e5a2a1e5ed84693c4cc9f3e2c4912dd2c9aafd`
- Extended Private Key: `xprv9s21ZrQH143K3AKjczf5Zs3bFXGHg8Xcyg9dpEgLNUJm5S9gCdxwaKTZhBhax4gj8Tx6PMzLbT6zG51z1EdA5erqSVyBBHSe1ZYY1MX2Fgj`
- Extended Public Key: `xpub6CUGRUonZSQ4TWtTMmzXdrXDtyPWKiUV5F1XHxn6xkthHG6VznCrcJomZ4xzLiFAm7GptSKApKtTL1gD6K4rhRHDJFvhXRyoAjV5rbPx8qV`
- Principal (using @dfinity/identity-secp256k1 npm library): `s2gs4-vlb3k-rxqv4-7ulgr-5up6z-fjtsq-cqyy7-q3hsi-bxppy-bvxtm-vae`

##### 2.1 Relying Party Accounts

For relying party (RP) accounts, the change index and derivation path have special requirements to ensure that RP identities are isolated. All paths in the RP derivation process are hardened to guarantee this isolation.

1. **Change Index:**
   - The change index MUST be the UTF-8 encoded bits of the string "rp" represented in base 10.
   - This 32-bit index MUST start with a positive bit (1), indicating it is a hardened index.

   **Example:**
   - The string "rp" in UTF-8 is `0x7270`, which in base 10 is `29296`.
   - In 32-bit representation with a leading positive bit: `0x80007270` (where the highest bit indicates it is a hardened index).

2. **Relying Party Identifier:**
   - The relying party identifier can be any string that uniquely identifies the RP. An example of such a string is the origin.
   - According to the [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy#definition_of_an_origin), an origin is defined as the combination of the scheme, hostname, and port of a URL.
   - If the relying party identifier is an origin, the combination of the origin and the prefix "origin:" MUST be hashed. For example, "origin:https://example.com".
   - Other unique strings besides the origin can be used to identify an RP. Future extensions of the ICRC standard will define the string that should be hashed for non-origin identifiers and these standards SHOULD NOT use the "origin:" prefix.

3. **Identifier Hashing:**
   - The relying party identifier (e.g., prefixed origin) MUST be hashed using SHA-256.
   - The first 160 bits of this hash MUST be chunked into 31-bit segments.
   - Each segment MUST be prefixed with a positive bit (1) to form 32-bit hardened indices.
   - If a segment is less than 31 bits, leading negative bits (0) MUST be added to complete 32 bits.

   **Example with Origin "https://example.com":**
   - Combine with the prefix: "origin:https://example.com".
   - Hash the prefixed origin using SHA-256: 
     ```
     SHA-256("origin:https://example.com") = 0xd8b9f8e8bff761c76f4c07330af244f79d15046d697fc77625a8a9047ad14d44
     ```
   - The first 160 bits: 
     ```
     0xd8b9f8e8bff761c76f4c07330af244f79d15046d
     ```
   - Chunked into 31-bit segments:
     ```
     0x1b173f1d1, 0x7feec38e, 0x6f4c0733, 0x30af244f, 0x79d15046, 0xd
     ```
   - Prefixed to form 32-bit indices:
     ```
     0x81b173f1d, 0x87feec38e, 0x86f4c0733, 0x830af244f, 0x879d15046, 0x80000000d
     ```

4. **Derivation Path:**
   - The final path MUST include the coin type, master seed, and these hardened indices.

   **Example Path for Relying Party Account (with origin "https://example.com"):**
   `m/44'/223'/0'/0x80007270'/0x81b173f1d'/0x87feec38e'/0x86f4c0733'/0x830af244f'/0x879d15046'/0x80000000d'/0'`

**Example of Derived Extended Keys and Principal for RP Account:**
- Extended Private Key: `xprv9yLYKDUhYtmT5XfBLzKFTygEz3d9Mztnbc78GcTZQAiW4ow2BXYdRvU8Q6sFywSbUN2Qq66gN1gZR4MbhGH2BpPnhQWcu2T7Fsyv8d3peNL`
- Extended Public Key: `xpub6DpZGS5LF1L4Pce7pXyJDLcwU6gRj3erYAKUmJRFujfTZ9tktFt8PC2Dykzkz4mVxHYwBgxhfT7g2Wh3EDC9pHVPrd9UwaWkX2ak6X2JKyn`
- Principal (using @dfinity/identity-secp256k1 npm library): `avltv-z6aeo-qkvjv-6llam-wxf7j-fsqg6-hhviu-b2czx-mjyvl-qm2tt-4ae`

#### 3. Key Use and Storage

- The derived private and public keys SHOULD be securely stored and used according to secp256k1 standards.
- Implementations SHOULD ensure private keys are never exposed and are used only in secure environments.

#### 4. Multiple Accounts and Sub-Accounts

- Signers SHOULD support multiple accounts or, at a minimum, allow users to define the account index in advanced settings.
- Signers SHOULD also support ICRC-1 sub-accounts or, at a minimum, allow users to define the sub-account index in advanced settings.

#### 5. Interoperability and Compliance

- Implementations of this specification MUST be tested for interoperability.
- Compliance with the above standards ensures that mnemonic phrase signers and account derivation methods are secure and consistent across different platforms.

#### Summary

This specification mandates the use of BIP39 and BIP44 for mnemonic phrase generation and account identity derivation, respectively, with specific requirements for relying party accounts. Following these guidelines ensures robust security and interoperability in the ICRC-X context. All paths in the RP derivation process are hardened to guarantee isolation of RP identities. If the relying party identifier is an origin, it MUST be prefixed with "origin:" before hashing. Future extensions will define standards for non-origin identifiers. Signers SHOULD support multiple accounts and ICRC-1 sub-accounts, allowing users to define account and sub-account indices in advanced settings.
