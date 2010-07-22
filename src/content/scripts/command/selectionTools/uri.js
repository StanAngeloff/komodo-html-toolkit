(function(){
  var root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  $self.tool = function tool() {
    var toolName, toolOrdering;
    root.command.selectionTools.tool.apply(this, [(toolName = 'uri'), (toolOrdering = 5700)]);
    this.getSupportedTransformers = function getSupportedTransformers() {
      return ['encode', 'decode'];
    };
    this.trigger = function trigger(transformer, string) {
      if (transformer === 'encode') {
        return encodeURIComponent(string);
      } else if (transformer === 'decode') {
        return decodeURIComponent(string);
      }
      return null;
    };
    return this;
  };
  $self.registerAll = function registerAll() {
    return new $self.tool().register();
  };
})();
