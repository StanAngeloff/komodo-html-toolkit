(function(){
  var $toolkit, _a, clearEncoding, clearEverything, clearIndentation, encodingWidget, eventHandler, eventName, events, getEncodingButton, getIndentationButton, indentationWidget, lastEncodingName, lastEncodingUseBOM, lastIndentHardTabs, lastIndentLevels, lastIndentTabWidth, lastNewlineEndings, newlineEndings, pollingTimer, restartPolling, root, startPolling, stopPolling, stopPollingAndClear;
  var __hasProp = Object.prototype.hasOwnProperty;
  root = this;
  root.extensions = root.extensions || {};
  $toolkit = root.extensions.htmlToolkit = root.extensions.htmlToolkit || {};
  const POLLING_INTERVAL = 1000;
  pollingTimer = null;
  encodingWidget = null;
  indentationWidget = null;
  lastEncodingName = null;
  lastEncodingUseBOM = null;
  lastNewlineEndings = null;
  newlineEndings = ['LF', 'CR', 'CRLF'];
  lastIndentHardTabs = null;
  lastIndentLevels = null;
  lastIndentTabWidth = null;
  getEncodingButton = function() {
    return encodingWidget = encodingWidget || document.getElementById('statusbar-new-encoding-button');
  };
  getIndentationButton = function() {
    return indentationWidget = indentationWidget || document.getElementById('statusbar-indentation-button');
  };
  clearEncoding = function() {
    getEncodingButton().removeAttribute('label');
    getEncodingButton().setAttribute('collapsed', 'true');
    lastEncodingName = null;
    lastEncodingUseBOM = null;
    return lastEncodingUseBOM;
  };
  clearIndentation = function() {
    getIndentationButton().removeAttribute('label');
    getIndentationButton().setAttribute('collapsed', 'true');
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
      var encodingButtonText, indentationButtonText, newEncodingName, newEncodingUseBOM, newIndentHardTabs, newIndentLevels, newIndentTabWidth, newNewlineEndings;
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
            getEncodingButton().setAttribute('label', encodingButtonText);
            getEncodingButton().removeAttribute('collapsed');
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
              getIndentationButton().setAttribute('label', indentationButtonText);
              getIndentationButton().removeAttribute('collapsed');
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
})();
