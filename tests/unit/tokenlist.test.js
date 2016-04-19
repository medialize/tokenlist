define(function(require) {
  'use strict';
  /*global Symbol */

  var bdd = require('intern!bdd');
  var expect = require('intern/chai!expect');
  var TokenList = require('src/tokenlist');

  bdd.describe('TokenList', function() {
    var result = null;
    var data = {
      undefined: {
        tokens: [],
        value: undefined,
        serialized: '',
      },
      null: {
        tokens: [],
        value: null,
        serialized: '',
      },
      empty: {
        tokens: [],
        value: '',
        serialized: '',
      },
      whitespace: {
        tokens: [],
        value: '  ',
        serialized: '',
      },
      single: {
        tokens: ['alpha'],
        value: 'alpha',
        serialized: 'alpha',
      },
      multiple: {
        tokens: ['alpha', 'bravo', 'charlie'],
        value: 'alpha bravo charlie',
        serialized: 'alpha bravo charlie',
      },
      duplicate: {
        tokens: ['alpha', 'bravo', 'charlie'],
        value: 'alpha bravo alpha charlie alpha',
        serialized: 'alpha bravo charlie',
      },
      spaces: {
        // NO-BREAK-SPACE in "bravo"
        // EM-QUAD in "charlie"
        // THIN-SPACE as token between delta and echo
        tokens: ['alpha', 'bra\u00A0vo', 'char\u2001lie', 'delta', '\u2009', 'echo'],
        value: '  alpha  bra\u00A0vo char\u2001lie delta \u2009 echo \r ',
        serialized: 'alpha bra\u00A0vo char\u2001lie delta \u2009 echo',
      },
    };

    function getTokenlistFor(property) {
      return TokenList(
        function() { return data[property].value; },
        function(value) { result = value; }
      );
    }

    bdd.afterEach(function() {
      result = null;
    });

    // https://dom.spec.whatwg.org/#dom-domtokenlist-stringifier
    bdd.describe('for method toString()', function() {
      bdd.it('should not return the source value verbatim', function() {
        Object.keys(data).forEach(function(property) {
          var list = getTokenlistFor(property);
          expect(list.toString()).to.equal(data[property].serialized, 'value of data.' + property);
        });
      });
    });

    // https://dom.spec.whatwg.org/#dom-domtokenlist-item
    bdd.describe('for method item()', function() {
      bdd.it('should return the token at given index', function() {
        var list = getTokenlistFor('multiple');
        expect(list.item(0)).to.equal(data.multiple.tokens[0], 'first item');
        expect(list.item(2)).to.equal(data.multiple.tokens[2], 'last item');
        expect(list.item(3)).to.equal(null, 'unknown item');
      });

      bdd.it('should convert non-numeric index', function() {
        // NOTE: unspecified behavior, but implemented in Gecko and Blink
        var list = getTokenlistFor('multiple');
        expect(list.item(-1)).to.equal(null, 'negative index');
        expect(list.item(0.5)).to.equal(data.multiple.tokens[0], 'decimal index');
        expect(list.item('string')).to.equal(data.multiple.tokens[0], 'string index');
      });
    });

    // https://dom.spec.whatwg.org/#dom-domtokenlist-item (getter)
    bdd.describe('for getter', function() {
      bdd.it('should return the token at given index', function() {
        var source = data.multiple.value;
        var list = TokenList(
          function() { return source; },
          function(value) { source = value; }
        );

        expect(list[0]).to.equal(data.multiple.tokens[0], 'first item');
        expect(list[2]).to.equal(data.multiple.tokens[2], 'last item');
        expect(list[3]).to.equal(undefined, 'unknown item');
        list.add('zulu');
        expect(list[3]).to.equal('zulu', 'added item');
      });

      bdd.it('should not convert non-numeric index', function() {
        // NOTE: unspecified behavior, but implemented in Gecko and Blink
        var list = getTokenlistFor('multiple');
        expect(list[-1]).to.equal(undefined, 'negative index');
        expect(list[0.5]).to.equal(undefined, 'decimal index');
        expect(list['string']).to.equal(undefined, 'string index');
      });
    });

    // https://dom.spec.whatwg.org/#dom-domtokenlist-contains
    bdd.describe('for method contains()', function() {
      bdd.it('should return true for known tokens', function() {
        Object.keys(data).forEach(function(property) {
          var list = getTokenlistFor(property);

          data[property].tokens.forEach(function(token) {
            expect(list.contains(token)).to.equal(true, 'token "' + token + '" in data.' + property);
          });
        });
      });

      bdd.it('should return false for unknown tokens', function() {
        var list = getTokenlistFor('multiple');
        expect(list.contains('gustav')).to.equal(false, 'token "gustav" in data.multiple');
      });

      bdd.it('should throw exceptions for invalid tokens', function() {
        // NOTE: unspecified behavior, but implemented in Gecko and Blink
        var list = getTokenlistFor('multiple');

        expect(function() {
          list.contains('');
        }).to.throw(Error, 'Token must not be the empty string');

        expect(function() {
          list.contains('with space');
        }).to.throw(Error, 'Token must not contain ASCII whitespace');

        expect(list.contains(null)).to.equal(false, 'null in data.multiple');
        expect(list.contains(undefined)).to.equal(false, 'undefined in data.multiple');
      });
    });

    // https://dom.spec.whatwg.org/#dom-domtokenlist-add
    bdd.describe('for method add()', function() {
      bdd.it('should not accept empty strings', function() {
        var list = getTokenlistFor('empty');

        expect(function() {
          list.add('');
        }).to.throw(Error, 'Token must not be the empty string');

        expect(function() {
          list.add('alpha', '', 'bravo');
        }).to.throw(Error, 'Token must not be the empty string');

        expect(result).to.equal(null, 'no invalid write');
      });

      bdd.it('should not accept ASCII spaces', function() {
        var list = getTokenlistFor('empty');

        expect(function() {
          list.add('hello world');
        }).to.throw(Error, 'Token must not contain ASCII whitespace');

        expect(function() {
          list.add('alpha', 'hello world', 'bravo');
        }).to.throw(Error, 'Token must not contain ASCII whitespace');

        expect(result).to.equal(null, 'no invalid write');
      });

      bdd.it('should add tokens', function() {
        var list = getTokenlistFor('empty');

        list.add('alpha');
        expect(result).to.equal('alpha', 'single value');

        list.add('bravo', 'charlie');
        expect(result).to.equal('bravo charlie', 'multiple values');
      });

      bdd.it('should not add duplicate tokens', function() {
        var list = getTokenlistFor('multiple');

        list.add('alpha');
        expect(result).to.equal(null, 'single duplicate value');

        list.add('bravo', 'charlie');
        expect(result).to.equal(null, 'multiple duplicate values');

        list.add('alpha', 'delta', 'echo');
        expect(result).to.equal('alpha bravo charlie delta echo', 'multiple duplicate and unique values');
      });

      bdd.it('should account for outside modification', function() {
        var source = 'alpha bravo charlie';
        var list = TokenList(
          function() { return source; },
          function(value) { source = value; }
        );

        list.add('alpha');
        expect(source).to.equal('alpha bravo charlie', 'single duplicate value');

        list.add('bravo', 'charlie');
        expect(source).to.equal('alpha bravo charlie', 'multiple duplicate values');

        source = 'gustav ' + source;

        list.add('alpha', 'delta', 'echo');
        expect(source).to.equal('gustav alpha bravo charlie delta echo', 'multiple duplicate and unique values');
      });
    });

    // https://dom.spec.whatwg.org/#dom-domtokenlist-remove
    bdd.describe('for method remove()', function() {
      bdd.it('should not accept empty strings', function() {
        var list = getTokenlistFor('empty');

        expect(function() {
          list.remove('');
        }).to.throw(Error, 'Token must not be the empty string');

        expect(function() {
          list.remove('alpha', '', 'bravo');
        }).to.throw(Error, 'Token must not be the empty string');

        expect(result).to.equal(null, 'no invalid write');
      });

      bdd.it('should not accept ASCII spaces', function() {
        var list = getTokenlistFor('empty');

        expect(function() {
          list.remove('hello world');
        }).to.throw(Error, 'Token must not contain ASCII whitespace');

        expect(function() {
          list.remove('alpha', 'hello world', 'bravo');
        }).to.throw(Error, 'Token must not contain ASCII whitespace');

        expect(result).to.equal(null, 'no invalid write');
      });

      bdd.it('should remove tokens', function() {
        var list = getTokenlistFor('multiple');

        list.remove('alpha');
        expect(result).to.equal('bravo charlie', 'single value');

        list.remove('bravo', 'charlie');
        expect(result).to.equal('alpha', 'multiple values');
      });

      bdd.it('should ignore unknown tokens', function() {
        var list = getTokenlistFor('multiple');

        list.remove('delta');
        expect(result).to.equal(null, 'single value');

        list.remove('bravo', 'delta');
        expect(result).to.equal('alpha charlie', 'multiple values');
      });

      bdd.it('should remove duplicate tokens', function() {
        var list = getTokenlistFor('duplicate');

        list.remove('alpha');
        expect(result).to.equal('bravo charlie', 'single duplicate source value');
      });

      bdd.it('should account for outside modification', function() {
        var source = 'alpha bravo charlie';
        var list = TokenList(
          function() { return source; },
          function(value) { source = value; }
        );

        list.remove('alpha');
        expect(source).to.equal('bravo charlie', 'single duplicate value');

        list.remove('bravo', 'charlie');
        expect(source).to.equal('', 'multiple duplicate values');

        source = 'gustav alpha bravo alpha charlie';

        list.remove('alpha', 'bravo', 'echo');
        expect(source).to.equal('gustav charlie', 'multiple duplicate and unique values');
      });
    });

    // https://dom.spec.whatwg.org/#dom-domtokenlist-toggle
    bdd.describe('for method toggle()', function() {
      bdd.it('should not accept empty strings', function() {
        var list = getTokenlistFor('empty');

        expect(function() {
          list.toggle('');
        }).to.throw(Error, 'Token must not be the empty string');

        expect(function() {
          list.toggle('', true);
        }).to.throw(Error, 'Token must not be the empty string');

        expect(function() {
          list.toggle('', false);
        }).to.throw(Error, 'Token must not be the empty string');

        expect(result).to.equal(null, 'no invalid write');
      });

      bdd.it('should not accept ASCII spaces', function() {
        var list = getTokenlistFor('empty');

        expect(function() {
          list.toggle('hello world');
        }).to.throw(Error, 'Token must not contain ASCII whitespace');

        expect(function() {
          list.toggle('hello world', true);
        }).to.throw(Error, 'Token must not contain ASCII whitespace');

        expect(function() {
          list.toggle('hello world', false);
        }).to.throw(Error, 'Token must not contain ASCII whitespace');

        expect(result).to.equal(null, 'no invalid write');
      });

      bdd.it('should remove existing token', function() {
        var list = getTokenlistFor('multiple');

        var returned = list.toggle('alpha');
        expect(returned).to.equal(false, 'return value');
        expect(result).to.equal('bravo charlie', 'serialized value');
      });

      bdd.it('should remove existing duplicate tokens', function() {
        var list = getTokenlistFor('duplicate');

        var returned = list.toggle('alpha');
        expect(returned).to.equal(false, 'return value');
        expect(result).to.equal('bravo charlie', 'serialized value');
      });

      bdd.it('should add missing token', function() {
        var list = getTokenlistFor('multiple');

        var returned = list.toggle('delta');
        expect(returned).to.equal(true, 'return value');
        expect(result).to.equal('alpha bravo charlie delta', 'serialized value');
      });

      bdd.it('should force add token', function() {
        var list = getTokenlistFor('multiple');

        var returned = list.toggle('alpha', true);
        expect(returned).to.equal(true, 'return value on duplicate');
        expect(result).to.equal(null, 'no write on duplicate');

        returned = list.toggle('delta', true);
        expect(returned).to.equal(true, 'return value on unique');
        expect(result).to.equal('alpha bravo charlie delta', 'write on unique');
      });

      bdd.it('should force remove token', function() {
        var list = getTokenlistFor('multiple');

        var returned = list.toggle('delta', false);
        expect(returned).to.equal(false, 'return value on missing value');
        expect(result).to.equal(null, 'no write on missing value');

        returned = list.toggle('alpha', false);
        expect(returned).to.equal(false, 'return value on existing value');
        expect(result).to.equal('bravo charlie', 'write on existing value');
      });
    });

    // https://dom.spec.whatwg.org/#dom-domtokenlist-replace
    bdd.describe('for method replace()', function() {
      bdd.it('should not accept empty strings', function() {
        var list = getTokenlistFor('empty');

        expect(function() {
          list.replace('alpha', '');
        }).to.throw(Error, 'Token must not be the empty string');

        expect(function() {
          list.replace('', 'bravo');
        }).to.throw(Error, 'Token must not be the empty string');

        expect(result).to.equal(null, 'no invalid write');
      });

      bdd.it('should not accept ASCII spaces', function() {
        var list = getTokenlistFor('empty');

        expect(function() {
          list.replace('alpha', 'hello world');
        }).to.throw(Error, 'Token must not contain ASCII whitespace');

        expect(function() {
          list.replace('hello world', 'bravo');
        }).to.throw(Error, 'Token must not contain ASCII whitespace');

        expect(result).to.equal(null, 'no invalid write');
      });

      bdd.it('should replace existing token', function() {
        var list = getTokenlistFor('multiple');

        list.replace('alpha', 'zulu');
        expect(result).to.equal('zulu bravo charlie', 'serialized value');
      });

      bdd.it('should ignore missing token', function() {
        var list = getTokenlistFor('multiple');

        list.replace('delta', 'zulu');
        expect(result).to.equal(null, 'serialized value');
      });

      bdd.it('should collapse duplicate tokens', function() {
        var list = getTokenlistFor('duplicate');

        list.replace('alpha', 'zulu');
        expect(result).to.equal('zulu bravo charlie', 'serialized value');
      });
    });

    // https://dom.spec.whatwg.org/#dom-domtokenlist-supports
    bdd.describe('for method supports()', function() {
      var list = getTokenlistFor('empty');

      bdd.it('should throw error by default', function() {
        expect(function() {
          list.supports('alpha');
        }).to.throw(Error, 'No supported tokens defined');
      });

      bdd.it('should consult supports callback', function() {
        var list = TokenList(
          function() {},
          function() {},
          function(value) { return value === 'alpha'; }
        );

        expect(list.supports('alpha')).to.equal(true, 'supported value');
        expect(list.supports('ALPHA')).to.equal(true, 'supported lower-cased value');
        expect(list.supports('bravo')).to.equal(false, 'unsupported');
      });
    });

    // https://dom.spec.whatwg.org/#dom-domtokenlist-length
    bdd.describe('for property length', function() {
      bdd.it('should return the number of tokens', function() {
        Object.keys(data).forEach(function(property) {
          var list = getTokenlistFor(property);
          expect(list.length).to.equal(data[property].tokens.length, 'number of tokens in data.' + property);
        });
      });
    });

    // https://dom.spec.whatwg.org/#dom-domtokenlist-value
    bdd.describe('for property value', function() {
      bdd.it('should not return the source value verbatim', function() {
        Object.keys(data).forEach(function(property) {
          var list = getTokenlistFor(property);
          expect(list.value).to.equal(data[property].serialized, 'value of data.' + property);
        });
      });

      bdd.it('should not set the source value verbatim', function() {
        Object.keys(data).forEach(function(property) {
          var list = getTokenlistFor('empty');
          list.value = data[property].value;
          expect(result).to.equal(data[property].serialized, 'value of data.' + property);
        });
      });
    });

    // https://dom.spec.whatwg.org/#interface-domtokenlist
    bdd.describe('for Iterator', function() {
      bdd.it('should return tokens', function() {
        var _iterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
        var list = getTokenlistFor('multiple');
        var iterator = list[_iterator]();
        var step;

        step = iterator.next();
        expect(step.value).to.equal('alpha', 'first iteration');

        step = iterator.next();
        expect(step.value).to.equal('bravo', 'second iteration');

        step = iterator.next();
        expect(step.value).to.equal('charlie', 'last iteration');

        step = iterator.next();
        expect(step.done).to.equal(true, 'terminal iteration');
      });
    });

    // NOTE: unspecified behavior, but required for providing the same API for ID reference lists,
    // e.g. for http://w3c.github.io/aria/aria/aria.html#aria-labelledby
    bdd.describe('for refList support', function() {
      var source;
      var list = TokenList(
        function() { return source; },
        function(value) { source = value; },
        function(value) { return value === 'alpha'; },
        function decode(token) { return token && token.toUpperCase() || token; },
        function encode(input) { return input && input.toLowerCase() || input; }
      );

      bdd.beforeEach(function() {
        source = 'alpha bravo charlie';
      });

      bdd.it('item() should return decoded value', function() {
        expect(list.item(0)).to.equal('ALPHA');
      });

      bdd.it('contains() should ingest encoded value', function() {
        expect(list.contains('ALPHA')).to.equal(true);
      });

      bdd.it('add() should ingest encoded value', function() {
        list.add('ALPHA', 'DELTA');
        expect(source).to.equal('alpha bravo charlie delta');
      });

      bdd.it('remove() should ingest encoded value', function() {
        list.remove('ALPHA', 'DELTA');
        expect(source).to.equal('bravo charlie');
      });

      bdd.it('toggle() should ingest encoded value', function() {
        list.toggle('BRAVO');
        expect(source).to.equal('alpha charlie', 'removing BRAVO');

        list.toggle('DELTA');
        expect(source).to.equal('alpha charlie delta', 'adding DELTA');
      });

      bdd.it('replace() should ingest encoded value', function() {
        list.replace('BRAVO', 'DELTA');
        expect(source).to.equal('alpha delta charlie');
      });

      bdd.it('supports() should ingest encoded value', function() {
        expect(list.supports('ALPHA')).to.equal(true, 'supported value');
        expect(list.supports('BRAVO')).to.equal(false, 'unsupported value');
      });
    });
  });

});
