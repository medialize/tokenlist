define(['exports', 'module', './tokenlist', './prollyfill'], function (exports, module, _tokenlist, _prollyfill) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _TokenList = _interopRequireDefault(_tokenlist);

  var _prollyfill2 = _interopRequireDefault(_prollyfill);

  _TokenList['default'].prollyfill = _prollyfill2['default'];

  // save current window.ally for noConflict()
  var conflicted = typeof window !== 'undefined' && window.TokenList;
  _TokenList['default'].noConflict = function () {
    if (typeof window !== 'undefined' && window.TokenList === _TokenList['default']) {
      window.TokenList = conflicted;
    }

    return _TokenList['default'];
  };

  // initialize prollyfill
  if (typeof window !== 'undefined') {
    _TokenList['default'].prollyfill(window);
  }

  module.exports = _TokenList['default'];
});
//# sourceMappingURL=index.js.map