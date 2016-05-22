'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = prollyfill;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tokenlist = require('./tokenlist');

var _tokenlist2 = _interopRequireDefault(_tokenlist);

// https://discourse.wicg.io/t/proposal-for-astokenlist-attr/1418/7
function getTokenListFor(attribute) {
  return (0, _tokenlist2['default'])(this.getAttribute.bind(this, attribute), this.setAttribute.bind(this, attribute));
}

// taking the _tokenListFor() idea further to allow access to IDReferenceList
function getReferenceListFor(attribute) {
  var _document = this.ownerDocument;

  return (0, _tokenlist2['default'])(this.getAttribute.bind(this, attribute), this.setAttribute.bind(this, attribute),

  // ignore supported()
  null, function (token) {
    return typeof token === 'string' ? _document.getElementById(token) : token;
  }, function (input) {
    return typeof input === 'string' ? input : input.id;
  });
}

function prollyfill(context) {
  if (!context || !context.document || !context.document.documentElement.appendChild.bind) {
    return;
  }

  // in IE SVGElement does not properly inherit from Element
  ['Element', 'SVGElement'].forEach(function (object) {
    var proto = context[object].prototype;
    if (!proto._tokenListFor) {
      proto._tokenListFor = getTokenListFor;
    }

    if (!proto._referenceListFor) {
      proto._referenceListFor = getReferenceListFor;
    }
  });
}

module.exports = exports['default'];
//# sourceMappingURL=prollyfill.js.map