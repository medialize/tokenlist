
// CommonJS because we're using this only to generate the bundle

var TokenList = require('./tokenlist');
var prollyfill = require('./prollyfill');

TokenList.prollyfill = prollyfill;
TokenList.init = function(context) {
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

// initialize prollyfill
if (typeof window !== 'undefined') {
  TokenList.init(window);
}

module.exports = TokenList;
