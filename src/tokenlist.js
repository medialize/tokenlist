/*
  Implements the DOMTokenList interface
    https://dom.spec.whatwg.org/#interface-domtokenlist

  Inspired by
    https://github.com/bkardell/tokenListFor/blob/master/_tokenListFor.js
    https://github.com/jwilsson/domtokenlist/blob/master/src/DOMTokenList.js
*/
/*global Symbol, Proxy */

// https://encoding.spec.whatwg.org/#ascii-whitespace
// TAB, VT, FF, CR, Space
const asciiWhiteSpace = /[\u0009\u000A\u000C\u000D\u0020]+/;

// expression to verify a text is representing an integer
const numericPattern = /^\d+$/;

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

// dummy to compensate for missing encode/decode functions
function passthru(value) {
  return value;
}

function uniqueArray(list) {
  const lookup = {};
  return list.filter(function(token) {
    if (lookup[token]) {
      return false;
    }

    lookup[token] = true;
    return true;
  });
}

// https://dom.spec.whatwg.org/#concept-ordered-set-parser
function parse(text) {
  text = text && text.trim() || '';
  if (!text) {
    return [];
  }

  const tokens = text.split(asciiWhiteSpace);
  return uniqueArray(tokens);
}

// https://dom.spec.whatwg.org/#concept-ordered-set-serializer
function serialize(tokens) {
  return tokens.join(' ');
}

function removeFromArray(list, item) {
  const index = list.indexOf(item);
  if (index !== -1) {
    list.splice(index, 1);
  }
}

function addToArray(list, item) {
  if (list.indexOf(item) === -1) {
    list.push(item);
  }
}

export default function TokenList(read, write, supported, decode, encode) {
  // noop in case we're able to use Proxy,
  // overwritten at the end of the file if not.
  let updateGetterProxy = function(){};

  const getTokens = function() {
    // obtain serialized tokens from source
    const text = read();
    // convert to list of unique tokens
    const tokens = parse(text);
    // update list[index] accessory where Proxy isn't available
    updateGetterProxy(tokens.length);
    return tokens;
  };

  const setTokens = function(tokens) {
    // convert list of tokens to text
    const text = serialize(tokens);
    // save to source
    write(text);
  };

  const stringify = function() {
    // currently specifed as `return read()` but about to change back
    // see https://github.com/whatwg/dom/issues/105
    const tokens = getTokens();
    return serialize(tokens);
  };

  if (!decode) {
    decode = passthru;
  }

  if (!encode) {
    encode = passthru;
  }

  const tokenlist = {
    // https://dom.spec.whatwg.org/#dom-domtokenlist-stringifier
    toString: stringify,

    // https://dom.spec.whatwg.org/#dom-domtokenlist-item
    item: function(index) {
      // NOTE: unspecified behavior, but implemented in Gecko and Blink
      index = parseInt(index);
      if (isNaN(index)) {
        index = 0;
      }

      const token = getTokens()[index] || null;
      return decode(token);
    },

    // https://dom.spec.whatwg.org/#dom-domtokenlist-contains
    contains: function(token) {
      token = encode(token);
      // NOTE: unspecified behavior, but implemented in Gecko and Blink
      verifyToken(token);

      return getTokens().indexOf(token) !== -1;
    },

    // https://dom.spec.whatwg.org/#dom-domtokenlist-add
    add: function(...input) {
      input = input.map(encode);
      input.forEach(verifyToken);

      const tokens = getTokens();
      const length = tokens.length;

      input.forEach(function(token) {
        addToArray(tokens, token);
      });

      if (tokens.length !== length) {
        setTokens(tokens);
      }
    },

    // https://dom.spec.whatwg.org/#dom-domtokenlist-remove
    remove: function(...input) {
      input = input.map(encode);
      input.forEach(verifyToken);

      const tokens = getTokens();
      const length = tokens.length;
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

      const tokens = getTokens();
      const exists = tokens.indexOf(token) !== -1;

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
      addToArray(tokens, token);
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

      const tokens = getTokens();
      const index = tokens.indexOf(oldToken);

      if (index === -1) {
        // token to replace does not exist
        return;
      }

      tokens[index] = newToken;
      setTokens(tokens);
    },

    // https://dom.spec.whatwg.org/#dom-domtokenlist-supports
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/supports
    supports: function(token) {
      if (!supported) {
        throw new TypeError('No supported tokens defined');
      }

      token = (encode(token) || '').toLowerCase();
      const isSupported = supported(token);
      return Boolean(isSupported);
    },
  };

  Object.defineProperties(tokenlist, {
    // https://dom.spec.whatwg.org/#dom-domtokenlist-length
    length: {
      get: () => getTokens().length,
    },

    // https://dom.spec.whatwg.org/#dom-domtokenlist-value
    value: {
      get: stringify,
      set: function(value) {
        const tokens = parse(value);
        setTokens(tokens);
      },
    },
  });

  // iterable<DOMString> https://dom.spec.whatwg.org/#interface-domtokenlist
  const _iterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
  tokenlist[_iterator] = function() {
    const tokens = getTokens();
    let index = 0;

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
    return new Proxy(tokenlist, {
      get: function(target, property) {
        const value = target[property];
        if (value !== undefined) {
          return value;
        }

        if (!numericPattern.test(property)) {
          return undefined;
        }

        return tokenlist.item(property) || undefined;
      },
    });
  } else {
    // https://github.com/Alhadis/DOMTokenList/blob/v1.0.0/src/token-list.js#L69-L81
    let registeredGetters = 0;
    const proxyItem = function(key) {
      Object.defineProperty(tokenlist, key, {
        configurable: false,
        get: () => tokenlist.item(key) || undefined,
      });
    };

    updateGetterProxy = function(length) {
      for (; registeredGetters <= length; registeredGetters++) {
        proxyItem(registeredGetters);
      }
    };

    tokenlist.item(0);
  }

  return tokenlist;
}
