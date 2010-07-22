(function(){
  var root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  root.include('command.language');
  $self.controller = function() {
    var canChangeTriggerKeys, command, supportedLanguages, triggerKeys;
    root.command.language.controller.apply(this, [(command = 'quickMacro'), (triggerKeys = 'Ctrl+Alt+R'), (supportedLanguages = '*'), (canChangeTriggerKeys = true)]);
    this.parts = [];
    $toolkit.events.onUnload((function(__this) {
      var __func = function() {
        return ko.projects.active.manager.removeItems(this.parts);
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this));
    this.trigger = function(e) {
      var _a, result, scimoz, wnd;
      (ko.macros == undefined ? undefined : ko.macros.recorder == undefined ? undefined : ko.macros.recorder.mode) === 'recording' ? ko.macros.recorder.undo() : null;
      result = {
        part: null
      };
      wnd = window.openDialog('chrome://htmltoolkit/content/scripts/command/quickMacro/quickMacro.xul', 'quickMacroWindow', 'chrome=yes,modal=yes,centerscreen=yes,resizable=yes,minimizable=no', this.parts.length, result);
      wnd.focus();
      scimoz = ko.views.manager.currentView.scimoz;
      try {
        scimoz.focus = true;
      } catch (e) {
        scimoz.isFocused = true;
      }
      if ((typeof (_a = result.part) !== "undefined" && _a !== null)) {
        this.parts.push(result.part);
        return ko.projects.invokePart(result.part);
      }
      return null;
    };
    root.trapExceptions(this);
    return this;
  };
  $self.registerAll = function() {
    var _a;
    if ((typeof (_a = ko.toolbox2) !== "undefined" && _a !== null)) {
      $log('Quick Macro is not compatible with Komodo 6');
      return false;
    }
    return new $self.controller().register();
  };
})();
