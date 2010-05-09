(function(){
  var root;
  var __to_array = Array.prototype.slice, __bind = function(func, obj, args) {
    return function() {
      return func.apply(obj || {}, args ? args.concat(__to_array.call(arguments, 0)) : arguments);
    };
  };
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  root.include('command.language');
  $self.controller = function controller() {
    var canChangeTriggerKeys, command, supportedLanguages, triggerKeys;
    root.command.language.controller.apply(this, [(command = 'quickMacro'), (triggerKeys = 'Ctrl+Alt+R'), (supportedLanguages = '*'), (canChangeTriggerKeys = true)]);
    this.parts = [];
    $toolkit.events.onUnload(__bind(function() {
        return ko.projects.active.manager.removeItems(this.parts);
      }, this));
    this.trigger = function trigger(e) {
      var _a, result, scimoz, wnd;
      (ko.macros == undefined ? undefined : ko.macros.recorder == undefined ? undefined : ko.macros.recorder.mode) === 'recording' ? ko.macros.recorder.undo() : null;
      result = {
        part: null
      };
      wnd = window.openDialog('chrome://htmltoolkit/content/scripts/command/quickMacro/quickMacro.xul', 'quickMacroWindow', 'chrome=yes,modal=yes,centerscreen=yes,resizable=yes,minimizable=no', this.parts.length, result);
      wnd.focus();
      // Restore focus to the editor
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
    };
    root.trapExceptions(this);
    return this;
  };
  $self.registerAll = function registerAll() {
    return new $self.controller().register();
  };
})();
