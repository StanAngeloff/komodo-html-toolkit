(function(){
  var $toolkit, _a, clearEncoding, clearEverything, clearIndentation, currentView, eventHandler, eventName, events, indentationBuilt, indentationsList, lastEncodingName, lastEncodingUseBOM, lastIndentHardTabs, lastIndentLevels, lastIndentTabWidth, lastNewlineEndings, newlineEndings, pollingTimer, restartPolling, root, startPolling, stopPolling, stopPollingAndClear;
  var __hasProp = Object.prototype.hasOwnProperty;
  root = this;
  root.extensions = root.extensions || {};
  $toolkit = root.extensions.htmlToolkit = root.extensions.htmlToolkit || {};
  const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
  const POLLING_INTERVAL = 1000;
  pollingTimer = null;
  newlineEndings = ['LF', 'CR', 'CRLF'];
  indentationBuilt = false;
  indentationsList = [2, 3, 4, 8];
  lastEncodingName = null;
  lastEncodingUseBOM = null;
  lastNewlineEndings = null;
  lastIndentHardTabs = null;
  lastIndentLevels = null;
  lastIndentTabWidth = null;
  clearEncoding = function() {
    var encodingWidget;
    encodingWidget = document.getElementById('statusbar-new-encoding-button');
    encodingWidget.removeAttribute('label');
    encodingWidget.setAttribute('collapsed', 'true');
    lastEncodingName = null;
    lastEncodingUseBOM = null;
    return lastEncodingUseBOM;
  };
  clearIndentation = function() {
    var indentationWidget;
    indentationWidget = document.getElementById('statusbar-indentation-button');
    indentationWidget.removeAttribute('label');
    indentationWidget.setAttribute('collapsed', 'true');
    lastIndentHardTabs = null;
    lastIndentLevels = null;
    lastIndentTabWidth = null;
    return lastIndentTabWidth;
  };
  clearEverything = function() {
    clearEncoding();
    return clearIndentation();
  };
  startPolling = function(view) {
    var block, id;
    block = function() {
      var encodingButtonText, encodingWidget, indentationButtonText, indentationWidget, newEncodingName, newEncodingUseBOM, newIndentHardTabs, newIndentLevels, newIndentTabWidth, newNewlineEndings;
      if (!(typeof view === "undefined" || view == undefined ? undefined : view.document)) {
        return clearEverything();
      }
      try {
        if (view.getAttribute('type' === 'startpage')) {
          return clearEverything();
        } else {
          newEncodingName = view.document.encoding.short_encoding_name;
          newEncodingUseBOM = view.document.encoding.use_byte_order_marker;
          newNewlineEndings = view.document.new_line_endings;
          if (lastEncodingName !== newEncodingName || lastEncodingUseBOM !== newEncodingUseBOM || lastNewlineEndings !== newNewlineEndings) {
            encodingButtonText = newEncodingName;
            if (newEncodingUseBOM) {
              encodingButtonText += '+BOM';
            }
            encodingButtonText += (": " + (newlineEndings[newNewlineEndings]));
            encodingWidget = document.getElementById('statusbar-new-encoding-button');
            encodingWidget.setAttribute('label', encodingButtonText);
            encodingWidget.removeAttribute('collapsed');
            lastEncodingName = newEncodingName;
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
                indentationButtonText += (" [" + newIndentTabWidth + "]");
              }
              indentationWidget = document.getElementById('statusbar-indentation-button');
              indentationWidget.setAttribute('label', indentationButtonText);
              indentationWidget.removeAttribute('collapsed');
              lastIndentHardTabs = newIndentHardTabs;
              lastIndentLevels = newIndentLevels;
              lastIndentTabWidth = newIndentTabWidth;
              return lastIndentTabWidth;
            }
          } else {
            return clearIndentation();
          }
        }
      } catch (e) {
        return clearEverything();
      }
    };
    block();
    pollingTimer = setInterval(block, POLLING_INTERVAL);
    id = pollingTimer;
    return id;
  };
  stopPolling = function() {
    if (!(pollingTimer)) {
      return null;
    }
    clearInterval(pollingTimer);
    pollingTimer = null;
    return pollingTimer;
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
    'current_view_changed': restartPolling,
    'view_closed': stopPollingAndClear
  };
  currentView = function() {
    var view;
    view = ko.views.manager == undefined ? undefined : ko.views.manager.currentView;
    return view && view.getAttribute('type') === 'editor' && view.document && view.scimoz ? view : false;
  };
  _a = events;
  for (eventName in _a) { if (__hasProp.call(_a, eventName)) {
    eventHandler = _a[eventName];
    root.addEventListener(eventName, eventHandler, true);
  }}
  ko.main.addWillCloseHandler(function() {
    var _b, _c;
    _b = []; _c = events;
    for (eventName in _c) { if (__hasProp.call(_c, eventName)) {
      eventHandler = _c[eventName];
      _b.push(root.removeEventListener(eventName, eventHandler, true));
    }}
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
    view.document.existing_line_endings = lastNewlineEndings;
    return view.document.existing_line_endings;
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
    var _b, _c, _d, index, itemsList, lineEndingsMenu, type;
    lineEndingsMenu = document.getElementById('statusbar-line-endings-menu');
    itemsList = {
      LF: document.getElementById('contextmenu_lineEndingsUnix'),
      CR: document.getElementById('contextmenu_lineEndingsMac'),
      CRLF: document.getElementById('contextmenu_lineEndingsDOSWindows')
    };
    _b = []; _c = newlineEndings;
    for (index = 0, _d = _c.length; index < _d; index++) {
      type = _c[index];
      _b.push(itemsList[type].setAttribute('checked', lastNewlineEndings === index ? true : false));
    }
    return _b;
  };
  $toolkit.statusbar.updateIndentationMenu = function() {
    var _b, _c, _d, _e, _f, _g, _h, firstChild, inList, indentationMenu, itemEl, levels, otherLevelEl, softTabsEl;
    indentationMenu = document.getElementById('statusbar-indentation-menu');
    if (!(indentationBuilt)) {
      firstChild = indentationMenu.firstChild;
      _c = indentationsList;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        (function() {
          var itemEl;
          var levels = _c[_b];
          itemEl = document.createElementNS(XUL_NS, 'menuitem');
          itemEl.setAttribute('class', 'statusbar-label');
          itemEl.setAttribute('id', ("contextmenu_indentation" + levels));
          itemEl.setAttribute('name', 'current_indentation');
          itemEl.setAttribute('label', levels);
          itemEl.setAttribute('accesskey', levels);
          itemEl.setAttribute('type', 'checkbox');
          itemEl.setAttribute('data-indent', levels);
          itemEl.addEventListener('command', function() {
            return $toolkit.statusbar.updateViewIndentation(levels);
          }, null);
          return indentationMenu.insertBefore(itemEl, firstChild);
        })();
      }
      indentationBuilt = true;
    }
    inList = false;
    _f = indentationMenu.childNodes;
    for (_e = 0, _g = _f.length; _e < _g; _e++) {
      itemEl = _f[_e];
      (typeof (_h = (levels = itemEl.getAttribute('data-indent'))) !== "undefined" && _h !== null) ? itemEl.setAttribute('checked', Number(levels) === lastIndentLevels ? (inList = true) : false) : null;
    }
    otherLevelEl = document.getElementById('contextmenu_indentationOther');
    otherLevelEl.setAttribute('checked', inList ? false : true);
    softTabsEl = document.getElementById('contextmenu_indentationSoftTabs');
    return softTabsEl.setAttribute('checked', lastIndentHardTabs ? false : true);
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
})();
