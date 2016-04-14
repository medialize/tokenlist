# TokenList.js

This module is an implementation of the [DOMTokenList Interface](https://dom.spec.whatwg.org/#interface-domtokenlist) based on [jwilsson/domtokenlist](https://github.com/jwilsson/domtokenlist) and [bkardell/tokenListFor](https://github.com/bkardell/tokenListFor).

This module was created to investigate further application for DOMTokenList (as Brian's tokenListFor does), while simultaneously serving as a polyfill for [`classList`](https://developer.mozilla.org/en/docs/Web/API/Element/classList) and [`relList`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLinkElement/relList).


## Other implementations

* [jwilsson/domtokenlist](https://github.com/jwilsson/domtokenlist) is a polyfill for `classList` and `relList` also works for SVG.
* [Alhadis/DOMTokenList](https://github.com/Alhadis/DOMTokenList) is a polyfill for `classList` and `relList` also works for SVG and supports "live collections". Does not include unit tests.
* [necolas/dom-shims]() specifically [Element.classList.js](https://github.com/necolas/dom-shims/blob/master/shim/Element.classList.js) and [DomTokenList.js](https://github.com/necolas/dom-shims/blob/master/lib/DOMTokenList.js)
* [bkardell/tokenListFor](https://github.com/bkardell/tokenListFor) is an implementation for the [WICG tokenListFor() proposal](https://discourse.wicg.io/t/proposal-for-astokenlist-attr/1418/20). Does not include unit tests.


## License

TokenList.js is published under the [MIT License](http://opensource.org/licenses/mit-license).
