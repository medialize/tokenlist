
// CommonJS because we're using this only to generate the bundle

var TokenList = require('./tokenlist');
var polyfill = require('./polyfill');

TokenList.polyfill = polyfill;

module.exports = TokenList;
