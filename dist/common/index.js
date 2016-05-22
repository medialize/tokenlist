'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tokenlist = require('./tokenlist');

var _tokenlist2 = _interopRequireDefault(_tokenlist);

var _prollyfill = require('./prollyfill');

var _prollyfill2 = _interopRequireDefault(_prollyfill);

_tokenlist2['default'].prollyfill = _prollyfill2['default'];

// save current window.ally for noConflict()
var conflicted = typeof window !== 'undefined' && window.TokenList;
_tokenlist2['default'].noConflict = function () {
  if (typeof window !== 'undefined' && window.TokenList === _tokenlist2['default']) {
    window.TokenList = conflicted;
  }

  return _tokenlist2['default'];
};

// initialize prollyfill
if (typeof window !== 'undefined') {
  _tokenlist2['default'].prollyfill(window);
}

exports['default'] = _tokenlist2['default'];
module.exports = exports['default'];
//# sourceMappingURL=index.js.map