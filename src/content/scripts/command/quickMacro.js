(function() {
  var root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  root = typeof $toolkit != "undefined" && $toolkit !== null ? $toolkit : this;
  root.include('command.language');
  $self.controller = function() {
    var canChangeTriggerKeys, command, supportedLanguages, triggerKeys;
    root.command.language.controller.apply(this, [command = 'quickMacro', triggerKeys = 'Ctrl+Alt+R', supportedLanguages = '*', canChangeTriggerKeys = true]);
    this.parts = [];
    $toolkit.events.onUnload(__bind(function() {
      return ko.projects.active.manager.removeItems(this.parts);
    }, this));
    this.trigger = function(e) {
      var result, scimoz, wnd, _ref, _ref2;
      if (((_ref = ko.macros) != null ? (_ref2 = _ref.recorder) != null ? _ref2.mode : void 0 : void 0) === 'recording') {
        ko.macros.recorder.undo();
      }
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
      if (result.part != null) {
        this.parts.push(result.part);
        return ko.projects.invokePart(result.part);
      }
      return null;
    };
    root.trapExceptions(this);
    return this;
  };
  $self.registerAll = function() {
    if (ko.toolbox2 != null) {
      $log('Quick Macro is not compatible with Komodo 6');
      return false;
    }
    return new $self.controller().register();
  };
}).call(this);
