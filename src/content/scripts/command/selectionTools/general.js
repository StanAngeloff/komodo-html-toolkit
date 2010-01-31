(function(){
  var root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  $self.tool = function tool() {
    var toolName, toolOrdering;
    // Call parent's constructor
    root.command.selectionTools.tool.apply(this, [(toolName = 'general'), (toolOrdering = 5000)]);
    this.getSupportedTransformers = (function() {
      return ['capitalise', 'hyphenise', 'underscorise'];
    });
    this.trigger = function trigger(transformer, string) {
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
    // This is to instruct CoffeeScript to return this instead of this.getSupportedTransformers
    return this;
  };
  $self.registerAll = function registerAll() {
    return new $self.tool().register();
  };
})();
