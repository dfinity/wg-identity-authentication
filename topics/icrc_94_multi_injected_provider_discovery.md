# ICRC-94: Multi injected provider discovery

[![Status Badge](https://img.shields.io/badge/STATUS-DRAFT-ffcc00.svg)](https://github.com/orgs/dfinity/projects/31)
[![Extension Badge](https://img.shields.io/badge/Extends-ICRC--25-ffcc222.svg)](./icrc_25_signer_interaction_standard.md)

<!-- TOC -->
* [ICRC-94: Multi injected provider discovery](#icrc-94-multi-injected-provider-discovery)
  * [Summary](#summary)
  * [Motivation](#motivation)
  * [Specification](#specification)
    * [Definitions](#definitions)
    * [Provider Info](#provider-info)
    * [Window Events](#window-events)
  * [Backwards Compatibility](#backwards-compatibility)
  * [Reference Implementation](#reference-implementation)
    * [Wallet Provider](#wallet-provider)
    * [DApp Implementation](#dapp-implementation)
<!-- TOC -->

## Summary

An alternative discovery mechanism to `window.ic` for browser extension providers which supports discovering multiple injected Wallet Providers in a web page using Javascript’s window events.

See Ethereum's [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) for original inspiration.

## Motivation

Currently, Wallet Providers that offer browser extensions must inject themselves into the same window object window.ic or use another method; however, this creates conflicts for users that may install more than one browser extension.

Browser extensions are loaded in the web page in an unpredictable and unstable order, resulting in a race condition where the user does not have control over which Wallet Provider is selected to expose the ICP interface under the window.ic object. Instead, the last wallet to load usually wins.

This results not only in a degraded user experience but also increases the barrier to entry for new browser extensions as users are forced to only install one browser extension at a time.

Some browser extensions attempt to counteract this problem by delaying their injection to overwrite the same window.ic object which creates an unfair competition for Wallet Providers and lack of interoperability.

In this proposal, we present a solution that focuses on optimizing the interoperability of multiple Wallet Providers. This solution aims to foster fairer competition by reducing the barriers to entry for new Wallet Providers, along with enhancing the user experience on ICP.

This is achieved by introducing a set of window events to provide a two-way communication protocol between ICP libraries and injected scripts provided by browser extensions thus enabling users to select their wallet of choice.

## Specification

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in [RFC-2119](https://www.rfc-editor.org/rfc/rfc2119).

### Definitions

Wallet Provider: A user agent that manages keys and facilitates transactions with ICP.

Decentralized Application (DApp): A web page that relies upon one or many Web3 platform APIs which are exposed to the web page via the Wallet.

Provider Discovery Library: A library or piece of software that assists a DApp to interact with the Wallet.


### Provider Info

Each Wallet Provider will be announced with the following interface `ICRC94ProviderInfo`. The values in the `ICRC94ProviderInfo` MUST be included within the `ICRC94ProviderInfo` object. The `ICRC94ProviderInfo` MAY also include extra extensible properties within the object. If a DApp does not recognize the additional properties, it SHOULD ignore them.

- `uuid` - a globally unique identifier the Wallet Provider that MUST be [UUIDv4](https://www.rfc-editor.org/rfc/rfc4122) compliant to uniquely distinguish different ICP provider sessions that have matching properties defined below during the lifetime of the page. The cryptographic uniqueness provided by UUIDv4 guarantees that two independent `ICRC94ProviderInfo` objects can be separately identified.
- `name` - a human-readable local alias of the Wallet Provider to be displayed to the user on the DApp. (e.g. `Example Wallet Extension` or `Awesome Example Wallet`)
- `icon` - a URI pointing to an image. The image SHOULD be a square with 96x96px minimum resolution. See the Images/Icons below for further requirements of this property.
- `rdns` - The Wallet MUST supply the `rdns` property which is intended to be a domain name from the Domain Name System in reverse syntax ordering such as `com.example.subdomain`. It’s up to the Wallet to determine the domain name they wish to use, but it’s generally expected the identifier will remain the same throughout the development of the Wallet. It’s also worth noting that similar to a user agent string in browsers, there are times where the supplied value could be unknown, invalid, incorrect, or attempt to imitate a different Wallet. Therefore, the DApp SHOULD be able to handle these failure cases with minimal degradation to the functionality of the DApp.

```
/**
 * Represents the assets needed to display a wallet
 */
interface ICRC94ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}
```

#### Images/Icons

A URI-encoded image was chosen to enable flexibility for multiple protocols for fetching and rendering icons, for example:

```
# svg (data uri)
data:image/svg+xml,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 32 32"><circle fill="red" cx="16" cy="16" r="12"/></svg>
# png (data uri)
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
```

The `icon` string MUST be a data URI as defined in [RFC-2397](https://www.rfc-editor.org/rfc/rfc2397). The image SHOULD be a square with 96x96px minimum resolution. The image format is RECOMMENDED to be either lossless or vector based such as PNG, WebP or SVG to make the image easy to render on the DApp. Since SVG images can execute Javascript, applications and libraries MUST render SVG images using the `<img>` tag to ensure no untrusted Javascript execution can occur.

#### RDNS

The `rdns` (Reverse-DNS) property serves to provide an identifier which DApps can rely on to be stable between sessions. The Reverse Domain Name Notation is chosen to prevent namespace collisions. The Reverse-DNS convention implies that the value should start with a reversed DNS domain name controlled by the Provider. The domain name should be followed by a subdomain or a product name. Example: `com.example.MyBrowserWallet`.

- The `rdns` value MUST BE a valid [RFC-1034](https://www.rfc-editor.org/rfc/rfc1034) Domain Name;
- The DNS part of the `rdns` value SHOULD BE an active domain controlled by the Provider;
- DApps MAY reject the Providers which do not follow the Reverse-DNS convention correctly;
- DApps SHOULD NOT use the `rdns` value for feature detection as these are self-attested and prone to impersonation or bad incentives without an additional verification mechanism; feature-discovery and verification are both out of scope of this interface specification.

### Window Events

In order to prevent provider collisions, the DApp and the Wallet are expected to emit an event and instantiate an eventListener to discover the various Wallets. This forms an Event concurrency loop.

Since the DApp code and Wallet code aren’t guaranteed to run in a particular order, the events are designed to handle such race conditions.

To emit events, both DApps and Wallets MUST use the `window.postMessage` function to emit events and MUST use the `window.addEventListener` function to observe events. There are two Event interfaces used for the DApp and Wallet to discover each other.

#### Announce and Request Messages

The `ICRC94AnnounceProviderMessage` interface MUST be an object with a `type` property containing a string value of `icrc94:announceProvider` and a `detail` property with an object value of type ICRC94ProviderInfo.

```
// Announce Event dispatched by a Wallet
interface ICRC94AnnounceProviderMessage {
  type: "icrc94:announceProvider";
  detail: ICRC94ProviderInfo;
}
```

The `ICRC94RequestProviderMessage` interface MUST be an object with a type property containing a string value of `icrc94:requestProvider`.

```
// Request Event dispatched by a DApp
interface ICRC94RequestProviderMessage {
  type: "icrc94:requestProvider";
}
```

The Wallet MUST announce the `ICRC94AnnounceProviderMessage` to the DApp via a `window.postMessage()` function call. The Wallet MUST add an EventListener to catch an `ICRC94RequestProviderMessage` dispatched from the DApp. This EventListener MUST use a handler that will re-dispatch an `ICRC94AnnounceProviderMessage`. This re-announcement by the Wallet is useful for when a Wallet’s initial Event announcement may have been delayed or fired before the DApp had initialized its EventListener. This allows the various Wallet Providers to react to the DApp without the need to pollute the window.ic namespace which can produce non-deterministic wallet behavior such as different wallets connecting each time.

The Wallet dispatches the `icrc94:announceProvider` event with immutable contents and listens to the `icrc94:requestProvider` event:

```
let providerInfo: ICRC94ProviderInfo;

const providerAnnoucementMessage = {type: 'icrc94:announceProvider', detail: providerInfo}

// The Wallet posts an announce message which is heard by
// the DApp code that had run earlier
window.postMessage(providerAnnoucementMessage, '*');


// The Wallet listens to the request events which may be
// dispatched later and re-posts the `ICRC94AnnounceProviderMessage`
window.addEventListener('message', (event) => {
  // Validate the origin of the message for security
  if (event.source !== window) {
    return;
  }

  // Check the message type and process the data
  if (event.data.type === 'icrc94:requestProvider') {
    window.postMessage(providerAnnoucementMessage, '*');
  }
});
```

The DApp MUST listen for the `ICRC94AnnounceProviderMessage` from the Wallet via a `window.addEventListener()` method and MUST NOT remove the Event Listener for the lifetime of the page so that the DApp can continue to handle Events beyond the initial page load interaction. The DApp MUST post the `ICRC94RequestProviderMessage` via a `window.postMessage()` function call after the `ICRC94AnnounceProviderMessage` handler has been initialized.

```
// The DApp listens to announced providers
window.addEventListener('message', (event) => {
  // Validate the origin of the message for security
  if (event.source !== window) {
    return;
  }

  // Check the message type and process the data
  if (event.data.type === 'icrc94:announceProvider') {
    const { uuid, name, icon, rdns } = event.data.detail;
    console.log('Received provider uuid:', uuid);
    console.log('Received provider name:', name);
    console.log('Received provider icon:', icon);
    console.log('Received provider rdns:', rdns);
  }
});

// The DApp dispatches a request event which will be heard by 
// Wallets' code that had run earlier
window.postMessage({type: 'icrc94:requestProvider'}, '*');
```

The DApp MAY elect to persist various `ICRC94ProviderInfo` objects contained in the announcement events sent by multiple wallets. Thus, if the user wishes to utilize a different Wallet over time, the user can express this within the DApp’s interface and the DApp can immediately elect to send transactions to that new Wallet. Otherwise, the DApp MAY re-initiate the wallet discovery flow via posting a new `ICRC94RequestProviderMessage`, potentially discovering a different set of wallets.

The described orchestration of events guarantees that the DApp is able to discover the Wallet, regardless of which code executes first, the Wallet code or the DApp code.

## Backwards Compatibility

This ICRC doesn’t require supplanting `window.ic`, so it doesn’t directly break existing applications that cannot update to this method of Wallet discovery. However, it is RECOMMENDED DApps implement this ICRC to ensure discovery of multiple Wallet Providers and SHOULD disable `window.ic` usage except as a fail-over when discovery fails. Similarly, Wallets SHOULD keep compatibility of `window.ic` to ensure backwards compatibility for DApps that have not implemented this ICRC. In order to prevent the previous issues of namespace collisions, it’s also RECOMMENDED that wallets inject their provider object under a wallet specific namespace then proxy the object into the `window.ic` namespace.

## Reference Implementation

### Wallet Provider

Here is a reference implementation for an injected script by a Wallet Provider to support this new interface in parallel with the existing pattern.

```
function onPageLoad() {
  window.ic = provider;

  function announceProvider() {
    const info: ICRC94ProviderInfo = {
      uuid: "350670db-19fa-4704-a166-e52e178b59d2",
      name: "Example Wallet",
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
      rdns: "com.example.wallet"
    };
    const providerAnnoucementMessage = {type: 'icrc94:announceProvider', detail: providerInfo};
    window.postMessage(providerAnnoucementMessage, '*');
  }

  window.addEventListener('message', (event) => {
    // Validate the origin of the message for security
    if (event.source !== window) {
      return;
    }

    // Check the message type and process the data
    if (event.data.type === 'icrc94:requestProvider') {
      announceProvider();
    }
  });

  announceProvider();
}
```

## DApp Implementation

Here is a reference implementation for a DApp to display and track multiple Wallet Providers that are injected by browser extensions.

const providers: ICRC94ProviderInfo[];

function onPageLoad() {

  window.addEventListener('message', (event) => {
    // Validate the origin of the message for security
    if (event.source !== window) {
      return;
    }

    // Check the message type and process the data
    if (event.data.type === 'icrc94:announceProvider') {
      providers.push(event.detail);
    }
  });

  window.postMessage({type: 'icrc94:requestProvider'}, '*');
}