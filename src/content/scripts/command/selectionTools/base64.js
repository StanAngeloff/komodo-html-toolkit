(function(){
  var root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  $self.tool = function tool() {
    var toolName, toolOrdering;
    // Call parent's constructor
    root.command.selectionTools.tool.apply(this, [(toolName = 'base64'), (toolOrdering = 5800)]);
    this.getSupportedTransformers = (function() {
      return ['encode', 'decode'];
    });
    this.trigger = function trigger(transformer, string) {
      if (transformer === 'encode') {
        try {
          return window.btoa(string);
        } catch (e) {
          return null;
        }
      } else if (transformer === 'decode') {
        try {
          return window.atob(string);
        } catch (e) {
          return null;
        }
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
