(function() {
  var root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  $self.tool = function() {
    var toolName, toolOrdering;
    root.command.selectionTools.tool.apply(this, [(toolName = 'base64'), (toolOrdering = 5800)]);
    this.getSupportedTransformers = function() {
      return ['encode', 'decode'];
    };
    this.trigger = function(transformer, string) {
      if (transformer === 'encode') {
        try {
          return window.btoa(string);
        } catch (e) {

        }
      } else if (transformer === 'decode') {
        try {
          return window.atob(string);
        } catch (e) {

        }
      }
      return null;
    };
    return this;
  };
  $self.registerAll = function() {
    return new $self.tool().register();
  };
})();
