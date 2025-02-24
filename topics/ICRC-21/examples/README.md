# ICRC-21 Consent Message Examples

This folder contains various consent messages examples for ICRC standards. These examples can be used as reference in
a ICRC-21 implementation. This document and the examples will be updated over time with best practices.

## Authenticated vs Anonymous

In most cases the ICRC-21 consent message request is made with the same caller that the request will be made with after
approval. But in some cases, particularly the cold signer flow, the ICRC-21 consent message request will be made
anonymously since the cold signer is not able to call the canister itself directly.

It's recommended to show the authenticated ICRC-21 consent message to the user before letting the user interact with the
cold signer, where it will once more see a consent message, this time likely shorter due to it being anonymous.

## Generic Display

This device spec renders Markdown messages, the examples available in this repo follow the below guidelines.

#### Title

Always define a title `#`, but keep is short `action + subject` e.g. `Approve transfer`.

#### Explanation

After the title, use a paragraph to explain the request in more detail.

#### Sections

Group sections with labels: `**label:**`, this keeps it as a single readable message in comparison to adding headers.

#### Additional explanations

Add additional explanations where needed for each section, use line breaks over empty lines (two spaces at the end of
the line).

#### Account address

Always
use [ICRC-1 textual encoding of accounts](https://internetcomputer.org/docs/current/references/icrc1-standard#textual-encoding-of-accounts)
if possible. Avoid separately mentioning the subaccount, instead use
the [non-default account](https://internetcomputer.org/docs/current/references/icrc1-standard#non-default-accounts)
syntax.

Wrap account addresses in `` `code` `` tags.

#### Token amounts

Show amounts with decimals followed by token symbol. Truncate trailing zeros e.g. `32.716 ICP` and wrap in `` `code` ``
tags

#### Date and time

As defined in
the [ICRC-21 spec](https://github.com/dfinity/wg-identity-authentication/blob/main/topics/ICRC-21/ICRC-21.did#L8),
render date and/or time in human-readable format based on received BCP-47 language, fallback to UTC if offset is not
defined.

#### Transaction memo

Attempt to decode the memo as UFT-8 string else fallback to a hex string. Always wrap in `` `code` ``
tags.

## Line Display

This device spec renders plaintext messages, line display requests can contain any `characters_per_line` and
`lines_per_page` values. This means that consent messages should be short and flexible to render on most displays.

The examples available in this repo follow the below guidelines.

#### Title

Avoid a title, instead directly start with a paragraph that explains the request.

#### Blocks

The following example consists of 7 blocks, separated with empty lines:

```txt
You are authorizing another address to withdraw funds from your account.
 
Authorized address: {{authorized_address}}

Requested allowance: {{requested_allowance}}
 
This is the withdrawal limit that will apply upon approval. Until then, any existing allowance remains in effect.

Expiration date: {{expiration_date}}
 
Approval fee: {{approval_fee}}
 
Transaction memo: {{transaction_memo}}
```

A single space ` ` on an empty line indicates that blocks should be put on the same page (if possible).

An explanation like `This is...in effect.` for the `Requested allowance` is an example of a block that should be put
together on the same page by adding a single space ` ` on the empty line above it. Overall it's recommended to avoid
explanations where possible to keep the number of blocks, and thus lines to a minimum.

#### Characters per line

- Wrap sentences always at white space characters where possible, consider a library that handles this.
- Prioritize moving values (e.g. 34.87 ICP) onto a new line over splitting a line into multiple.
- If a word is too long for a line, break the word into multiple lines to maintain the characters per line limit.
- Wrap account addresses always at `-` characters at the end of the line.

#### Pages from lines

Split blocks first on empty lines (without a single space) to create pages

If any of the resulting pages still has too many lines:

1. Split these pages on remaining empty lines (with a single space).
2. If that still results in too many lines, split after `lines_per_page`.

#### Example JS implementation

```js
import wrapAnsi from 'wrap-ansi';
import fs from 'fs';

const charactersPerLine = 32;
const linesPerPage = 8;

// Utility method to wrap account addresses on `-` characters
const wrapAddress = (address, charactersPerLine) => (address + '-')
    .match(new RegExp('.{1,' + (charactersPerLine - 1) + '}(?=-)', 'g'))
    .map((line) => line.startsWith('-') ? line.slice(1) : line)
    .join('-\n');

// Use a line display template from the examples
let text = fs.readFileSync('en_US/icrc2_approve/anonymous/default.txt', 'utf-8');

// Define arguments, wrap adresses already at this point
const args = {
    authorized_address: wrapAddress('k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae-6cc627i.1', charactersPerLine),
    requested_allowance: '324.76 ICP',
    expiration_date: 'Fri, Feb 21, 2025, 09:56 UTC',
    approval_fee: '0.0001 ICP',
    transaction_memo: '48656c6c6f20576f726c64'
};

// Insert arguments, wrap onto new line if it becomes too long
text = text.replace(/(.*){{(.*?)}}/g, (_, prefix, arg) =>
    prefix.length > 0 && (prefix + args[arg]).length > charactersPerLine
        ? (prefix + '\n' + args[arg])
        : (prefix + args[arg])
);

// Use library to wrap lines onto multiple lines
text = wrapAnsi(text, charactersPerLine, {
    hard: true, // `charactersPerLine` is a hard limit, we can't go past it
    wordWrap: true, // Attempt to split words at spaces
    trim: false // Don't remove spaces from blank lines
});

const pages = text
    // Split block based on empty lines
    .split('\n\n')
    // If a block has more lines than allowed, split it 
    // into multiple based on empty lines with a space.
    .flatMap(block => block.split('\n').length > linesPerPage ? block.split('\n \n') : block)
    // If a block still has more lines than allowed, 
    // split it into multiple based on lines per page.
    .flatMap(block => {
        const lines = block.split('\n');
        return Array
            .from({length: Math.ceil(lines / linesPerPage)})
            .map((_, index) => lines.slice(index * linesPerPage, (index + 1) * linesPerPage));
    })
    // Create pages with lines from blocks
    .reduce((pages, block) => {
        const lastPage = pages[pages.length - 1];
        const lines = block.split('\n');
        if (lastPage.length + lines.length + 1 > linesPerPage) {
            pages.push(lines);
        } else {
            if (lastPage.length > 0) {
                lastPage.push('');
            }
            lastPage.push(...lines);
        }
        return pages;
    }, [[]]);
```

```js
[
    [
        'You are authorizing another',
        'address to withdraw funds from',
        'your account.',
        ' ',
        'Authorized address:',
        'k2t6j-2nvnp-4zjm3-25dtz-6xhaa-',
        'c7boj-5gayf-oj3xs-i43lp-teztq-',
        '6ae-6cc627i.1',
    ],
    [
        'Requested allowance: 324.76 ICP',
        ' ',
        'This is the withdrawal limit',
        'that will apply upon approval.',
        'Until then, any existing',
        'allowance remains in effect.',
    ], [
        'Expiration date:',
        'Fri, Feb 21, 2025, 09:56 UTC',
        ' ',
        'Approval fee: 0.0001 ICP',
        ' ',
        'Transaction memo:',
        '48656c6c6f20576f726c64',
    ]
]
```