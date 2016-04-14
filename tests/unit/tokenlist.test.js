define(function(require) {
  'use strict';

  var bdd = require('intern!bdd');
  var expect = require('intern/chai!expect');
  var TokenList = require('src/tokenlist');

  bdd.describe('TokenList', function() {

    bdd.it('should be a function', function() {
      expect(TokenList).to.be.a('function');
    });

  });

});
