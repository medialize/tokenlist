define(function(require) {
  'use strict';

  var bdd = require('intern!bdd');
  var expect = require('intern/chai!expect');
  var prollyfill = require('src/prollyfill');

  bdd.describe('Prollyfill', function() {
    var container;
    var references = {};
    var link;
    var svg;

    bdd.before(function() {
      container = document.createElement('div');
      document.body.appendChild(container);

      ['alpha', 'bravo', 'charlie', 'delta'].forEach(function(id) {
        var element = document.createElement('div');
        element.id = id + '-ref';
        container.appendChild(element);
        references[id] = element;
      });
    });

    bdd.after(function() {
      document.body.removeChild(container);
      container = null;
      references = null;
    });

    bdd.beforeEach(function() {
      link = document.createElement('a');
      link.setAttribute('data-tokens', 'alpha bravo charlie');
      link.setAttribute('data-references', 'alpha-ref bravo-ref charlie-ref');

      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('data-tokens', 'alpha bravo charlie');
      svg.setAttribute('data-references', 'alpha-ref bravo-ref charlie-ref');
    });

    bdd.it('should be a function', function() {
      expect(prollyfill).to.be.a('function');
    });

    function makeListTests(element) {
      return function() {
        bdd.it('should provide _tokenListFor', function() {
          expect(element()._tokenListFor).to.be.a('function', 'element._tokenListFor');

          var list = element()._tokenListFor('data-tokens');
          expect(list.contains('alpha')).to.equal(true, 'tokenlist.contains()');

          list.add('delta');
          expect(element().getAttribute('data-tokens')).to.equal('alpha bravo charlie delta', 'tokenlist.add()');
        });

        bdd.it('should provide _referenceListFor', function() {
          expect(element()._referenceListFor).to.be.a('function', 'element._referenceListFor');

          var list = element()._referenceListFor('data-references');
          expect(list.contains(references.alpha)).to.equal(true, 'tokenlist.contains()');

          list.add(references.delta);
          expect(element().getAttribute('data-references')).to.equal('alpha-ref bravo-ref charlie-ref delta-ref', 'tokenlist.add()');
        });
      };
    }

    bdd.describe('for HTMLElement', makeListTests(function() {
      return link;
    }));

    bdd.describe('for SVGElement', makeListTests(function() {
      return svg;
    }));
  });
});
