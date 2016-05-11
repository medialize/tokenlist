
// CommonJS because we're using this only to generate the bundle

var TokenList = require('./tokenlist');
var polyfill = require('./polyfill');
var prollyfill = require('./prollyfill');

TokenList.polyfill = polyfill;
TokenList.prollyfill = prollyfill;
TokenList.init = function(context) {
  polyfill(context);
  prollyfill(context);
};

// save current window.ally for noConflict()
var conflicted = typeof window !== 'undefined' && window.TokenList;
TokenList.noConflict = function() {
  if (typeof window !== 'undefined' && window.TokenList === this) {
    window.TokenList = conflicted;
  }

  return this;
};

// initialize polyfill and prollyfill
if (typeof window !== 'undefined') {
  TokenList.init(window);
}

module.exports = TokenList;
