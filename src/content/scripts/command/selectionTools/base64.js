(function(){
  var root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  $self.tool = function tool() {
    var toolName, toolOrdering;
    root.command.selectionTools.tool.apply(this, [(toolName = 'base64'), (toolOrdering = 5800)]);
    this.getSupportedTransformers = function getSupportedTransformers() {
      return ['encode', 'decode'];
    };
    this.trigger = function trigger(transformer, string) {
      if (transformer === 'encode') {
        try {
          return window.btoa(string);
        } catch (e) {
          // ignore
        }
      } else if (transformer === 'decode') {
        try {
          return window.atob(string);
        } catch (e) {
          // ignore
        }
      }
      return null;
    };
    return this;
  };
  $self.registerAll = function registerAll() {
    return new $self.tool().register();
  };
})();
