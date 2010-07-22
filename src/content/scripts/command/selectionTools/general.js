(function(){
  var root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  $self.tool = function() {
    var toolName, toolOrdering;
    root.command.selectionTools.tool.apply(this, [(toolName = 'general'), (toolOrdering = 5900)]);
    this.getSupportedTransformers = function() {
      return ['capitalise', 'hyphenise', 'underscorise'];
    };
    this.trigger = function(transformer, string) {
      if (transformer === 'capitalise') {
        return string.replace(/[\-_]\D/g, function(match) {
          return match.charAt(1).toUpperCase();
        }).replace(/\b\D/g, function(match) {
          return match.charAt(0).toUpperCase();
        }).replace(/^\D/g, function(match) {
          return match.charAt(0).toUpperCase();
        });
      } else if (transformer === 'hyphenise') {
        return string.replace(/([A-Z]+)/g, '-$1').toLowerCase().replace(/([0-9]+)/g, '-$1').replace(/[\W\_]+/g, '-').replace(/\-{2,}/g, '-').replace(/^\-+|\-+$/g, '');
      } else if (transformer === 'underscorise') {
        return string.replace(/([A-Z]+)/g, '_$1').toLowerCase().replace(/([0-9]+)/g, '_$1').replace(/[\W]+/g, '_').replace(/_{2,}/g, '_').replace(/^_+|_+$/g, '');
      }
      return null;
    };
    return this;
  };
  $self.registerAll = function() {
    return new $self.tool().register();
  };
})();
