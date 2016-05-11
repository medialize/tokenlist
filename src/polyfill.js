(function (factory) {
  if (typeof exports === 'object') {
    // Node
    module.exports = factory(require('./tokenlist'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['./tokenlist'], function(TokenList) {
      return factory(TokenList);
    });
  } else if (typeof self !== 'undefined') {
    // Browser globals
    factory(self.TokenList);
  }
}(function(TokenList) {
  'use strict';

  function tokenListForElementAttribute(element, attribute) {
    return TokenList(
      element.getAttribute.bind(element, attribute),
      element.setAttribute.bind(element, attribute)
    );
  }

  function getClassList() {
    return tokenListForElementAttribute(this, 'class');
  }

  function getRelList() {
    return tokenListForElementAttribute(this, 'rel');
  }

  function makeArgumentsIterator(callback) {
    return function() {
      var args = [].slice.call(arguments, 0);

      // make sure all arguments are syntactically correct
      args.forEach(function(arg) {
        this.contains(arg);
      }, this);

      // only then apply the callback to every argument
      args.forEach(function(arg) {
        callback.call(this, arg);
      }, this);
    };
  }

  function polyfill(context) {
    if (!context || !context.document || !context.document.documentElement.appendChild.bind) {
      return;
    }

    var link = context.document.createElement('a');
    var hasClassList = 'classList' in link;
    var hasRelList = 'relList' in link;

    if (!hasClassList) {
      // https://github.com/jwilsson/domtokenlist/blob/master/src/classList.js
      Object.defineProperty(context.Element.prototype, 'classList', {
        get: getClassList,
      });
    }

    var svg = context.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var hasSvgClassList = 'classList' in svg;
    if (!hasSvgClassList) {
      // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/1173756/
      Object.defineProperty(context.SVGElement.prototype, 'classList', {
        get: getClassList,
      });
    }

    // https://github.com/jwilsson/domtokenlist/blob/master/src/relList.js
    if (!hasRelList) {
      ['HTMLAnchorElement', 'HTMLAreaElement', 'HTMLLinkElement'].forEach(function(object) {
        Object.defineProperty(context[object].prototype, 'relList', {
          get: getRelList,
        });
      });
    }

    if (!hasClassList) {
      // we're already returning TokenList, so there's no need to patch DOMTokenList
      return;
    }

    var prototype = context.DOMTokenList.prototype;

    // Older versions of the HTMLElement.classList spec didn't allow multiple arguments
    // https://github.com/jwilsson/domtokenlist/blob/master/src/DOMTokenList-newest.js
    // https://connect.microsoft.com/IE/Feedback/Details/920755/
    link.classList.add('a', 'b');
    if (!link.classList.contains('b')) {
      prototype.add = makeArgumentsIterator(prototype.add);
      prototype.remove = makeArgumentsIterator(prototype.remove);
    }

    // Older versions of the spec didn't know the force argument
    // https://github.com/jwilsson/domtokenlist/blob/master/src/DOMTokenList-newest.js
    // https://connect.microsoft.com/IE/Feedback/details/878564/
    if (!link.classList.toggle('a', true)) {
      prototype.toggle = function (token, force) {
        var contained = this.contains(token);
        if (force === false || contained && force !== true) {
          this.remove(token);
          return false;
        }

        this.add(token);
        return true;
      };
    }

    // Older versions of the spec didn't know the replace() method
    // https://bugs.chromium.org/p/chromium/issues/detail?id=580339
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1224186
    if (!link.classList.replace) {
      prototype.replace = function(oldToken, newToken) {
        // verfiy token integrity before changing anything
        var contained = this.contains(oldToken);
        this.contains(newToken);

        if (!contained) {
          return;
        }

        // find first occurrence of oldToken so we know
        // where to inject newToken later
        var index = 0;
        while (this.item(index) !== oldToken) {
          index++;
        }

        // remove all occurrences of oldToken, there may be multiple
        this.remove(oldToken);
        // inject the newToken at the previously identified position
        var tokens = [].slice.call(this, 0, this.length);
        tokens.splice(index, 0, newToken);
        // since we can't reset the internal array,
        // removing and setting all tokens will have to do
        this.remove.apply(this, tokens);
        this.add.apply(this, tokens);
      };
    }

    // NOTE: can't polyfill the value property, as we don't have
    // a reference to the original element in order to set the
    // attribute's value verbatim, as required by the spec
  }

  // in case we need to apply this to an iframe
  return polyfill;
}));
