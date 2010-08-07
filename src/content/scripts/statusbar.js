(function() {
  var $toolkit, _a, clearEncoding, clearEverything, clearIndentation, currentView, encodingSvc, encodingsBuilt, eventHandler, eventName, events, indentationBuilt, indentationsList, lastEncodingLongName, lastEncodingName, lastEncodingPythonName, lastEncodingUseBOM, lastIndentHardTabs, lastIndentLevels, lastIndentTabWidth, lastNewlineEndings, newlineEndings, pollingTimer, restartPolling, root, startPolling, stopPolling, stopPollingAndClear;
  var __hasProp = Object.prototype.hasOwnProperty;
  root = this;
  root.extensions = root.extensions || {};
  $toolkit = root.extensions.htmlToolkit = root.extensions.htmlToolkit || {};
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
  const POLLING_INTERVAL = 1000;
  encodingSvc = Cc['@activestate.com/koEncodingServices;1'].getService(Ci.koIEncodingServices);
  pollingTimer = null;
  newlineEndings = ['LF', 'CR', 'CRLF'];
  indentationBuilt = false;
  indentationsList = [2, 3, 4, 8];
  encodingsBuilt = false;
  lastEncodingName = null;
  lastEncodingLongName = null;
  lastEncodingPythonName = null;
  lastEncodingUseBOM = null;
  lastNewlineEndings = null;
  lastIndentHardTabs = null;
  lastIndentLevels = null;
  lastIndentTabWidth = null;
  clearEncoding = function() {
    var encodingWidget;
    encodingWidget = document.getElementById('statusbar-new-encoding-button');
    encodingWidget.removeAttribute('label');
    lastEncodingName = null;
    lastEncodingLongName = null;
    lastEncodingPythonName = null;
    lastEncodingUseBOM = null;
    return (lastNewlineEndings = null);
  };
  clearIndentation = function() {
    var indentationWidget;
    indentationWidget = document.getElementById('statusbar-indentation-button');
    indentationWidget.removeAttribute('label');
    lastIndentHardTabs = null;
    lastIndentLevels = null;
    return (lastIndentTabWidth = null);
  };
  clearEverything = function() {
    clearEncoding();
    return clearIndentation();
  };
  startPolling = function(view) {
    var block, id;
    block = function() {
      var encodingButtonText, encodingWidget, indentationButtonText, indentationWidget, newEncodingLongName, newEncodingName, newEncodingPythonName, newEncodingUseBOM, newIndentHardTabs, newIndentLevels, newIndentTabWidth, newNewlineEndings;
      if (!(typeof view === "undefined" || view == undefined ? undefined : view.document)) {
        return clearEverything();
      }
      try {
        if (view.getAttribute('type') === 'editor') {
          newEncodingName = view.document.encoding.short_encoding_name;
          newEncodingPythonName = view.document.encoding.python_encoding_name;
          newEncodingLongName = view.document.encoding.friendly_encoding_name;
          newEncodingUseBOM = view.document.encoding.use_byte_order_marker;
          newNewlineEndings = view.document.new_line_endings;
          if (lastEncodingName !== newEncodingName || lastEncodingPythonName !== newEncodingPythonName || lastEncodingLongName !== newEncodingLongName || lastEncodingUseBOM !== newEncodingUseBOM || lastNewlineEndings !== newNewlineEndings) {
            encodingButtonText = newEncodingName;
            if (newEncodingUseBOM) {
              encodingButtonText += '+BOM';
            }
            encodingButtonText += (": " + (newlineEndings[newNewlineEndings]));
            encodingWidget = document.getElementById('statusbar-new-encoding-button');
            encodingWidget.setAttribute('label', encodingButtonText);
            lastEncodingName = newEncodingName;
            lastEncodingPythonName = newEncodingPythonName;
            lastEncodingLongName = newEncodingLongName;
            lastEncodingUseBOM = newEncodingUseBOM;
            lastNewlineEndings = newNewlineEndings;
          }
          if (view.scimoz) {
            newIndentHardTabs = view.scimoz.useTabs;
            newIndentLevels = view.scimoz.indent;
            newIndentTabWidth = view.scimoz.tabWidth;
            if (lastIndentHardTabs !== newIndentHardTabs || lastIndentLevels !== newIndentLevels || lastIndentTabWidth !== newIndentTabWidth) {
              indentationButtonText = ("" + (newIndentHardTabs ? 'Tabs' : 'Soft Tabs') + ": ");
              indentationButtonText += newIndentLevels;
              if (newIndentLevels !== newIndentTabWidth) {
                indentationButtonText += (" [" + (newIndentTabWidth) + "]");
              }
              indentationWidget = document.getElementById('statusbar-indentation-button');
              indentationWidget.setAttribute('label', indentationButtonText);
              lastIndentHardTabs = newIndentHardTabs;
              lastIndentLevels = newIndentLevels;
              return (lastIndentTabWidth = newIndentTabWidth);
            }
          } else {
            return clearIndentation();
          }
        } else {
          return clearEverything();
        }
      } catch (e) {
        return clearEverything();
      }
    };
    block();
    pollingTimer = setInterval(block, POLLING_INTERVAL);
    return (id = pollingTimer);
  };
  stopPolling = function() {
    if (!(pollingTimer)) {
      return null;
    }
    clearInterval(pollingTimer);
    return (pollingTimer = null);
  };
  stopPollingAndClear = function() {
    stopPolling();
    return clearEverything();
  };
  restartPolling = function(event) {
    if (ko.views.manager.batchMode) {
      return null;
    }
    stopPolling();
    return startPolling(event.originalTarget);
  };
  events = {
    current_view_changed: restartPolling,
    view_closed: stopPollingAndClear
  };
  currentView = function() {
    var view;
    view = ko.views.manager == undefined ? undefined : ko.views.manager.currentView;
    return view && view.getAttribute('type') === 'editor' && view.document && view.scimoz ? view : false;
  };
  _a = events;
  for (eventName in _a) {
    if (!__hasProp.call(_a, eventName)) continue;
    eventHandler = _a[eventName];
    root.addEventListener(eventName, eventHandler, true);
  }
  ko.main.addWillCloseHandler(function() {
    var _b, _c;
    _b = []; _c = events;
    for (eventName in _c) {
      if (!__hasProp.call(_c, eventName)) continue;
      eventHandler = _c[eventName];
      _b.push(root.removeEventListener(eventName, eventHandler, true));
    }
    return _b;
  });
  $toolkit.statusbar = $toolkit.statusbar || {};
  $toolkit.statusbar.updateViewLineEndings = function(mode) {
    var view;
    if (lastNewlineEndings === mode) {
      return null;
    }
    if (!(view = currentView())) {
      return null;
    }
    view.document.new_line_endings = mode;
    view.document.prefs.setStringPref('endOfLine', newlineEndings[mode]);
    return restartPolling({
      originalTarget: view
    });
  };
  $toolkit.statusbar.updateViewExistingEndings = function() {
    var view;
    if (!(view = currentView())) {
      return null;
    }
    return (view.document.existing_line_endings = lastNewlineEndings);
  };
  $toolkit.statusbar.updateViewEncoding = function(pythonName) {
    var applyButton, cancelButton, choice, errorCode, errorMessage, lastErrorSvc, message, newEncoding, question, view, viewEncoding, warning;
    if (lastEncodingPythonName === pythonName) {
      return null;
    }
    if (!(view = currentView())) {
      return null;
    }
    if (!(newEncoding = encodingSvc.get_encoding_info(pythonName))) {
      return null;
    }
    viewEncoding = Cc['@activestate.com/koEncoding;1'].createInstance(Ci.koIEncoding);
    viewEncoding.python_encoding_name = pythonName;
    viewEncoding.use_byte_order_marker = newEncoding.byte_order_marker && lastEncodingUseBOM;
    warning = view.document.languageObj.getEncodingWarning(viewEncoding);
    question = $toolkit.l10n('htmltoolkit').formatStringFromName('areYouSureThatYouWantToChangeTheEncoding', [warning], 1);
    if (warning === '' || ko.dialogs.yesNo(question, 'No') === 'Yes') {
      try {
        view.document.encoding = viewEncoding;
        view.lintBuffer.request();
        return restartPolling({
          originalTarget: view
        });
      } catch (error) {
        lastErrorSvc = Cc['@activestate.com/koLastErrorService;1'].getService(Ci.koILastErrorService);
        errorCode = lastErrorSvc.getLastErrorCode();
        errorMessage = lastErrorSvc.getLastErrorMessage();
        if (errorCode === 0) {
          message = $toolkit.l10n('htmltoolkit').formatStringFromName('internalErrorSettingTheEncoding', [view.document.displayPath, pythonName], 2);
          return ko.dialogs.internalError(message, ("" + (message) + "\n\n" + (errorMessage)), error);
        } else {
          question = $toolkit.l10n('htmltoolkit').formatStringFromName('forceEncodingConversion', [errorMessage], 1);
          choice = ko.dialogs.customButtons(question, [("&" + (applyButton = $toolkit.l10n('htmltoolkit').GetStringFromName('forceEncodingApplyButton'))), ("&" + (cancelButton = $toolkit.l10n('htmltoolkit').GetStringFromName('forceEncodingCancelButton')))], cancelButton);
          if (choice === applyButton) {
            try {
              view.document.forceEncodingFromEncodingName(pythonName);
              return restartPolling({
                originalTarget: view
              });
            } catch (error) {
              message = $toolkit.l10n('htmltoolkit').formatStringFromName('internalErrorForcingTheEncoding', [view.document.displayPath, pythonName], 2);
              return ko.dialogs.internalError(message, ("" + (message) + "\n\n" + (errorMessage)), error);
            }
          }
        }
      }
    }
  };
  $toolkit.statusbar.updateViewEncodingBOM = function() {
    var bomEl, useBOM, view;
    if (!(view = currentView())) {
      return null;
    }
    bomEl = document.getElementById('contextmenu_encodingUseBOM');
    if (lastEncodingUseBOM === (useBOM = bomEl.getAttribute('checked') === 'true')) {
      return null;
    }
    view.document.encoding.use_byte_order_marker = useBOM;
    view.document.isDirty = true;
    return restartPolling({
      originalTarget: view
    });
  };
  $toolkit.statusbar.updateViewIndentation = function(levels) {
    var view;
    if (levels === lastIndentLevels) {
      return null;
    }
    if (!(view = currentView())) {
      return null;
    }
    view.scimoz.tabWidth = (view.scimoz.indent = levels);
    view.document.prefs.setLongPref('indentWidth', levels);
    view.document.prefs.setLongPref('tabWidth', levels);
    return restartPolling({
      originalTarget: view
    });
  };
  $toolkit.statusbar.updateViewHardTabs = function(useTabs) {
    var view;
    if (useTabs === lastIndentHardTabs) {
      return null;
    }
    if (!(view = currentView())) {
      return null;
    }
    view.scimoz.useTabs = useTabs;
    view.document.prefs.setBooleanPref('useTabs', useTabs);
    return restartPolling({
      originalTarget: view
    });
  };
  $toolkit.statusbar.updateLineEndingsMenu = function() {
    var _b, _c, convertEl, index, itemsList, lineEndingsMenu, type;
    lineEndingsMenu = document.getElementById('statusbar-line-endings-menu');
    itemsList = {
      LF: document.getElementById('contextmenu_lineEndingsUnix'),
      CR: document.getElementById('contextmenu_lineEndingsMac'),
      CRLF: document.getElementById('contextmenu_lineEndingsDOSWindows')
    };
    _b = newlineEndings;
    for (index = 0, _c = _b.length; index < _c; index++) {
      type = _b[index];
      if ((typeof lastNewlineEndings !== "undefined" && lastNewlineEndings !== null)) {
        itemsList[type].removeAttribute('disabled');
        itemsList[type].setAttribute('checked', lastNewlineEndings === index ? true : false);
      } else {
        itemsList[type].setAttribute('disabled', true);
        itemsList[type].setAttribute('checked', false);
      }
    }
    convertEl = document.getElementById('contextmenu_lineEndingsConvertExisting');
    return (typeof lastNewlineEndings !== "undefined" && lastNewlineEndings !== null) ? convertEl.removeAttribute('disabled') : convertEl.setAttribute('disabled', true);
  };
  $toolkit.statusbar.updateEncodingsMenu = function() {
    var bomEl, encodingsMenu, firstChild, index, itemEl, lastEncoding, popupEl, updateChecked, updateClass, updateDisabled;
    encodingsMenu = document.getElementById('statusbar-encodings-menu');
    if (!(encodingsBuilt)) {
      popupEl = ko.widgets.getEncodingPopup(encodingSvc.encoding_hierarchy, true, 'window.extensions.htmlToolkit.statusbar.updateViewEncoding(this.getAttribute("data"));');
      updateClass = function(node) {
        var _b, _c, _d, _e, _f, child;
        node.setAttribute('class', 'statusbar-label');
        if ((typeof (_b = node.getAttribute('data')) !== "undefined" && _b !== null)) {
          node.setAttribute('type', 'checkbox');
        }
        if (node.childNodes.length) {
          _c = []; _e = node.childNodes;
          for (_d = 0, _f = _e.length; _d < _f; _d++) {
            child = _e[_d];
            _c.push(updateClass(child));
          }
          return _c;
        }
      };
      updateClass(popupEl);
      while (popupEl.childNodes.length) {
        encodingsMenu.insertBefore(popupEl.firstChild, (firstChild = firstChild || encodingsMenu.firstChild));
      }
      encodingsBuilt = true;
    }
    if ((typeof lastEncodingPythonName !== "undefined" && lastEncodingPythonName !== null)) {
      index = encodingSvc.get_encoding_index(lastEncodingPythonName);
    }
    if (index < 0) {
      itemEl = document.createElementNS(XUL_NS, 'menuitem');
      itemEl.setAttribute('data', lastEncodingPythonName);
      itemEl.setAttribute('label', lastEncodingLongName);
      itemEl.setAttribute('oncommand', 'window.extensions.htmlToolkit.statusbar.updateViewEncoding(this.getAttribute("data"));');
      encodingsMenu.insertBefore(itemEl, encodingsMenu.firstChild);
    }
    updateChecked = function(node) {
      var _b, _c, _d, _e, _f, child, pythonName;
      node.removeAttribute('disabled');
      (typeof (_b = (pythonName = node.getAttribute('data'))) !== "undefined" && _b !== null) ? node.setAttribute('checked', pythonName === lastEncodingPythonName ? true : false) : null;
      if (node.childNodes.length) {
        _c = []; _e = node.childNodes;
        for (_d = 0, _f = _e.length; _d < _f; _d++) {
          child = _e[_d];
          _c.push(updateChecked(child));
        }
        return _c;
      }
    };
    updateDisabled = function(node) {
      var _b, _c, _d, _e, _f, child, pythonName;
      if (!node.childNodes.length) {
        node.setAttribute('disabled', true);
      }
      (typeof (_b = (pythonName = node.getAttribute('data'))) !== "undefined" && _b !== null) ? node.setAttribute('checked', false) : null;
      if (node.childNodes.length) {
        _c = []; _e = node.childNodes;
        for (_d = 0, _f = _e.length; _d < _f; _d++) {
          child = _e[_d];
          _c.push(updateDisabled(child));
        }
        return _c;
      }
    };
    bomEl = document.getElementById('contextmenu_encodingUseBOM');
    if ((typeof lastEncodingPythonName !== "undefined" && lastEncodingPythonName !== null)) {
      lastEncoding = encodingSvc.get_encoding_info(lastEncodingPythonName);
    }
    (typeof lastEncoding !== "undefined" && lastEncoding !== null) ? updateChecked(encodingsMenu) : updateDisabled(encodingsMenu);
    if (typeof lastEncoding === "undefined" || lastEncoding == undefined ? undefined : lastEncoding.byte_order_marker) {
      bomEl.removeAttribute('disabled');
      return bomEl.setAttribute('checked', lastEncodingUseBOM ? true : false);
    } else {
      bomEl.setAttribute('disabled', true);
      return bomEl.setAttribute('checked', false);
    }
  };
  $toolkit.statusbar.updateIndentationMenu = function() {
    var _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, inList, indentationMenu, itemEl, levels, otherLevelEl, softTabsEl;
    indentationMenu = document.getElementById('statusbar-indentation-menu');
    if (!(indentationBuilt)) {
      _c = indentationsList;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        (function() {
          var firstChild, itemEl;
          var levels = _c[_b];
          itemEl = document.createElementNS(XUL_NS, 'menuitem');
          itemEl.setAttribute('class', 'statusbar-label');
          itemEl.setAttribute('id', ("contextmenu_indentation" + (levels)));
          itemEl.setAttribute('name', 'current_indentation');
          itemEl.setAttribute('label', levels);
          itemEl.setAttribute('accesskey', levels);
          itemEl.setAttribute('type', 'checkbox');
          itemEl.setAttribute('data-indent', levels);
          itemEl.addEventListener('command', (function() {
            return $toolkit.statusbar.updateViewIndentation(levels);
          }), null);
          return indentationMenu.insertBefore(itemEl, (firstChild = firstChild || indentationMenu.firstChild));
        })();
      }
      indentationBuilt = true;
    }
    if ((typeof lastIndentLevels !== "undefined" && lastIndentLevels !== null)) {
      inList = false;
      _f = indentationMenu.childNodes;
      for (_e = 0, _g = _f.length; _e < _g; _e++) {
        itemEl = _f[_e];
        itemEl.removeAttribute('disabled');
        if ((typeof (_h = (levels = itemEl.getAttribute('data-indent'))) !== "undefined" && _h !== null)) {
          itemEl.setAttribute('checked', Number(levels) === lastIndentLevels ? (inList = true) : false);
        }
      }
      otherLevelEl = document.getElementById('contextmenu_indentationOther');
      otherLevelEl.setAttribute('checked', inList ? false : true);
      softTabsEl = document.getElementById('contextmenu_indentationSoftTabs');
      return softTabsEl.setAttribute('checked', lastIndentHardTabs ? false : true);
    } else {
      _i = []; _k = indentationMenu.childNodes;
      for (_j = 0, _l = _k.length; _j < _l; _j++) {
        itemEl = _k[_j];
        _i.push((function() {
          itemEl.setAttribute('disabled', true);
          return itemEl.setAttribute('checked', false);
        })());
      }
      return _i;
    }
  };
  $toolkit.statusbar.showCustomIndentationPanel = function() {
    var panelEl, relativeEl, scaleEl, view;
    if (!(view = currentView())) {
      return null;
    }
    scaleEl = document.getElementById('customIndentation_scale');
    scaleEl.setAttribute('value', lastIndentLevels);
    panelEl = document.getElementById('customIndentation_panel');
    relativeEl = document.getElementById('statusbarviewbox');
    return panelEl.openPopup(relativeEl, 'before_end', -document.getElementById('statusbar-language').boxObject.width - 10, 0);
  };
  $toolkit.statusbar.handleCustomIndentationPanelKey = function(event) {
    var _b, panelEl, scaleEl;
    if (!((event.DOM_VK_ENTER === (_b = event.keyCode) || event.DOM_VK_RETURN === _b))) {
      return null;
    }
    event.preventDefault();
    event.stopPropagation();
    scaleEl = document.getElementById('customIndentation_scale');
    panelEl = document.getElementById('customIndentation_panel');
    panelEl.hidePopup();
    return $toolkit.statusbar.updateViewIndentation(Number(scaleEl.getAttribute('value')));
  };
  $toolkit.statusbar.updateSoftTabs = function() {
    var softTabsEl;
    softTabsEl = document.getElementById('contextmenu_indentationSoftTabs');
    return $toolkit.statusbar.updateViewHardTabs(softTabsEl.getAttribute('checked') !== 'true');
  };
  $toolkit.trapExceptions($toolkit.statusbar);
})();
