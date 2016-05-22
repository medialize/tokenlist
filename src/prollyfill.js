import TokenList from './tokenlist';

// https://discourse.wicg.io/t/proposal-for-astokenlist-attr/1418/7
function getTokenListFor(attribute) {
  return TokenList(
    this.getAttribute.bind(this, attribute),
    this.setAttribute.bind(this, attribute)
  );
}

// taking the _tokenListFor() idea further to allow access to IDReferenceList
function getReferenceListFor(attribute) {
  const _document = this.ownerDocument;

  return TokenList(
    this.getAttribute.bind(this, attribute),
    this.setAttribute.bind(this, attribute),

    // ignore supported()
    null,

    function(token) { return typeof token === 'string' ? _document.getElementById(token) : token; },
    function(input) { return typeof input === 'string' ? input : input.id; }
  );
}

export default function prollyfill(context) {
  if (!context || !context.document || !context.document.documentElement.appendChild.bind) {
    return;
  }

  // in IE SVGElement does not properly inherit from Element
  ['Element', 'SVGElement'].forEach(function(object) {
    const proto = context[object].prototype;
    if (!proto._tokenListFor) {
      proto._tokenListFor = getTokenListFor;
    }

    if (!proto._referenceListFor) {
      proto._referenceListFor = getReferenceListFor;
    }
  });
}
