### ICRC-88: Mnemonic Phrase Signers and Account Identity Derivation

#### Summary

ICRC-88 mandates the use of BIP39 for mnemonic phrase generation and BIP44 for account identity derivation. This ensures robust security and interoperability across different platforms. Special provisions are made for relying party (RP) accounts to isolate their identities, requiring all derivation paths to be hardened. Signers are encouraged to support multiple accounts, sub-accounts, and RP-accounts, allowing users flexibility in managing their cryptographic identities.

#### 1. Mnemonic Phrases

**Mnemonic phrase signers MUST use BIP39 for generating mnemonic phrases.**

And they SHOULD support importing mnemonic phrases of 12, 18 and 24 words.

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

For relying party (RP) accounts, as defined in ICRC-34, special considerations ensure isolated identities:

1. **Change Index:**
   - The change index MUST be the UTF-8 encoded bits of the string "rp" represented in base 10.
   - This 32-bit index MUST start with a positive bit (1), indicating it is a hardened index.

   **Example:**
   - The string "rp" in UTF-8 is `0x7270`, which in base 10 is `29296`.
   - In 32-bit representation with a leading positive bit: `0x80007270` (hardened index).

2. **Origin Index:**
   - The index `0` indicates that the RP identifier is an origin.
   - Future relying party identifier specifications may use other indices for different identifier types.

3. **Identifier Hashing:**
   - Hash the UTF-8 encoded bits of the relying party identifier using SHA-256.
   - Chunk the first 155 bits into 31-bit segments, prefixing each with a positive bit (1).

   **Example with Origin "https://example.com":**
   - Hash:
     ```
     SHA-256("https://example.com") = 0xd8b9f8e8bff761c76f4c07330af244f79d15046d697fc77625a8a9047ad14d44
     ```
   - Segments:
     ```
     0x1b173f1d1, 0x7feec38e, 0x6f4c0733, 0x30af244f, 0x79d150
     ```
   - Prefixed to form 32-bit indices:
     ```
     0x81b173f1d, 0x87feec38e, 0x86f4c0733, 0x830af244f, 0x879d150
     ```

4. **Derivation Path:**
   - The RP derivation path includes the master seed, coin type, RP index, origin index, and origin hash indices.
   - The final path for RP accounts is structured to ensure isolation and uniqueness.

   **Example Path for Relying Party Account (with origin "https://example.com"):**
   ```
   m/44'/223'/0'/0x80007270'/0'/0x81b173f1d'/0x87feec38e'/0x86f4c0733'/0x830af244f'/0x879d150'
   ```

**Example of Derived Extended Keys and Principal for RP Account:**
- Extended Private Key: `xprv9yLYKDUhYtmT5XfBLzKFTygEz3d9Mztnbc78GcTZQAiW4ow2BXYdRvU8Q6sFywSbUN2Qq66gN1gZR4MbhGH2BpPnhQWcu2T7Fsyv8d3peNL`
- Extended Public Key: `xpub6DpZGS5LF1L4Pce7pXyJDLcwU6gRj3erYAKUmJRFujfTZ9tktFt8PC2Dykzkz4mVxHYwBgxhfT7g2Wh3EDC9pHVPrd9UwaWkX2ak6X2JKyn`
- Principal (using @dfinity/identity-secp256k1 npm library): `avltv-z6aeo-qkvjv-6llam-wxf7j-fsqg6-hhviu-b2czx-mjyvl-qm2tt-4ae`

#### 3. Key Use and Storage

- Secure storage and usage of derived private and public keys are essential.
- Implementations must adhere to secp256k1 standards to maintain security.

#### 4. Support for Multiple Accounts, Account Adresses, ICRC-1 Sub-Accounts, and RP-Accounts

- Signers SHOULD support multiple accounts or, at a minimum, allow users to define the account index in e.g. advanced settings.
- Signers SHOULD support multiple account addresses or, at a minimum, allow users to define the account address index in e.g. advanced settings.
- Signers SHOULD support ICRC-1 sub-accounts or, at a minimum, allow users to define the sub-account index in e.g. advanced settings.
- Signers SHOULD support multiple RP-accounts or, at a minimum, allow users to define the RP-account index in e.g. advanced settings.

#### 5. Interoperability and Compliance

- Implementations MUST undergo interoperability testing to ensure adherence to this specification.
- Compliance ensures consistent and secure mnemonic phrase signing and account identity derivation practices across platforms.
