(function() {
  var root;
  root = typeof $toolkit != "undefined" && $toolkit !== null ? $toolkit : this;
  root.include('command.language');
  $self.controller = function() {
    var canChangeTriggerKeys, command, supportedLanguages, triggerKeys;
    root.command.language.controller.apply(this, [command = 'cssFillUpStopper', triggerKeys = 'Space', supportedLanguages = ['CSS'], canChangeTriggerKeys = false]);
    this.trigger = function(e) {
      var scimoz;
      if (root.pref('cssFillUpStopper.enabled') === 'true') {
        scimoz = ko.views.manager.currentView.scimoz;
        if (scimoz.autoCActive()) {
          scimoz.autoCCancel();
        }
      }
      return true;
    };
    root.trapExceptions(this);
    return this;
  };
  $self.registerAll = function() {
    return new $self.controller().register();
  };
}).call(this);
