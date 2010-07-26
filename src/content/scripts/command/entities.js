(function() {
  var root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  root.include('command.language');
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const ACIID_HTML_ENTITY = 14;
  var entities = [
  'quot', // quotation mark, U+0022 ISOnum
  'amp', // ampersand, U+0026 ISOnum
  'lt', // less-than sign, U+003C ISOnum
  'gt', // greater-than sign, U+003E ISOnum
  'apos', // apostrophe = APL quote, U+0027 ISOnum
  'OElig', // latin capital ligature OE, U+0152 ISOlat2
  'oelig', // latin small ligature oe, U+0153 ISOlat2
  'Scaron', // latin capital letter S with caron, U+0160 ISOlat2
  'scaron', // latin small letter s with caron, U+0161 ISOlat2
  'Yuml', // latin capital letter Y with diaeresis, U+0178 ISOlat2
  'circ', // modifier letter circumflex accent, U+02C6 ISOpub
  'tilde', // small tilde, U+02DC ISOdia
  'ensp', // en space, U+2002 ISOpub
  'emsp', // em space, U+2003 ISOpub
  'thinsp', // thin space, U+2009 ISOpub
  'zwnj', // zero width non-joiner, U+200C NEW RFC 2070
  'zwj', // zero width joiner, U+200D NEW RFC 2070
  'lrm', // left-to-right mark, U+200E NEW RFC 2070
  'rlm', // right-to-left mark, U+200F NEW RFC 2070
  'ndash', // en dash, U+2013 ISOpub
  'mdash', // em dash, U+2014 ISOpub
  'lsquo', // left single quotation mark, U+2018 ISOnum
  'rsquo', // right single quotation mark, U+2019 ISOnum
  'sbquo', // single low-9 quotation mark, U+201A NEW
  'ldquo', // left double quotation mark, U+201C ISOnum
  'rdquo', // right double quotation mark, U+201D ISOnum
  'bdquo', // double low-9 quotation mark, U+201E NEW
  'dagger', // dagger, U+2020 ISOpub
  'Dagger', // double dagger, U+2021 ISOpub
  'permil', // per mille sign, U+2030 ISOtech
  'lsaquo', // single left-pointing angle quotation mark, U+2039 ISO proposed
  'rsaquo', // single right-pointing angle quotation mark, U+203A ISO proposed
  'euro', // euro sign, U+20AC NEW
  'nbsp', // no-break space = non-breaking space, U+00A0 ISOnum
  'iexcl', // inverted exclamation mark, U+00A1 ISOnum
  'cent', // cent sign, U+00A2 ISOnum
  'pound', // pound sign, U+00A3 ISOnum
  'curren', // currency sign, U+00A4 ISOnum
  'yen', // yen sign = yuan sign, U+00A5 ISOnum
  'brvbar', // broken bar = broken vertical bar, U+00A6 ISOnum
  'sect', // section sign, U+00A7 ISOnum
  'uml', // diaeresis = spacing diaeresis, U+00A8 ISOdia
  'copy', // copyright sign, U+00A9 ISOnum
  'ordf', // feminine ordinal indicator, U+00AA ISOnum
  'laquo', // left-pointing double angle quotation mark = left pointing guillemet, U+00AB ISOnum
  'not', // not sign = angled dash, U+00AC ISOnum
  'shy', // soft hyphen = discretionary hyphen, U+00AD ISOnum
  'reg', // registered sign = registered trade mark sign, U+00AE ISOnum
  'macr', // macron = spacing macron = overline = APL overbar, U+00AF ISOdia
  'deg', // degree sign, U+00B0 ISOnum
  'plusmn', // plus-minus sign = plus-or-minus sign, U+00B1 ISOnum
  'sup2', // superscript two = superscript digit two = squared, U+00B2 ISOnum
  'sup3', // superscript three = superscript digit three = cubed, U+00B3 ISOnum
  'acute', // acute accent = spacing acute, U+00B4 ISOdia
  'micro', // micro sign, U+00B5 ISOnum
  'para', // pilcrow sign = paragraph sign, U+00B6 ISOnum
  'middot', // middle dot = Georgian comma = Greek middle dot, U+00B7 ISOnum
  'cedil', // cedilla = spacing cedilla, U+00B8 ISOdia
  'sup1', // superscript one = superscript digit one, U+00B9 ISOnum
  'ordm', // masculine ordinal indicator, U+00BA ISOnum
  'raquo', // right-pointing double angle quotation mark = right pointing guillemet, U+00BB ISOnum
  'frac14', // vulgar fraction one quarter = fraction one quarter, U+00BC ISOnum
  'frac12', // vulgar fraction one half = fraction one half, U+00BD ISOnum
  'frac34', // vulgar fraction three quarters = fraction three quarters, U+00BE ISOnum
  'iquest', // inverted question mark = turned question mark, U+00BF ISOnum
  'Agrave', // latin capital letter A with grave = latin capital letter A grave, U+00C0 ISOlat1
  'Aacute', // latin capital letter A with acute, U+00C1 ISOlat1
  'Acirc', // latin capital letter A with circumflex, U+00C2 ISOlat1
  'Atilde', // latin capital letter A with tilde, U+00C3 ISOlat1
  'Auml', // latin capital letter A with diaeresis, U+00C4 ISOlat1
  'Aring', // latin capital letter A with ring above = latin capital letter A ring, U+00C5 ISOlat1
  'AElig', // latin capital letter AE = latin capital ligature AE, U+00C6 ISOlat1
  'Ccedil', // latin capital letter C with cedilla, U+00C7 ISOlat1
  'Egrave', // latin capital letter E with grave, U+00C8 ISOlat1
  'Eacute', // latin capital letter E with acute, U+00C9 ISOlat1
  'Ecirc', // latin capital letter E with circumflex, U+00CA ISOlat1
  'Euml', // latin capital letter E with diaeresis, U+00CB ISOlat1
  'Igrave', // latin capital letter I with grave, U+00CC ISOlat1
  'Iacute', // latin capital letter I with acute, U+00CD ISOlat1
  'Icirc', // latin capital letter I with circumflex, U+00CE ISOlat1
  'Iuml', // latin capital letter I with diaeresis, U+00CF ISOlat1
  'ETH', // latin capital letter ETH, U+00D0 ISOlat1
  'Ntilde', // latin capital letter N with tilde, U+00D1 ISOlat1
  'Ograve', // latin capital letter O with grave, U+00D2 ISOlat1
  'Oacute', // latin capital letter O with acute, U+00D3 ISOlat1
  'Ocirc', // latin capital letter O with circumflex, U+00D4 ISOlat1
  'Otilde', // latin capital letter O with tilde, U+00D5 ISOlat1
  'Ouml', // latin capital letter O with diaeresis, U+00D6 ISOlat1
  'times', // multiplication sign, U+00D7 ISOnum
  'Oslash', // latin capital letter O with stroke = latin capital letter O slash, U+00D8 ISOlat1
  'Ugrave', // latin capital letter U with grave, U+00D9 ISOlat1
  'Uacute', // latin capital letter U with acute, U+00DA ISOlat1
  'Ucirc', // latin capital letter U with circumflex, U+00DB ISOlat1
  'Uuml', // latin capital letter U with diaeresis, U+00DC ISOlat1
  'Yacute', // latin capital letter Y with acute, U+00DD ISOlat1
  'THORN', // latin capital letter THORN, U+00DE ISOlat1
  'szlig', // latin small letter sharp s = ess-zed, U+00DF ISOlat1
  'agrave', // latin small letter a with grave = latin small letter a grave, U+00E0 ISOlat1
  'aacute', // latin small letter a with acute, U+00E1 ISOlat1
  'acirc', // latin small letter a with circumflex, U+00E2 ISOlat1
  'atilde', // latin small letter a with tilde, U+00E3 ISOlat1
  'auml', // latin small letter a with diaeresis, U+00E4 ISOlat1
  'aring', // latin small letter a with ring above = latin small letter a ring, U+00E5 ISOlat1
  'aelig', // latin small letter ae = latin small ligature ae, U+00E6 ISOlat1
  'ccedil', // latin small letter c with cedilla, U+00E7 ISOlat1
  'egrave', // latin small letter e with grave, U+00E8 ISOlat1
  'eacute', // latin small letter e with acute, U+00E9 ISOlat1
  'ecirc', // latin small letter e with circumflex, U+00EA ISOlat1
  'euml', // latin small letter e with diaeresis, U+00EB ISOlat1
  'igrave', // latin small letter i with grave, U+00EC ISOlat1
  'iacute', // latin small letter i with acute, U+00ED ISOlat1
  'icirc', // latin small letter i with circumflex, U+00EE ISOlat1
  'iuml', // latin small letter i with diaeresis, U+00EF ISOlat1
  'eth', // latin small letter eth, U+00F0 ISOlat1
  'ntilde', // latin small letter n with tilde, U+00F1 ISOlat1
  'ograve', // latin small letter o with grave, U+00F2 ISOlat1
  'oacute', // latin small letter o with acute, U+00F3 ISOlat1
  'ocirc', // latin small letter o with circumflex, U+00F4 ISOlat1
  'otilde', // latin small letter o with tilde, U+00F5 ISOlat1
  'ouml', // latin small letter o with diaeresis, U+00F6 ISOlat1
  'divide', // division sign, U+00F7 ISOnum
  'oslash', // latin small letter o with stroke, = latin small letter o slash, U+00F8 ISOlat1
  'ugrave', // latin small letter u with grave, U+00F9 ISOlat1
  'uacute', // latin small letter u with acute, U+00FA ISOlat1
  'ucirc', // latin small letter u with circumflex, U+00FB ISOlat1
  'uuml', // latin small letter u with diaeresis, U+00FC ISOlat1
  'yacute', // latin small letter y with acute, U+00FD ISOlat1
  'thorn', // latin small letter thorn, U+00FE ISOlat1
  'yuml', // latin small letter y with diaeresis, U+00FF ISOlat1
  'fnof', // latin small letter f with hook = function = florin, U+0192 ISOtech
  'Alpha', // greek capital letter alpha, U+0391
  'Beta', // greek capital letter beta, U+0392
  'Gamma', // greek capital letter gamma, U+0393 ISOgrk3
  'Delta', // greek capital letter delta, U+0394 ISOgrk3
  'Epsilon', // greek capital letter epsilon, U+0395
  'Zeta', // greek capital letter zeta, U+0396
  'Eta', // greek capital letter eta, U+0397
  'Theta', // greek capital letter theta, U+0398 ISOgrk3
  'Iota', // greek capital letter iota, U+0399
  'Kappa', // greek capital letter kappa, U+039A
  'Lambda', // greek capital letter lamda, U+039B ISOgrk3
  'Mu', // greek capital letter mu, U+039C
  'Nu', // greek capital letter nu, U+039D
  'Xi', // greek capital letter xi, U+039E ISOgrk3
  'Omicron', // greek capital letter omicron, U+039F
  'Pi', // greek capital letter pi, U+03A0 ISOgrk3
  'Rho', // greek capital letter rho, U+03A1
  'Sigma', // greek capital letter sigma, U+03A3 ISOgrk3
  'Tau', // greek capital letter tau, U+03A4
  'Upsilon', // greek capital letter upsilon, U+03A5 ISOgrk3
  'Phi', // greek capital letter phi, U+03A6 ISOgrk3
  'Chi', // greek capital letter chi, U+03A7
  'Psi', // greek capital letter psi, U+03A8 ISOgrk3
  'Omega', // greek capital letter omega, U+03A9 ISOgrk3
  'alpha', // greek small letter alpha, U+03B1 ISOgrk3
  'beta', // greek small letter beta, U+03B2 ISOgrk3
  'gamma', // greek small letter gamma, U+03B3 ISOgrk3
  'delta', // greek small letter delta, U+03B4 ISOgrk3
  'epsilon', // greek small letter epsilon, U+03B5 ISOgrk3
  'zeta', // greek small letter zeta, U+03B6 ISOgrk3
  'eta', // greek small letter eta, U+03B7 ISOgrk3
  'theta', // greek small letter theta, U+03B8 ISOgrk3
  'iota', // greek small letter iota, U+03B9 ISOgrk3
  'kappa', // greek small letter kappa, U+03BA ISOgrk3
  'lambda', // greek small letter lamda, U+03BB ISOgrk3
  'mu', // greek small letter mu, U+03BC ISOgrk3
  'nu', // greek small letter nu, U+03BD ISOgrk3
  'xi', // greek small letter xi, U+03BE ISOgrk3
  'omicron', // greek small letter omicron, U+03BF NEW
  'pi', // greek small letter pi, U+03C0 ISOgrk3
  'rho', // greek small letter rho, U+03C1 ISOgrk3
  'sigmaf', // greek small letter final sigma, U+03C2 ISOgrk3
  'sigma', // greek small letter sigma, U+03C3 ISOgrk3
  'tau', // greek small letter tau, U+03C4 ISOgrk3
  'upsilon', // greek small letter upsilon, U+03C5 ISOgrk3
  'phi', // greek small letter phi, U+03C6 ISOgrk3
  'chi', // greek small letter chi, U+03C7 ISOgrk3
  'psi', // greek small letter psi, U+03C8 ISOgrk3
  'omega', // greek small letter omega, U+03C9 ISOgrk3
  'thetasym', // greek theta symbol, U+03D1 NEW
  'upsih', // greek upsilon with hook symbol, U+03D2 NEW
  'piv', // greek pi symbol, U+03D6 ISOgrk3
  'bull', // bullet = black small circle, U+2022 ISOpub
  'hellip', // horizontal ellipsis = three dot leader, U+2026 ISOpub
  'prime', // prime = minutes = feet, U+2032 ISOtech
  'Prime', // double prime = seconds = inches, U+2033 ISOtech
  'oline', // overline = spacing overscore, U+203E NEW
  'frasl', // fraction slash, U+2044 NEW
  'weierp', // script capital P = power set = Weierstrass p, U+2118 ISOamso
  'image', // black-letter capital I = imaginary part, U+2111 ISOamso
  'real', // black-letter capital R = real part symbol, U+211C ISOamso
  'trade', // trade mark sign, U+2122 ISOnum
  'alefsym', // alef symbol = first transfinite cardinal, U+2135 NEW
  'larr', // leftwards arrow, U+2190 ISOnum
  'uarr', // upwards arrow, U+2191 ISOnum
  'rarr', // rightwards arrow, U+2192 ISOnum
  'darr', // downwards arrow, U+2193 ISOnum
  'harr', // left right arrow, U+2194 ISOamsa
  'crarr', // downwards arrow with corner leftwards = carriage return, U+21B5 NEW
  'lArr', // leftwards double arrow, U+21D0 ISOtech
  'uArr', // upwards double arrow, U+21D1 ISOamsa
  'rArr', // rightwards double arrow, U+21D2 ISOtech
  'dArr', // downwards double arrow, U+21D3 ISOamsa
  'hArr', // left right double arrow, U+21D4 ISOamsa
  'forall', // for all, U+2200 ISOtech
  'part', // partial differential, U+2202 ISOtech
  'exist', // there exists, U+2203 ISOtech
  'empty', // empty set = null set, U+2205 ISOamso
  'nabla', // nabla = backward difference, U+2207 ISOtech
  'isin', // element of, U+2208 ISOtech
  'notin', // not an element of, U+2209 ISOtech
  'ni', // contains as member, U+220B ISOtech
  'prod', // n-ary product = product sign, U+220F ISOamsb
  'sum', // n-ary summation, U+2211 ISOamsb
  'minus', // minus sign, U+2212 ISOtech
  'lowast', // asterisk operator, U+2217 ISOtech
  'radic', // square root = radical sign, U+221A ISOtech
  'prop', // proportional to, U+221D ISOtech
  'infin', // infinity, U+221E ISOtech
  'ang', // angle, U+2220 ISOamso
  'and', // logical and = wedge, U+2227 ISOtech
  'or', // logical or = vee, U+2228 ISOtech
  'cap', // intersection = cap, U+2229 ISOtech
  'cup', // union = cup, U+222A ISOtech
  'int', // integral, U+222B ISOtech
  'there4', // therefore, U+2234 ISOtech
  'sim', // tilde operator = varies with = similar to, U+223C ISOtech
  'cong', // approximately equal to, U+2245 ISOtech
  'asymp', // almost equal to = asymptotic to, U+2248 ISOamsr
  'ne', // not equal to, U+2260 ISOtech
  'equiv', // identical to, U+2261 ISOtech
  'le', // less-than or equal to, U+2264 ISOtech
  'ge', // greater-than or equal to, U+2265 ISOtech
  'sub', // subset of, U+2282 ISOtech
  'sup', // superset of, U+2283 ISOtech
  'nsub', // not a subset of, U+2284 ISOamsn
  'sube', // subset of or equal to, U+2286 ISOtech
  'supe', // superset of or equal to, U+2287 ISOtech
  'oplus', // circled plus = direct sum, U+2295 ISOamsb
  'otimes', // circled times = vector product, U+2297 ISOamsb
  'perp', // up tack = orthogonal to = perpendicular, U+22A5 ISOtech
  'sdot', // dot operator, U+22C5 ISOamsb
  'lceil', // left ceiling = APL upstile, U+2308 ISOamsc
  'rceil', // right ceiling, U+2309 ISOamsc
  'lfloor', // left floor = APL downstile, U+230A ISOamsc
  'rfloor', // right floor, U+230B ISOamsc
  'lang', // left-pointing angle bracket = bra, U+2329 ISOtech
  'rang', // right-pointing angle bracket = ket, U+232A ISOtech
  'loz', // lozenge, U+25CA ISOpub
  'spades', // black spade suit, U+2660 ISOpub
  'clubs', // black club suit = shamrock, U+2663 ISOpub
  'hearts', // black heart suit = valentine, U+2665 ISOpub
  'diams' // black diamond suit, U+2666 ISOpub
];
  entities.sort(function(left, right) {
    if (left.toLowerCase() < right.toLowerCase()) {
      return -1;
    }
    if (left.toLowerCase() > right.toLowerCase()) {
      return +1;
    }
    return 0;
  });
  $self.destroy = function() {
    return window.removeEventListener('view_opened', $self.onViewOpened, true);
  };
  $self.initialize = function() {
    return window.addEventListener('view_opened', $self.onViewOpened, true);
  };
  $self.onViewOpened = function(e) {
    var view;
    view = e.originalTarget;
    view && view.scimoz ? view.scimoz.registerImage(ACIID_HTML_ENTITY, ko.markers.getPixmap('chrome://htmltoolkit/skin/images/ac_html_entity.xpm')) : null;
    return true;
  };
  $self.controller = function() {
    var canChangeTriggerKeys, command, supportedLanguages, triggerKeys;
    root.command.language.controller.apply(this, [(command = 'entities'), (triggerKeys = '&'), (supportedLanguages = ['HTML', 'HTML5']), (canChangeTriggerKeys = false)]);
    this.trigger = function(e) {
      this.onKeyEvent('up', function() {
        var _a, _b, _c, _d, entity, lineRange, lineStartPosition, scimoz;
        scimoz = ko.views.manager.currentView.scimoz;
        if (scimoz.currentPos === scimoz.anchor && scimoz.currentPos > 0 && scimoz.getStyleAt(scimoz.currentPos - 1) === scimoz.SCE_UDL_M_ENTITY) {
          lineStartPosition = scimoz.positionFromLine(scimoz.lineFromPosition(scimoz.currentPos));
          lineRange = scimoz.getTextRange(lineStartPosition, scimoz.currentPos);
          /[^&]*&$/.test(lineRange) ? scimoz.autoCShow(1, (function() {
            _a = []; _c = entities;
            for (_b = 0, _d = _c.length; _b < _d; _b++) {
              entity = _c[_b];
              _a.push('&' + entity + ';?' + ACIID_HTML_ENTITY);
            }
            return _a;
          })().join(String.fromCharCode(scimoz.autoCSeparator))) : null;
        }
        return true;
      });
      return true;
    };
    root.trapExceptions(this);
    return this;
  };
  $self.registerAll = function() {
    return new $self.controller().register();
  };
})();
