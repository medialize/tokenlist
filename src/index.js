
// CommonJS because we're using this only to generate the bundle

var TokenList = require('./tokenlist');
var polyfill = require('./polyfill');
var prollyfill = require('./prollyfill');

TokenList.polyfill = polyfill;
TokenList.prollyfill = prollyfill;

module.exports = TokenList;
