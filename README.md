# TokenList.js

This module is an implementation of the [DOMTokenList Interface](https://dom.spec.whatwg.org/#interface-domtokenlist) based on  [jwilsson/domtokenlist](https://github.com/jwilsson/domtokenlist) and [bkardell/tokenListFor](https://github.com/bkardell/tokenListFor).

This module was created to optimize Brian's initial implementation and investigate further application for DOMTokenList (as Brian's tokenListFor does).

## The TokenList interface

The [DOMTokenList interface](https://dom.spec.whatwg.org/#interface-domtokenlist) does not specify any constructors. This implementation accepts callback functions to read and write tokens, thereby decoupling itself from the DOM:

```js
var element = document.body;

var classList = TokenList(
  // callback used to read the current serialized presentation of the DOMTokenList
  function readString() { return element.getAttribute('class'); },
  // callback used to store the modified serialized presentation of the DOMTokenList
  function writeString(value) { element.setAttribute('class', value); }
);

classList.add('gustav');
classList.contains('gustav') === true;
classList.remove('gustav');
```

### Supported tokens

Some DOMTokenLists may know the accepted ("supported") tokens, which can be provided to TokenList via an optional callback, as shown here for the [`<iframe>`'s sandbox attribute](https://developer.mozilla.org/en/docs/Web/HTML/Element/iframe#attr-sandbox):

```js
var element = document.getElementById('iframe');

var sandboxValues = [
  'allow-modals',
  'allow-orientation-lock',
  'allow-pointer-lock',
  'allow-popups', that functionality will silently fail.
  'allow-popups-to-escape-sandbox',
  'allow-same-origin',
  'allow-scripts',
  'allow-top-navigation',
];

var sandboxList = TokenList(
  // callback used to read the current serialized presentation of the DOMTokenList
  function readString() { return element.getAttribute('sandbox'); },
  // callback used to store the modified serialized presentation of the DOMTokenList
  function writeString(value) { element.setAttribute('sandbox', value); },

  // [optional] callback to verify if a token is to be considered supported
  // defaults to null, causing TokenList#supported() to throw an appropriate error
  function supported(token) { return sandboxValues.indexOf(token) !== -1; }
);

sandboxList.add('allow-modals');
sandboxList.contains('allow-modals') === true;
sandboxList.remove('allow-modals');

sandboxList.supports('allow-modals') == true;
sandboxList.supports('not-supported-token-value') === false;

// NOTE: unsupported values are still added to the list
sandboxList.add('not-supported-token-value');
```

### Encoded token values

As tokens may represent entities, their values can be encoded and decoded via optional callbacks, as shown here for the [aria-labelledby attribute](http://w3c.github.io/aria/aria/aria.html#aria-labelledby):

```js
var element = document.getElementById('target');

var labelledByList = TokenList(
  // callback used to read the current serialized presentation of the DOMTokenList
  function readString() { return element.getAttribute('aria-labelledby'); },
  // callback used to store the modified serialized presentation of the DOMTokenList
  function writeString(value) { element.setAttribute('aria-labelledby', value); },

  // ignore supported()
  null,

  // [optional] callback used to decode a token (string) to another object
  function decode(token) { return token ? document.getElementById(token) : null; },
  // [optional] callback used to encode an object to a string token
  function encode(input) { return input ? input.id : null; }
);

var label = document.getElementById('label');
labelledByList.add(label);
labelledByList.contains(label) === true;
labelledByList.remove(label);
```

## The prollyfill

Based on [WICG tokenListFor() proposal](https://discourse.wicg.io/t/proposal-for-astokenlist-attr/1418/20) this package provides `Element.prototype._tokenListFor()` and `Element.prototype._referenceListFor()`.

```js
var element = document.body;

// standard way to obtain the classList:
var tokenlist = element.classList
tokenlist.contains('some-class');

// prollyfill way to option the classlist:
var tokenlist = element._tokenListFor('class');
tokenlist.contains('some-class');

// resolving ID-References
var labels = element._referenceListFor('aria-labelledby');
labels.contains(document.getElementById('some-label'));
```

## Other implementations

* [jwilsson/domtokenlist](https://github.com/jwilsson/domtokenlist) is a polyfill for `classList` and `relList` also works for SVG. Works with browser globals.
* [Alhadis/DOMTokenList](https://github.com/Alhadis/DOMTokenList) is a polyfill for `classList` and `relList` also works for SVG and supports "live collections". Does not include unit tests. Does not expose DOMTokenList implementation for other applications. Uses deprecated [`DOMAttrModified`](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events) on SVG polyfill. Trips over unicode whitespace. Weird choice of code style.
* [necolas/dom-shims](https://github.com/necolas/dom-shims) specifically [Element.classList.js](https://github.com/necolas/dom-shims/blob/master/shim/Element.classList.js) and [DomTokenList.js](https://github.com/necolas/dom-shims/blob/master/lib/DOMTokenList.js). CommonJS module. Trips over unicode whitespace.
* [bkardell/tokenListFor](https://github.com/bkardell/tokenListFor) is an implementation for the [WICG tokenListFor() proposal](https://discourse.wicg.io/t/proposal-for-astokenlist-attr/1418/20). Does not include unit tests. Trips over unicode whitespace.


## License

TokenList.js is published under the [MIT License](http://opensource.org/licenses/mit-license).
