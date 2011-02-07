(function() {
  var SUBLANGUAGE_EXTRA_LIST, SUBLANGUAGE_SUPPORTED_LIST, root;
  root = typeof $toolkit != "undefined" && $toolkit !== null ? $toolkit : this;
  root.include('editor');
  root.include('external');
  root.include('htmlUtils');
  SUBLANGUAGE_SUPPORTED_LIST = ['HTML', 'HTML5', 'XML', 'XBL', 'PHP'];
  SUBLANGUAGE_EXTRA_LIST = ['CSS', 'Haml'];
  $self.provider = function() {
    var providerName, providerOrdering;
    root.command.abbreviation.provider.apply(this, [providerName = 'zenCoding', providerOrdering = 6200]);
    this.getAllowedCharacters = function() {
      return [[], ['a-z', 'A-Z', '0-9', '#', '\\.', '>', '\\+', '\\*', '\\:', '\\$', '\\-', '_', '\\!', '@', '\\[', '\\]', '\\(', '\\)', '\\|']];
    };
    this.canExecute = function(view) {
      var htmlTagsOnly, isEnabled, isHtmlBuffer, isInstalled, isLanguageSupported, lineStartPosition, rangeEnd, rangeStart, rangeText, scimoz;
      isEnabled = root.pref('tagComplete.zenCodingEnabled') === 'true';
      isInstalled = (typeof zen_editor != "undefined" && zen_editor !== null) && (typeof zen_coding != "undefined" && zen_coding !== null);
      if (!(isEnabled && isInstalled)) {
        return false;
      }
      isHtmlBuffer = root.editor.isHtmlBuffer(view);
      isLanguageSupported = SUBLANGUAGE_SUPPORTED_LIST.indexOf(view.document.subLanguage) >= 0;
      isLanguageSupported || (isLanguageSupported = SUBLANGUAGE_EXTRA_LIST.indexOf(view.document.subLanguage) >= 0);
      isLanguageSupported || (isLanguageSupported = isHtmlBuffer);
      if (!isLanguageSupported) {
        return false;
      }
      scimoz = view.scimoz;
      if (scimoz.anchor !== scimoz.currentPos) {
        return true;
      }
      lineStartPosition = scimoz.positionFromLine(scimoz.lineFromPosition(scimoz.currentPos));
      rangeStart = scimoz.anchor - 1;
      rangeEnd = scimoz.currentPos;
      rangeText = '';
      while (rangeStart >= 0) {
        rangeText = scimoz.getTextRange(rangeStart, rangeEnd);
        if (!this.getAllowedRegExp().test(rangeText)) {
          break;
        } else if (rangeStart === lineStartPosition) {
          rangeText = " " + rangeText;
          break;
        }
        rangeStart -= 1;
      }
      if (!/^\s+/.test(rangeText)) {
        return false;
      }
      htmlTagsOnly = true;
      if (isHtmlBuffer) {
        rangeText.replace(/[a-zA-Z0-9\-\:]+/g, function(tagName) {
          return htmlTagsOnly && (htmlTagsOnly = tagName.indexOf(':') >= 0 || /^[0-9]+$/.test(tagName) || $toolkit.htmlUtils.isHtmlTag(tagName));
        });
      }
      return htmlTagsOnly;
    };
    this.findSnippet = function(view, abbreviation) {
      var content, length, snippet, tabstop;
      length = abbreviation.length;
      if ('<' === abbreviation.charAt(0)) {
        abbreviation = abbreviation.substr(1);
      }
      snippet = null;
      zen_editor.setContext(view);
      content = zen_coding.expandAbbreviation(abbreviation, zen_editor.getSyntax(), zen_editor.getProfileName());
      if (content != null ? content.length : void 0) {
        if (content.indexOf('<') === 0 && SUBLANGUAGE_EXTRA_LIST.indexOf(view.document.subLanguage) >= 0) {
          return null;
        }
        tabstop = 0;
        content = content.replace(zen_coding.getCaretPlaceholder(), (function() {
          return "[[%tabstop" + (tabstop += 1) + "]]";
        }), 'g');
        content = content.replace("[[%tabstop" + (tabstop - 1) + "]]", "[[%tabstop0]]");
        snippet = $toolkit.library.createSnippet(content, abbreviation);
        snippet.parent = {
          name: 'Zen Coding',
          parent: {
            name: '*internal*'
          }
        };
      }
      return snippet;
    };
    return this;
  };
  $self.registerAll = function() {
    root.external.zenCoding = new $self.provider();
    return root.external.zenCoding.register();
  };
}).call(this);
