(function(){
  var $toolkit, _a, clearEncoding, clearEverything, encodingWidget, eventHandler, eventName, events, getEncodingButton, lastEncodingName, lastEncodingUseBOM, pollingTimer, restartPolling, root, startPolling, stopPolling, stopPollingAndClear;
  var __hasProp = Object.prototype.hasOwnProperty;
  root = this;
  root.extensions = root.extensions || {};
  $toolkit = root.extensions.htmlToolkit = root.extensions.htmlToolkit || {};
  const POLLING_INTERVAL = 500;
  pollingTimer = null;
  encodingWidget = null;
  lastEncodingName = null;
  lastEncodingUseBOM = null;
  getEncodingButton = function() {
    return encodingWidget = encodingWidget || document.getElementById('statusbar-new-encoding-button');
  };
  clearEncoding = function() {
    getEncodingButton().removeAttribute('label');
    getEncodingButton().setAttribute('collapsed', 'true');
    lastEncodingName = null;
    lastEncodingUseBOM = null;
    return lastEncodingUseBOM;
  };
  clearEverything = function() {
    return clearEncoding();
  };
  startPolling = function(view) {
    var block;
    block = function() {
      var encodingButtonText, newEncodingName, newEncodingUseBOM;
      if (!(typeof view === "undefined" || view == undefined ? undefined : view.document)) {
        return clearEverything();
      }
      try {
        if (view.getAttribute('type' === 'startpage')) {
          return clearEverything();
        } else {
          if (lastEncodingName !== (newEncodingName = view.document.encoding.short_encoding_name) || lastEncodingUseBOM !== (newEncodingUseBOM = view.document.encoding.use_byte_order_marker)) {
            lastEncodingName = newEncodingName;
            lastEncodingUseBOM = newEncodingUseBOM;
            encodingButtonText = lastEncodingName;
            if (lastEncodingUseBOM / getEncodingButton().setAttribute('label', encodingButtonText)) {
              encodingButtonText += '+BOM';
            }
            return getEncodingButton().removeAttribute('collapsed');
          }
        }
      } catch (e) {
        return clearEverything();
      }
    };
    block();
    pollingTimer = setInterval(block, POLLING_INTERVAL);
    return pollingTimer;
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
