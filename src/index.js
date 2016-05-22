
import TokenList from './tokenlist';
import prollyfill from './prollyfill';

TokenList.prollyfill = prollyfill;

// save current window.ally for noConflict()
const conflicted = typeof window !== 'undefined' && window.TokenList;
TokenList.noConflict = function() {
  if (typeof window !== 'undefined' && window.TokenList === TokenList) {
    window.TokenList = conflicted;
  }

  return TokenList;
};

// initialize prollyfill
if (typeof window !== 'undefined') {
  TokenList.prollyfill(window);
}

export default TokenList;
