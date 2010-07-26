(function() {
  var TOOL_COMMANDS_GROUP, TOOL_NATIVE_MENU_ID, TOOL_ORDERING, encodingService, root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
  $self.destroy = function() {
    var _a;
    if ((typeof (_a = $self.manager) !== "undefined" && _a !== null)) {
      $self.manager.unregister();
    }
    return true;
  };
  $self.manager = {
    tools: [],
    register: function() {},
    unregister: function() {},
    changeHandler: null,
    addTool: function(obj) {
      var index;
      index = $self.manager.indexOfTool(obj);
      if (index < 0) {
        $self.manager.tools.push(obj);
        $self.manager.sortTools();
        this.onChange();
        return $self.manager.tools.length;
      }
      return index;
    },
    removeTool: function(obj) {
      var index, tool;
      index = $self.manager.indexOfTool(obj);
      if (index >= 0) {
        tool = $self.manager.tools.splice(index, 1);
        $self.manager.sortTools();
        this.onChange();
        return tool;
      }
      return null;
    },
    indexOfTool: function(obj) {
      var _a, index;
      _a = $self.manager.tools.length;
      for (index = 0; (0 <= _a ? index < _a : index > _a); (0 <= _a ? index += 1 : index -= 1)) {
        if ($self.manager.tools[index] === obj) {
          return index;
        }
      }
      return -1;
    },
    sortTools: function() {
      return $self.manager.tools.sort(function(left, right) {
        if (left.ordering < right.ordering) {
          return -1;
        }
        if (left.ordering > right.ordering) {
          return +1;
        }
        return 0;
      });
    },
    onChange: function(handler) {
      var _a;
      if (typeof handler !== "undefined" && handler !== null) {
        this.changeHandler = handler;
        return this.changeHandler;
      } else if ((typeof (_a = this.changeHandler) !== "undefined" && _a !== null)) {
        return this.changeHandler();
      }
      return null;
    }
  };
  root.trapExceptions($self.manager);
  TOOL_ORDERING = 9900;
  TOOL_COMMANDS_GROUP = 'cmd_htmlToolkit_selectionTools_';
  TOOL_NATIVE_MENU_ID = 'codeConvert_menu';
  $self.tool = function(toolName, toolOrdering) {
    this.name = toolName;
    this.ordering = (typeof toolOrdering !== "undefined" && toolOrdering !== null) ? toolOrdering : (++TOOL_ORDERING);
    this.register = (function() {
      return $self.manager.addTool(this);
    });
    this.unregister = (function() {
      return $self.manager.removeTool(this);
    });
    this.getSupportedTransformers = (function() {
      return [];
    });
    this.trigger = function(transformer) {
      return null;
    };
    return this;
  };
  encodingService = Cc['@activestate.com/koEncodingServices;1'].getService(Ci.koIEncodingServices);
  $self.controller = function() {
    var _a, canChangeTriggerKeys, command, triggerKeys;
    root.command.controller.apply(this, [(command = 'selectionTools'), (triggerKeys = 'None'), (canChangeTriggerKeys = false)]);
    this.hasNative = (typeof (_a = document.getElementById(TOOL_NATIVE_MENU_ID)) !== "undefined" && _a !== null);
    this.canExecute = function(e) {
      return ko.views.manager && ko.views.manager.currentView && ko.views.manager.currentView.getAttribute('type') === 'editor' && ko.views.manager.currentView.document && ko.views.manager.currentView.scimoz && ko.views.manager.currentView.scimoz.currentPos !== ko.views.manager.currentView.scimoz.anchor;
    };
    this.rebuildEditMenu = function() {
      var globalSet, isMac, popupEl, referenceEl, separatorEl, topMenuEl;
      globalSet = document.getElementById('broadcasterset_global');
      if (!(typeof globalSet !== "undefined" && globalSet !== null)) {
        throw "FATAL: Cannot find Komodo's global broadcaster set.";
      }
      Array.prototype.slice(globalSet.childNodes).forEach(function(broadcasterEl) {
        (broadcasterEl.id == undefined ? undefined : broadcasterEl.id.indexOf(TOOL_COMMANDS_GROUP)) === 0 ? globalSet.removeChild(broadcasterEl) : null;
        return null;
      });
      if (this.hasNative) {
        topMenuEl = document.getElementById(TOOL_NATIVE_MENU_ID);
        popupEl = document.getElementById(("" + (TOOL_NATIVE_MENU_ID) + "popup"));
        Array.prototype.slice(popupEl.childNodes).forEach(function(menuEl) {
          (menuEl.id == undefined ? undefined : menuEl.id.indexOf('menu_selectionTools')) === 0 ? popupEl.removeChild(menuEl) : null;
          return null;
        });
        if ((popupEl.childNodes[popupEl.childNodes.length - 1] == undefined ? undefined : popupEl.childNodes[popupEl.childNodes.length - 1].localName) !== 'menuseparator') {
          separatorEl = document.createElementNS(XUL_NS, 'menuseparator');
          popupEl.appendChild(separatorEl);
        }
      } else {
        topMenuEl = document.getElementById('menu_selectionTools');
        if (typeof topMenuEl !== "undefined" && topMenuEl !== null) {
          topMenuEl.parentNode.removeChild(topMenuEl);
        }
        topMenuEl = document.createElementNS(XUL_NS, 'menu');
        topMenuEl.setAttribute('id', 'menu_selectionTools');
        topMenuEl.setAttribute('label', root.l10n('command').GetStringFromName('selectionTools.menuLabel'));
        topMenuEl.setAttribute('accesskey', root.l10n('command').GetStringFromName('selectionTools.menuAccessKey'));
        popupEl = document.createElementNS(XUL_NS, 'menupopup');
        popupEl.setAttribute('id', 'popup_selectionTools');
      }
      isMac = navigator.platform.indexOf('Mac') >= 0;
      $self.manager.tools.forEach(function(tool) {
        tool.getSupportedTransformers().forEach(function(transformer) {
          var broadcasterEl, commandAccessKey, commandDescription, commandLabel, commandName, defaultKeyBindings, existingKeyBindings, menuEl;
          commandName = ("" + TOOL_COMMANDS_GROUP + (tool.name) + "_" + transformer);
          commandLabel = root.l10n('command').GetStringFromName(("selectionTools." + (tool.name) + "." + (transformer) + ".menuLabel"));
          commandAccessKey = root.l10n('command').GetStringFromName(("selectionTools." + (tool.name) + "." + (transformer) + ".menuAccessKey"));
          commandDescription = root.l10n('command').formatStringFromName('selectionTools.binding', [commandLabel], 1);
          broadcasterEl = document.createElementNS(XUL_NS, 'broadcaster');
          broadcasterEl.setAttribute('id', commandName);
          broadcasterEl.setAttribute('key', ("key_" + commandName));
          broadcasterEl.setAttribute('oncommand', ("ko.commands.doCommandAsync('" + commandName + "', event);"));
          broadcasterEl.setAttribute('desc', commandDescription);
          globalSet.appendChild(broadcasterEl);
          try {
            existingKeyBindings = gKeybindingMgr.command2keysequences(commandName);
            if (!existingKeyBindings.length) {
              triggerKeys = root.l10n('command').GetStringFromName(("selectionTools." + (tool.name) + "." + (transformer) + ".triggerKeys"));
              if (isMac) {
                triggerKeys = triggerKeys.replace('Ctrl', 'Meta', 'g');
              }
              triggerKeys = triggerKeys.split(',').map(function(key) {
                return key.replace(/^\s+|\s+$/, '');
              });
              defaultKeyBindings = {};
              defaultKeyBindings[commandName] = triggerKeys;
              gKeybindingMgr._add_keybinding_sequences(defaultKeyBindings);
            }
          } catch (e) {

          }
          menuEl = document.createElementNS(XUL_NS, 'menuitem');
          menuEl.setAttribute('label', commandLabel);
          menuEl.setAttribute('id', ("menu_selectionTools_" + (tool.name) + "_" + transformer));
          menuEl.setAttribute('accesskey', commandAccessKey);
          menuEl.setAttribute('observes', commandName);
          return popupEl.appendChild(menuEl);
        });
        separatorEl = document.createElementNS(XUL_NS, 'menuseparator');
        return popupEl.appendChild(separatorEl);
      });
      if (popupEl.childNodes.length) {
        popupEl.removeChild(popupEl.childNodes[popupEl.childNodes.length - 1]);
      }
      if (!this.hasNative) {
        topMenuEl.appendChild(popupEl);
        referenceEl = document.getElementById('menu_marks');
        referenceEl.parentNode.insertBefore(topMenuEl, referenceEl.nextSibling);
      }
      return null;
    };
    this.onMenuShowing = function() {
      var _b, _c, _d, _e, childEl, isDisabled, topMenuEl, updateDisabled;
      topMenuEl = document.getElementById(this.hasNative ? TOOL_NATIVE_MENU_ID : 'menu_selectionTools');
      isDisabled = this.canExecute(false) ? true : false;
      updateDisabled = function(node) {
        var _b, _c, _d, _e, child;
        isDisabled ? node.removeAttribute('disabled') : node.setAttribute('disabled', 'true');
        if (node.childNodes.length) {
          _b = []; _d = node.childNodes;
          for (_c = 0, _e = _d.length; _c < _e; _c++) {
            child = _d[_c];
            _b.push(updateDisabled(child));
          }
          return _b;
        }
      };
      _b = []; _d = topMenuEl.childNodes;
      for (_c = 0, _e = _d.length; _c < _e; _c++) {
        childEl = _d[_c];
        _b.push(updateDisabled(childEl));
      }
      return _b;
    };
    this.moveBuiltInMenuItems = function() {
      var convertLowerCaseEl, convertUpperCaseEl, popupEl;
      popupEl = document.getElementById('popup_selectionTools');
      convertLowerCaseEl = document.getElementById('menu_convertLowerCase');
      popupEl.insertBefore(convertLowerCaseEl.nextSibling, popupEl.firstChild);
      popupEl.insertBefore(convertLowerCaseEl, popupEl.firstChild);
      convertUpperCaseEl = document.getElementById('menu_convertUpperCase');
      return popupEl.insertBefore(convertUpperCaseEl, popupEl.firstChild);
    };
    this.restoreBuiltInMenuItems = function() {
      var convertLowerCaseEl, convertUpperCaseEl, referenceEl;
      referenceEl = document.getElementById('menu_selectionTools');
      referenceEl ? (referenceEl = referenceEl.nextSibling) : (referenceEl = document.getElementById('menu_marks'));
      convertLowerCaseEl = document.getElementById('menu_convertLowerCase');
      referenceEl.parentNode.insertBefore(convertLowerCaseEl.nextSibling, referenceEl.nextSibling);
      referenceEl.parentNode.insertBefore(convertLowerCaseEl, referenceEl.nextSibling);
      convertUpperCaseEl = document.getElementById('menu_convertUpperCase');
      return referenceEl.parentNode.insertBefore(convertUpperCaseEl, referenceEl.nextSibling);
    };
    this.registerBase = this.register;
    this.register = function() {
      $self.manager.onChange((function(__this) {
        return function() {
          return __this.rebuildEditMenu();
        };
      })(this));
      root.events.onLoad((function(__this) {
        return function() {
          var menuEl;
          __this.rebuildEditMenu();
          if (!__this.hasNative) {
            __this.moveBuiltInMenuItems();
          }
          menuEl = document.getElementById('popup_sourcecode');
          menuEl.addEventListener('popupshowing', __this.onMenuShowing, false);
          return window.controllers.appendController(__this);
        };
      })(this));
      return this.registerBase();
    };
    this.unregisterBase = this.unregister;
    this.unregister = function() {
      root.events.onUnload((function(__this) {
        return function() {
          var menuEl;
          menuEl = document.getElementById('popup_sourcecode');
          menuEl.removeEventListener('popupshowing', __this.onMenuShowing, false);
          if (!__this.hasNative) {
            __this.restoreBuiltInMenuItems();
          }
          return window.controllers.removeController(__this);
        };
      })(this));
      return this.unregisterBase();
    };
    this.supportsCommand = function(command) {
      if (command.indexOf(TOOL_COMMANDS_GROUP) === 0) {
        return true;
      }
      return false;
    };
    this.isCommandEnabled = function(command) {
      if (command.indexOf(TOOL_COMMANDS_GROUP) === 0) {
        return this.canExecute(false);
      }
      return false;
    };
    this.doCommand = function(command) {
      var _b, toolName, transformer;
      if (this.isCommandEnabled(command)) {
        _b = command.substr(TOOL_COMMANDS_GROUP.length).split('_');
        toolName = _b[0];
        transformer = _b[1];
        $self.manager.tools.forEach(function(tool) {
          var commandLabel, inputString, outputString, scimoz, selectionDirection;
          if (tool.name === toolName) {
            scimoz = ko.views.manager.currentView.scimoz;
            inputString = scimoz.selText;
            outputString = tool.trigger(transformer, inputString);
            if (typeof outputString === 'string' && outputString.length) {
              selectionDirection = scimoz.currentPos > scimoz.anchor;
              scimoz.beginUndoAction();
              try {
                scimoz.replaceSel(outputString);
                selectionDirection ? scimoz.setSel(scimoz.currentPos - ko.stringutils.bytelength(outputString), scimoz.currentPos) : scimoz.setSel(scimoz.currentPos, scimoz.currentPos - ko.stringutils.bytelength(outputString));
              } finally {
                scimoz.endUndoAction();
              }
            } else {
              commandLabel = root.l10n('command').GetStringFromName(("selectionTools." + (tool.name) + "." + (transformer) + ".menuLabel"));
              ko.statusBar.AddMessage(root.l10n('command').formatStringFromName('selectionTools.invalidSelection', [commandLabel], 1), 'htmltoolkit', 2500, true);
            }
          }
          return null;
        });
      }
      return null;
    };
    root.trapExceptions(this);
    return this;
  };
  $self.registerAll = function() {
    root.registerAll(__namespace__);
    return new $self.controller().register();
  };
})();
