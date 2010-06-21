(function(){
  var SUBLANGUAGE_EXTRA_LIST, SUBLANGUAGE_SUPPORTED_LIST, root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  root.include('editor');
  SUBLANGUAGE_SUPPORTED_LIST = ['HTML', 'XML', 'XBL', 'PHP'];
  SUBLANGUAGE_EXTRA_LIST = ['CSS', 'Haml'];
  $self.provider = function() {
    var providerName, providerOrdering;
    root.command.abbreviation.provider.apply(this, [(providerName = 'zenCoding'), (providerOrdering = 6200)]);
    this.getAllowedCharacters = function() {
      return ['a-z', 'A-Z', '0-9', '#', '\\.', '>', '\\+', '\\*', '\\:', '\\$', '\\-', '_', '\\!', '@', '\\[', '\\]', '\\(', '\\)', '\\|'];
    };
    this.canExecute = function(view) {
      return root.pref('tagComplete.zenCodingEnabled') === 'true' && (typeof zen_editor !== "undefined" && zen_editor !== null) && (typeof zen_coding !== "undefined" && zen_coding !== null) && ((SUBLANGUAGE_SUPPORTED_LIST.indexOf(view.document.subLanguage) >= 0 && root.editor.isHtmlBuffer(view)) || SUBLANGUAGE_EXTRA_LIST.indexOf(view.document.subLanguage) >= 0);
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
      if (typeof content === "undefined" || content == undefined ? undefined : content.length) {
        tabstop = 0;
        content = content.replace(zen_coding.getCaretPlaceholder(), (function() {
          return "[[%tabstop" + (tabstop += 1) + "]]";
        }), 'g');
        content = content.replace(("[[%tabstop" + (tabstop - 1) + "]]"), "[[%tabstop0]]");
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
    return new $self.provider().register();
  };
})();
