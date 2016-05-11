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

  // https://discourse.wicg.io/t/proposal-for-astokenlist-attr/1418/7
  function getTokenListFor(attribute) {
    return TokenList(
      this.getAttribute.bind(this, attribute),
      this.setAttribute.bind(this, attribute)
    );
  }

  // taking the _tokenListFor() idea further to allow access to IDReferenceList
  function getReferenceListFor(attribute) {
    var _document = this.ownerDocument;

    return TokenList(
      this.getAttribute.bind(this, attribute),
      this.setAttribute.bind(this, attribute),

      // ignore supported()
      null,

      function(token) { return typeof token === 'string' ? _document.getElementById(token) : token; },
      function(input) { return typeof input === 'string' ? input : input.id; }
    );
  }

  function prollyfill(context) {
    if (!context || !context.document || !context.document.documentElement.appendChild.bind) {
      return;
    }

    // in IE SVGElement does not properly inherit from Element
    ['Element', 'SVGElement'].forEach(function(object) {
      var proto = context[object].prototype;
      if (!proto._tokenListFor) {
        proto._tokenListFor = getTokenListFor;
      }

      if (!proto._referenceListFor) {
        proto._referenceListFor = getReferenceListFor;
      }
    });
  }

  // in case we need to apply this to an iframe
  return prollyfill;
}));