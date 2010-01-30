(function(){
  var root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  root.include('command.language');
  $self.controller = function controller() {
    var canChangeTriggerKeys, command, supportedLanguages, triggerKeys;
    // Call parent's constructor
    root.command.language.controller.apply(this, [(command = 'cssFillUpStopper'), (triggerKeys = 'Space'), (supportedLanguages = ['CSS']), (canChangeTriggerKeys = false)]);
    this.trigger = function trigger(e) {
      var scimoz;
      scimoz = ko.views.manager.currentView.scimoz;
      if (scimoz.autoCActive()) {
        return scimoz.autoCCancel();
      }
    };
    // This is to instruct CoffeeScript to return $self instead of $self.trigger
    return this;
  };
  $self.registerAll = function registerAll() {
    return new $self.controller().register();
  };
})();
