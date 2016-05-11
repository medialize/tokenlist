/*
  Implements the DOMTokenList interface
    https://dom.spec.whatwg.org/#interface-domtokenlist

  Inspired by
    https://github.com/bkardell/tokenListFor/blob/master/_tokenListFor.js
    https://github.com/jwilsson/domtokenlist/blob/master/src/DOMTokenList.js
*/
(function (root, factory) {
  'use strict';

  if (typeof exports === 'object') {
    // Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    root.TokenList = factory();
  }
}(this, function() {
  'use strict';
  /*global Symbol, Proxy */

  // https://encoding.spec.whatwg.org/#ascii-whitespace
  // TAB, VT, FF, CR, Space
  var asciiWhiteSpace = /[\u0009\u000A\u000C\u000D\u0020]+/;

  function verifyToken(token) {
    // NOTE: throwing Error instead of DOMException because the latter
    // doesn't work properly across browsers, let alone Node.

    if (token === '') {
      // https://heycam.github.io/webidl/#syntaxerror
      // throw new DOMException('Token must not be the empty string', 'SyntaxError', 12);
      throw new Error('Token must not be the empty string');
    }

    if (asciiWhiteSpace.test(token)) {
      // https://heycam.github.io/webidl/#invalidcharactererror
      // throw new _DOMException('Token must not contain ASCII whitespace', 'InvalidCharacterError', 5);
      throw new Error('Token must not contain ASCII whitespace');
    }
  }

  function passthru(value) {
    return value;
  }

  // https://dom.spec.whatwg.org/#concept-ordered-set-parser
  function parse(text) {
    text = text && text.trim() || '';
    if (!text) {
      return [];
    }

    var lookup = {};
    return text.split(asciiWhiteSpace).filter(function(token) {
      if (lookup[token]) {
        return false;
      }

      lookup[token] = true;
      return true;
    });
  }

  // https://dom.spec.whatwg.org/#concept-ordered-set-serializer
  function serialize(tokens) {
    return tokens.join(' ');
  }

  function removeFromArray(list, item) {
    var index = list.indexOf(item);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  return function(read, write, supported, decode, encode) {

    // noop in case we're able to use Proxy,
    // overwritten at the end of the file if not.
    var updateGetterProxy = function(){};

    var getTokens = function() {
      var tokens = parse(read());
      updateGetterProxy(tokens.length);
      return tokens;
    };

    var setTokens = function(tokens) {
      write(serialize(tokens));
    };

    var stringify = function() {
      // currently specifed as `return read()` but about to change back
      // see https://github.com/whatwg/dom/issues/105
      return serialize(getTokens());
    };

    if (!decode) {
      decode = passthru;
    }

    if (!encode) {
      encode = passthru;
    }

    var TokenList = {
      // https://dom.spec.whatwg.org/#dom-domtokenlist-stringifier
      toString: stringify,

      // https://dom.spec.whatwg.org/#dom-domtokenlist-item
      item: function(index) {
        // NOTE: unspecified behavior, but implemented in Gecko and Blink
        index = parseInt(index);
        if (isNaN(index)) {
          index = 0;
        }

        return decode(getTokens()[index] || null);
      },

      // https://dom.spec.whatwg.org/#dom-domtokenlist-contains
      contains: function(token) {
        // NOTE: unspecified behavior, but implemented in Gecko and Blink
        verifyToken(token);

        return getTokens().indexOf(encode(token)) !== -1;
      },

      // https://dom.spec.whatwg.org/#dom-domtokenlist-add
      add: function() {
        var input = [].map.call(arguments, encode);
        input.forEach(verifyToken);

        var tokens = getTokens();
        var length = tokens.length;

        input.forEach(function(token) {
          if (tokens.indexOf(token) === -1) {
            tokens.push(token);
          }
        });

        if (tokens.length !== length) {
          setTokens(tokens);
        }
      },

      // https://dom.spec.whatwg.org/#dom-domtokenlist-remove
      remove: function() {
        var input = [].map.call(arguments, encode);
        input.forEach(verifyToken);

        var tokens = getTokens();
        var length = tokens.length;
        input.forEach(function(token) {
          removeFromArray(tokens, token);
        });

        if (tokens.length !== length) {
          setTokens(tokens);
        }
      },

      // https://dom.spec.whatwg.org/#dom-domtokenlist-toggle
      toggle: function(token, force) {
        token = encode(token);
        verifyToken(token);

        var tokens = getTokens();
        var exists = tokens.indexOf(token) !== -1;

        if (exists) {
          if (!force) {
            removeFromArray(tokens, token);
            setTokens(tokens);
            return false;
          }

          // forced add of existing token
          return true;
        }

        if (force === false) {
          // forced removal of non-existing token
          return false;
        }

        // add of non-existing token
        tokens.push(token);
        setTokens(tokens);
        return true;
      },

      // https://dom.spec.whatwg.org/#dom-domtokenlist-replace
      // Note: will collapse duplicates, i.e. replace("a", "x")
      // will turn "c a b a a d" into "c x b d",
      replace: function(oldToken, newToken) {
        oldToken = encode(oldToken);
        newToken = encode(newToken);

        verifyToken(oldToken);
        verifyToken(newToken);

        var tokens = getTokens();
        var index = tokens.indexOf(oldToken);

        if (index === -1) {
          return;
        }

        tokens[index] = newToken;
        setTokens(tokens);
      },

      // https://dom.spec.whatwg.org/#dom-domtokenlist-supports
      // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/supports
      supports: function(token) {
        token = encode(token);

        if (supported) {
          return Boolean(supported(token.toLowerCase()));
        }

        throw new TypeError('No supported tokens defined');
      },
    };

    Object.defineProperties(TokenList, {
      // https://dom.spec.whatwg.org/#dom-domtokenlist-length
      length: {
        get: function() {
          return getTokens().length;
        },
      },

      // https://dom.spec.whatwg.org/#dom-domtokenlist-value
      value: {
        get: stringify,
        set: function(value) {
          setTokens(parse(value));
        },
      },
    });

    // iterable<DOMString> https://dom.spec.whatwg.org/#interface-domtokenlist
    var _iterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
    TokenList[_iterator] = function() {
      var tokens = getTokens();
      var index = 0;

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
      return {
        next: function() {
          return index < tokens.length
            ? { value: tokens[index++], done: false }
            : { value: undefined, done: true };
        },
      };
    };

    if (typeof Proxy !== 'undefined') {
      var numericPattern = /^\d+$/;
      return new Proxy(TokenList, {
        get: function(target, property) {
          var value = target[property];
          if (value !== undefined) {
            return value;
          }

          if (!numericPattern.test(property)) {
            return undefined;
          }

          return TokenList.item(property) || undefined;
        },
      });
    } else {
      // https://github.com/Alhadis/DOMTokenList/blob/v1.0.0/src/token-list.js#L69-L81
      var registeredGetters = 0;
      var proxyItem = function(key) {
        Object.defineProperty(TokenList, key, {
          configurable: false,
          get: function() {
            return TokenList.item(key) || undefined;
          },
        });
      };

      updateGetterProxy = function(length) {
        for (; registeredGetters <= length; registeredGetters++) {
          proxyItem(registeredGetters);
        }
      };

      TokenList.item(0);
    }

    return TokenList;
  };
}));
