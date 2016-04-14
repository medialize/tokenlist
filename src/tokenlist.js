/*
_tokenListFor prollyfill
v1.0
authors: Brian Kardell, Jonathan Neal
CC0 License
*/
HTMLElement.prototype._tokenListFor = function (attrName) {
  var self = this,
    checkArg = function (inp) {
      if (inp === '') {
        throw new Error('Syntax Exception: Input cannot be an empty string');
      }
      if (/\s/.test(inp)) {
        throw new Error('InvalidCharacterError: Input cannot contain whitespace');
      }
    },
    attr = function () {
      return self.getAttribute(attrName) || '';
    },
    toArray = function (arg) {
      return Array.prototype.slice.call(arg);
    },
    getTokens = function () {
      return attr().trim().split(/\s*/);
    },
    setTokens = function (tokens) {
      self.setAttribute(attrName, tokens.join(' '));
    },
    ret = {
      toString: function () { return attr(); },
      item: function (i) {
        return getTokens()[i];
      },
      contains: function (val) {
        return getTokens().some(function (item) {
          return item === val;
        });
      },
      add: function () {
        var tokens = getTokens();
        toArray(arguments).forEach(function (item) {
          checkArg(item);
          tokens.push(item);
        });
        setTokens(tokens);
      },
      remove: function () {
          var val = attr();
        toArray(arguments).forEach(function (toRemove) {
          checkArg(toRemove);
          val = val.replace(new RegExp('\\b' + toRemove + '\\b', 'g'), '');
        });
        self.setAttribute(attrName, val.trim());
      },
      toggle: function (token, force) {
        checkArg(token);
        if (ret.contains(token)) {
          if (!force) {
            ret.remove(token);
            return false;
          }
          return true;
        }
        if (force === false) {
          return false;
        }
        ret.add(token);
        return true;
      },
      replace: function (oldToken, newToken) {
        var val = attr();
        checkArg(newToken);
        val = val.replace(new RegExp('\\b' + oldToken + '\\b', 'g'), newToken);
        self.setAttribute(attrName, val.trim());
      },
      supports: function () {
        checkArg();
        throw new TypeError('No supported tokens defined');
      }

    };
    Object.defineProperties(ret, {
      length: {
        get: function () {
          return getTokens().length;
        }
      },
      value: {
        get: function () {
          return self.getAttribute(attrName);
        },
        set: function (val) {
          self.setAttribute(attrName, val);
        }
      }
    });
    return ret;
  };