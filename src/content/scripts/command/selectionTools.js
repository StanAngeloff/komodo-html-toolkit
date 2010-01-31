(function(){
  var TOOL_COMMANDS_GROUP, TOOL_ORDERING, encodingService, root;
  root = (typeof $toolkit !== "undefined" && $toolkit !== null) ? $toolkit : this;
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
  $self.destroy = function destroy() {
    if ((typeof $self.manager !== "undefined" && $self.manager !== null)) {
      return $self.manager.unregister();
    }
  };
  $self.manager = {
    tools: [],
    register: (function() {    }),
    unregister: (function() {    }),
    changeHandler: null,
    addTool: function addTool(obj) {
      var index;
      index = $self.manager.indexOfTool(obj);
      if (index < 0) {
        $self.manager.tools.push(obj);
        $self.manager.sortTools();
        this.onChahge();
        return $self.manager.tools.length;
      }
      return index;
    },
    removeTool: function removeTool(obj) {
      var index, tool;
      index = $self.manager.indexOfTool(obj);
      if (index >= 0) {
        tool = $self.manager.tools.splice(index, 1);
        $self.manager.sortTools();
        this.onChahge();
        return tool;
      }
      return null;
    },
    indexOfTool: function indexOfTool(obj) {
      var __a, __b, __c, __d, index;
      __c = 0; __d = $self.manager.tools.length;
      for (__b=0, index=__c; (__c <= __d ? index < __d : index > __d); (__c <= __d ? index += 1 : index -= 1), __b++) {
        if ($self.manager.tools[index] === obj) {
          return index;
        }
      }
      return -1;
    },
    sortTools: function sortTools() {
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
    onChahge: function onChahge(handler) {
      if ((typeof handler !== "undefined" && handler !== null)) {
        return (this.changeHandler = handler);
      } else if ((typeof this.changeHandler !== "undefined" && this.changeHandler !== null)) {
        return this.changeHandler();
      }
    }
  };
  root.trapExceptions($self.manager);
  TOOL_ORDERING = 9900;
  TOOL_COMMANDS_GROUP = 'cmd_htmlToolkit_selectionTools_';
  $self.tool = function tool(toolName, toolOrdering) {
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
    this.trigger = function trigger(transformer) {
      return null;
    };
    // This is to instruct CoffeeScript to return this instead of this.getSupportedTransformers
    return this;
  };
  encodingService = Cc['@activestate.com/koEncodingServices;1'].getService(Ci.koIEncodingServices);
  $self.controller = function controller() {
    var canChangeTriggerKeys, command, triggerKeys;
    // Call parent's constructor
    root.command.controller.apply(this, [(command = 'selectionTools'), (triggerKeys = 'None'), (canChangeTriggerKeys = false)]);
    this.canExecute = function canExecute(e) {
      // Commands cannot execute outside an editor with an active selection
      return ko.views.manager && ko.views.manager.currentView && ko.views.manager.currentView.getAttribute('type') === 'editor' && ko.views.manager.currentView.document && ko.views.manager.currentView.scimoz && ko.views.manager.currentView.scimoz.currentPos !== ko.views.manager.currentView.scimoz.anchor;
    };
    this.rebuildEditMenu = function rebuildEditMenu() {
      var globalSet, isMac, popupEl, referenceEl, topMenuEl;
      globalSet = document.getElementById('broadcasterset_global');
      if (!(typeof globalSet !== "undefined" && globalSet !== null)) {
        throw "FATAL: Cannot find Komodo's global broadcaster set.";
      }
      Array.prototype.slice(globalSet.childNodes).forEach(function(broadcasterEl) {
        return (broadcasterEl.id == undefined ? undefined : broadcasterEl.indexOf)(TOOL_COMMANDS_GROUP) === 0 ? globalSet.removeChild(broadcasterEl) : null;
      });
      topMenuEl = document.getElementById('menu_selectionTools');
      if ((typeof topMenuEl !== "undefined" && topMenuEl !== null)) {
        topMenuEl.parentNode.removeChild(topMenuEl);
      }
      topMenuEl = document.createElementNS(XUL_NS, 'menu');
      topMenuEl.setAttribute('id', 'menu_selectionTools');
      topMenuEl.setAttribute('label', root.l10n('command').GetStringFromName('selectionTools.menuLabel'));
      topMenuEl.setAttribute('accesskey', root.l10n('command').GetStringFromName('selectionTools.menuAccessKey'));
      popupEl = document.createElementNS(XUL_NS, 'menupopup');
      popupEl.setAttribute('id', 'popup_selectionTools');
      isMac = (navigator.platform.indexOf('Mac') >= 0);
      $self.manager.tools.forEach(function(tool) {
        var separatorEl;
        tool.getSupportedTransformers().forEach(function(transformer) {
          var broadcasterEl, commandAccessKey, commandDescription, commandLabel, commandName, defaultKeyBindings, existingKeyBindings, menuEl;
          commandName = TOOL_COMMANDS_GROUP + tool.name + '_' + transformer;
          commandLabel = root.l10n('command').GetStringFromName('selectionTools.' + tool.name + '.' + transformer + '.menuLabel');
          commandAccessKey = root.l10n('command').GetStringFromName('selectionTools.' + tool.name + '.' + transformer + '.menuAccessKey');
          commandDescription = root.l10n('command').formatStringFromName('selectionTools.binding', [commandLabel], 1);
          // Register command as new broadcaster
          broadcasterEl = document.createElementNS(XUL_NS, 'broadcaster');
          broadcasterEl.setAttribute('id', commandName);
          broadcasterEl.setAttribute('key', 'key_' + commandName);
          broadcasterEl.setAttribute('oncommand', 'ko.commands.doCommandAsync("' + commandName + '", event);');
          broadcasterEl.setAttribute('desc', commandDescription);
          globalSet.appendChild(broadcasterEl);
          // Set default key binding, if specified
          try {
            // Make sure the User has not overridden the default key bindings
            existingKeyBindings = gKeybindingMgr.command2keysequences(commandName);
            if (!existingKeyBindings.length) {
              triggerKeys = root.l10n('command').GetStringFromName('selectionTools.' + tool.name + '.' + transformer + '.triggerKeys');
              // Ctrl is Meta on a Mac, update assigned triggers keys to match
              if (isMac) {
                triggerKeys = triggerKeys.replace('Ctrl', 'Meta', 'g');
              }
              triggerKeys = triggerKeys.split(',').map(function(key) {
                return key.replace(/^\s+|\s+$/, '');
              });
              defaultKeyBindings = {
              };
              defaultKeyBindings[commandName] = triggerKeys;
              gKeybindingMgr._add_keybinding_sequences(defaultKeyBindings);
            }
          } catch (e) {
            // ignore
          }
          menuEl = document.createElementNS(XUL_NS, 'menuitem');
          menuEl.setAttribute('label', commandLabel);
          menuEl.setAttribute('id', 'menu_' + tool.name + '_' + transformer);
          menuEl.setAttribute('accesskey', commandAccessKey);
          menuEl.setAttribute('observes', commandName);
          return popupEl.appendChild(menuEl);
        });
        separatorEl = document.createElementNS(XUL_NS, 'menuseparator');
        return popupEl.appendChild(separatorEl);
      });
      // Remova last separator
      if (popupEl.childNodes.length) {
        popupEl.removeChild(popupEl.childNodes[popupEl.childNodes.length - 1]);
      }
      topMenuEl.appendChild(popupEl);
      referenceEl = document.getElementById('menu_marks');
      return referenceEl.parentNode.insertBefore(topMenuEl, referenceEl.nextSibling);
    };
    this.onMenuShowing = function onMenuShowing() {
      var topMenuEl;
      topMenuEl = document.getElementById('menu_selectionTools');
      return topMenuEl.setAttribute('disabled', this.canExecute(false) ? 'false' : 'true');
    };
    this.moveBuiltInMenuItems = function moveBuiltInMenuItems() {
      var convertLowerCaseEl, convertUpperCaseEl, popupEl;
      popupEl = document.getElementById('popup_selectionTools');
      convertLowerCaseEl = document.getElementById('menu_convertLowerCase');
      popupEl.insertBefore(convertLowerCaseEl.nextSibling, popupEl.firstChild);
      popupEl.insertBefore(convertLowerCaseEl, popupEl.firstChild);
      convertUpperCaseEl = document.getElementById('menu_convertUpperCase');
      return popupEl.insertBefore(convertUpperCaseEl, popupEl.firstChild);
    };
    this.restoreBuiltInMenuItems = function restoreBuiltInMenuItems() {
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
    this.register = function register() {
      $self.manager.onChahge((function(__this) {
        var __func = function() {
          return this.rebuildEditMenu();
        };
        return (function() {
          return __func.apply(__this, arguments);
        });
      })(this));
      return root.events.onLoad((function(__this) {
        var __func = function() {
          var menuEl;
          this.rebuildEditMenu();
          this.moveBuiltInMenuItems();
          menuEl = document.getElementById('popup_sourcecode');
          menuEl.addEventListener('popupshowing', this.onMenuShowing, false);
          return window.controllers.appendController(this);
        };
        return (function() {
          return __func.apply(__this, arguments);
        });
      })(this));
    };
    this.unregisterBase = this.unregister;
    this.unregister = function unregister() {
      return root.events.onUnload((function(__this) {
        var __func = function() {
          var menuEl;
          menuEl = document.getElementById('popup_sourcecode');
          menuEl.removeEventListener('popupshowing', this.onMenuShowing, false);
          this.restoreBuiltInMenuItems();
          return window.controllers.removeController(this);
        };
        return (function() {
          return __func.apply(__this, arguments);
        });
      })(this));
    };
    this.supportsCommand = function supportsCommand(command) {
      if (command.indexOf(TOOL_COMMANDS_GROUP) === 0) {
        return true;
      }
      return false;
    };
    this.isCommandEnabled = function isCommandEnabled(command) {
      if (command.indexOf(TOOL_COMMANDS_GROUP) === 0) {
        return this.canExecute(false);
      }
      return false;
    };
    this.doCommand = function doCommand(command) {
      var __a, toolName, transformer;
      if (this.isCommandEnabled(command)) {
        __a = command.substr(TOOL_COMMANDS_GROUP.length).split('_');
        toolName = __a[0];
        transformer = __a[1];
        return $self.manager.tools.forEach(function(tool) {
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
                return selectionDirection ? scimoz.setSel(scimoz.currentPos - ko.stringutils.bytelength(outputString), scimoz.currentPos) : scimoz.setSel(scimoz.currentPos, scimoz.currentPos - ko.stringutils.bytelength(outputString));
              } finally {
                scimoz.endUndoAction();
              }
            } else {
              commandLabel = root.l10n('command').GetStringFromName('selectionTools.' + tool.name + '.' + transformer + '.menuLabel');
              return ko.statusBar.AddMessage(root.l10n('command').formatStringFromName('selectionTools.invalidSelection', [commandLabel], 1), 'htmltoolkit', 2500, true);
            }
          }
        });
      }
    };
    root.trapExceptions(this);
    // This is to instruct CoffeeScript to return this instead of this.rebuildEditMenu()
    return this;
  };
  $self.registerAll = function registerAll() {
    root.registerAll(__namespace__);
    return new $self.controller().register();
  };
})();
