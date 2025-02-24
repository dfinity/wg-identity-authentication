# ICRC-21 Consent Message Examples

This folder contains various consent messages examples for ICRC standards. These examples can be used as reference in
a ICRC-21 implementation. This document and the examples will be updated over time with best practices.

## Authenticated vs Anonymous

In most cases the ICRC-21 consent message request is made with the same caller that the request will be made with after
approval. But in some cases, particularly the cold signer flow, the ICRC-21 consent message request will be made
anonymously since the cold signer is not able to call the canister itself directly.

It's recommended to show the authenticated ICRC-21 consent message to the user before letting the user interact with the
cold signer, where it will once more see a consent message, this time likely shorter due to it being anonymous.

## Device Specs

The ICRC-21 standard specifies two device specs, which are briefly discussed here.

### Generic Display

This device spec renders Markdown messages, keep the following guidelines in mind during implementation:

- Always define a title `#`, keep it short.
- Add a paragraph to explain the request in more detail.
- Group details with headers `**header:**` into blocks.
- Add a paragraph to each detail to explain where needed.
- Limit line length where needed, consider line breaks (ending a line with two empty spaces).
- Use `` `code` `` tags for account addresses, token amounts and transaction memo.
- Always
  use [ICRC-1 textual encoding of accounts](https://internetcomputer.org/docs/current/references/icrc1-standard#textual-encoding-of-accounts)
  if possible.
- Avoid separately mentioning the subaccount where possible, instead use
  the [non-default account](https://internetcomputer.org/docs/current/references/icrc1-standard#non-default-accounts)
  syntax.
- Attempt to decode the memo at UFT-8 string else fallback to a hex string.

### Line Display

This device spec renders plaintext messages, line display requests can contain any `characters_per_line` and
`lines_per_page` values.

Keep the following line display specific guidelines in mind during implementation:

- No Markdown syntax, only plaintext is supported.
- Avoid a title, instead directly start with a paragraph that explains the request.
- Use blank lines between block of details, add a space on the blank line if the blocks belong together.
- An explanation of a detail should be its own block, but an empty space can be used to indicate they belong together.
- Avoid explanations where acceptable to keep the number of lines at a minimum.
- When splitting the message into multiple pages, split based on blank lines first before blank lines with spaces.
- Split paragraphs always at whitespace characters if possible.
- Split account addresses always at `-` character if possible, avoid splitting at `.` subaccount separator.

#### Example JS implementation

```js
import wrapAnsi from 'wrap-ansi';
import fs from 'fs';

const charactersPerLine = 32;
const linesPerPage = 8;

// Utility method to wrap addresses on `-` characters
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
    // Split block of details based on blank lines
    .split('\n\n')
    // Blocks of details that belong together have a space on the
    // blank line between them to prevent them from being split, 
    // unless they cannot be rendered together on a single page.
    .flatMap(block => block.split('\n').length > linesPerPage ? block.split('\n \n') : block)
    // Create pages with lines from blocks of details
    .reduce((pages, block) => {
        const lastPage = pages[pages.length - 1];
        let lines = block.split('\n');
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