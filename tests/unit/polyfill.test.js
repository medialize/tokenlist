define(function(require) {
  'use strict';

  var bdd = require('intern!bdd');
  var expect = require('intern/chai!expect');
  var polyfill = require('src/polyfill');

  bdd.describe('Polyfill', function() {
    var link;
    var svg;

    bdd.beforeEach(function() {
      link = document.createElement('a');
      link.setAttribute('class', 'alpha bravo charlie');
      link.setAttribute('rel', 'alpha bravo charlie');

      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'alpha bravo charlie');
    });

    bdd.it('should be a function', function() {
      expect(polyfill).to.be.a('function');
    });

    function makeClassListTests(element, property, attribute) {
      return function() {
        // https://dom.spec.whatwg.org/#dom-domtokenlist-stringifier
        bdd.describe('for method toString()', function() {
          bdd.it('should return the value of the "class" attribute verbatim', function() {
            var list = element()[property];
            expect(list.toString()).to.equal('alpha bravo charlie');
          });
        });

        // https://dom.spec.whatwg.org/#dom-domtokenlist-item
        bdd.describe('for method item()', function() {
          bdd.it('should return the token at given index', function() {
            var list = element()[property];
            expect(list.item(0)).to.equal('alpha', 'first item');
            expect(list.item(2)).to.equal('charlie', 'last item');
            expect(list.item(3)).to.equal(null, 'unknown item');
          });

          bdd.it('should convert non-numeric index', function() {
            var list = element()[property];
            // NOTE: unspecified behavior, but implemented in Gecko and Blink
            expect(list.item(-1)).to.equal(null, 'negative index');
            expect(list.item(0.5)).to.equal('alpha', 'decimal index');
            expect(list.item('string')).to.equal('alpha', 'string index');
          });
        });

        // https://dom.spec.whatwg.org/#dom-domtokenlist-contains
        bdd.describe('for method contains()', function() {
          bdd.it('should return true for known tokens', function() {
            var list = element()[property];
            expect(list.contains('bravo')).to.equal(true);
          });

          bdd.it('should return false for unknown tokens', function() {
            var list = element()[property];
            expect(list.contains('gustav')).to.equal(false);
          });
        });

        // https://dom.spec.whatwg.org/#dom-domtokenlist-add
        bdd.describe('for method add()', function() {
          bdd.it('should add single token', function() {
            var list = element()[property];
            list.add('delta');
            expect(element().getAttribute(attribute)).to.equal('alpha bravo charlie delta');
          });

          bdd.it('should add multiple tokens', function() {
            var list = element()[property];
            list.add('delta', 'echo');
            expect(element().getAttribute(attribute)).to.equal('alpha bravo charlie delta echo');
          });

          bdd.it('should not add duplicate tokens', function() {
            var list = element()[property];
            list.add('alpha');
            expect(element().getAttribute(attribute)).to.equal('alpha bravo charlie');
          });

          bdd.it('should not modify the attribute for invalid tokens', function() {
            var list = element()[property];
            expect(function() {
              list.add('delta', '', 'alpha');
            }).to.throw();

            expect(element().getAttribute(attribute)).to.equal('alpha bravo charlie');
          });
        });

        // https://dom.spec.whatwg.org/#dom-domtokenlist-remove
        bdd.describe('for method remove()', function() {
          bdd.it('should remove single token', function() {
            var list = element()[property];
            list.remove('bravo');
            expect(element().getAttribute(attribute)).to.equal('alpha charlie');
          });

          bdd.it('should remove multiple tokens', function() {
            var list = element()[property];

            list.remove('alpha', 'bravo');
            expect(element().getAttribute(attribute)).to.equal('charlie');
          });

          bdd.it('should not modify the attribute for invalid tokens', function() {
            var list = element()[property];

            expect(function() {
              list.remove('alpha', '', 'delta');
            }).to.throw();

            expect(element().getAttribute(attribute)).to.equal('alpha bravo charlie');
          });
        });

        // https://dom.spec.whatwg.org/#dom-domtokenlist-toggle
        bdd.describe('for method toggle()', function() {
          bdd.it('should remove existing token', function() {
            var list = element()[property];
            var returned = list.toggle('bravo');
            expect(returned).to.equal(false, 'returned');
            expect(element().getAttribute(attribute)).to.equal('alpha charlie', 'serialized');
          });

          bdd.it('should remove existing duplicate tokens', function() {
            var list = element()[property];
            var returned = list.toggle('alpha');
            expect(returned).to.equal(false, 'returned');
            expect(element().getAttribute(attribute)).to.equal('bravo charlie', 'serialized');
          });

          bdd.it('should add missing token', function() {
            var list = element()[property];

            var returned = list.toggle('delta');
            expect(returned).to.equal(true, 'returned');
            expect(element().getAttribute(attribute)).to.equal('alpha bravo charlie delta', 'serialized');
          });

          bdd.describe('with force flag', function() {
            bdd.it('should not add existing token', function() {
              var list = element()[property];
              var returned = list.toggle('alpha', true);
              expect(returned).to.equal(true, 'returned');
              expect(element().getAttribute(attribute)).to.equal('alpha bravo charlie', 'serialized');
            });

            bdd.it('should add missing token', function() {
              var list = element()[property];
              var returned = list.toggle('delta', true);
              expect(returned).to.equal(true, 'returned');
              expect(element().getAttribute(attribute)).to.equal('alpha bravo charlie delta', 'serialized');
            });

            bdd.it('should not remove missing token', function() {
              var list = element()[property];
              var returned = list.toggle('delta', false);
              expect(returned).to.equal(false, 'returned');
              expect(element().getAttribute(attribute)).to.equal('alpha bravo charlie', 'serialized');
            });

            bdd.it('should remove existing token', function() {
              var list = element()[property];
              var returned = list.toggle('alpha', false);
              expect(returned).to.equal(false, 'returned');
              expect(element().getAttribute(attribute)).to.equal('bravo charlie', 'serialized');
            });
          });
        });

        // https://dom.spec.whatwg.org/#dom-domtokenlist-replace
        bdd.describe('for method replace()', function() {
          bdd.it('should replace existing token', function() {
            var list = element()[property];
            list.replace('alpha', 'zulu');
            expect(element().getAttribute(attribute)).to.equal('zulu bravo charlie');
          });

          bdd.it('should ignore missing token', function() {
            var list = element()[property];
            list.replace('delta', 'zulu');
            expect(element().getAttribute(attribute)).to.equal('alpha bravo charlie');
          });
        });

        // https://dom.spec.whatwg.org/#dom-domtokenlist-supports
        bdd.describe('for method supports()', function() {
          bdd.it('should throw an error', function() {
            var list = element()[property];

            expect(function() {
              list.supports('alpha');
            }).to.throw(Error);
          });
        });

        // https://dom.spec.whatwg.org/#dom-domtokenlist-length
        bdd.describe('for property length', function() {
          bdd.it('should return the number of tokens', function() {
            var list = element()[property];
            expect(list.length).to.equal(3);
          });

          bdd.it('should return the correct number of tokens for unicode spaces', function() {
            var list = element()[property];

            var tokens = 'alpha  bra\u00A0vo char\u2001lie delta \u2009 echo';
            element().setAttribute(attribute, tokens);
            expect(list.length).to.equal(6);
          });
        });

        // https://dom.spec.whatwg.org/#dom-domtokenlist-value
        bdd.describe('for property value', function() {
          bdd.it('should return the value of the "class" attribute verbatim', function() {
            var list = element()[property];

            if (!element()[property].value) {
              this.skip('Not implemented in this browser');
            }

            expect(list.value).to.equal('alpha bravo charlie');
          });

          bdd.it('should set the value of the "class" attribute verbatim', function() {
            var list = element()[property];

            if (!list.value) {
              this.skip('Not implemented in this browser');
            }

            list.value = 'delta  alpha';
            expect(element().getAttribute(attribute)).to.equal('delta alpha');
          });
        });
      };
    }

    bdd.describe('for HTMLElement classList', makeClassListTests(function() {
      return link;
    }, 'classList', 'class'));

    bdd.describe('for SVGElement classList', makeClassListTests(function() {
      return svg;
    }, 'classList', 'class'));

    bdd.describe('for HTMLAnchorElement relList', makeClassListTests(function() {
      return link;
    }, 'relList', 'rel'));
  });
});
