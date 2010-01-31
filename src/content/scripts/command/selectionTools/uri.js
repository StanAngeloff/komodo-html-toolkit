(function(){
  var root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  $self.tool = function tool() {
    var toolName, toolOrdering;
    // Call parent's constructor
    root.command.selectionTools.tool.apply(this, [(toolName = 'uri'), (toolOrdering = 5700)]);
    this.getSupportedTransformers = (function() {
      return ['encode', 'decode'];
    });
    this.trigger = function trigger(transformer, string) {
      if (transformer === 'encode') {
        return encodeURIComponent(string);
      } else if (transformer === 'decode') {
        return decodeURIComponent(string);
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
