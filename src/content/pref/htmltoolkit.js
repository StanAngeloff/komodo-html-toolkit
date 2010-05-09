(function(){
  var $toolkit, eventsBag, prefsBranch, prefsService, recentKomodoWindow, windowManagerService;
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
  // Find the most recent Komodo window and grab a reference to the HTML Toolkit extension
  windowManagerService = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
  recentKomodoWindow = windowManagerService.getMostRecentWindow('Komodo');
  $toolkit = recentKomodoWindow.extensions.htmlToolkit;
  // Grab the preferences branch for HTML Toolkit
  prefsService = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService);
  prefsBranch = prefsService.getBranch('extensions.htmltoolkit.');
  eventsBag = {
    onLoad: function onLoad() {
      var cssFillUpStopperControlEl, cssFillUpStopperPrefEl, tagCompleteGroup;
      prefsService.QueryInterface(Ci.nsIPrefBranch2);
      // String to bool conversion for checkboxes
      cssFillUpStopperControlEl = document.getElementById('css-fillup-stopper-control');
      cssFillUpStopperPrefEl = document.getElementById(cssFillUpStopperControlEl.getAttribute('preference'));
      cssFillUpStopperControlEl.setAttribute('checked', prefsService.getCharPref(cssFillUpStopperPrefEl.getAttribute('name')) === 'true' ? true : false);
      tagCompleteGroup = document.getElementById('tag-complete-group');
      tagCompleteGroup.addEventListener('keypress', eventsBag.onTagCompleteGroupKeyPress, false);
      return window.setTimeout((function() {
        return window.centerWindowOnScreen();
      }), 1);
    },
    onTagCompleteGroupKeyPress: function onTagCompleteGroupKeyPress(e) {
      var _a, _b, _c, _d, _e, _f, _g, _h, groupedState, i, j, rangeEnd, rangeStart, selectedRows, selection, selectionLength, tree;
      if (e.charCode === 32 && !e.altKey) {
        tree = document.getElementById('tag-complete-tree');
        selection = tree.view.selection;
        selectionLength = selection.getRangeCount();
        if (!(selectionLength)) {
          return false;
        }
        selectedRows = [];
        rangeStart = {};
        rangeEnd = {};
        _a = 0; _b = selectionLength;
        for (i = _a; (_a <= _b ? i < _b : i > _b); (_a <= _b ? i += 1 : i -= 1)) {
          selection.getRangeAt(i, rangeStart, rangeEnd);
          _c = rangeStart.value; _d = rangeEnd.value;
          for (j = _c; (_c <= _d ? j <= _d : j >= _d); (_c <= _d ? j += 1 : j -= 1)) {
            if (j >= 0) {
              selectedRows.push(j);
            }
          }
        }
        groupedState = true;
        _e = 0; _f = selectedRows.length;
        for (i = _e; (_e <= _f ? i < _f : i > _f); (_e <= _f ? i += 1 : i -= 1)) {
          groupedState = groupedState && tree.view.getCellValue(selectedRows[i], {}) === 'true';
          if (!(groupedState)) {
            break;
          }
        }
        _g = 0; _h = selectedRows.length;
        for (i = _g; (_g <= _h ? i < _h : i > _h); (_g <= _h ? i += 1 : i -= 1)) {
          tree.view.setCellValue(selectedRows[i], {}, groupedState ? 'false' : 'true');
        }
        return false;
      }
      return true;
    },
    onAccept: function onAccept() {
      var _a, _b, _c, _d, cell, prefEl, prefId, preferenceName, tagCompleteCells, tagCompleteTree;
      tagCompleteTree = document.getElementById('tag-complete-tree');
      tagCompleteCells = tagCompleteTree.getElementsByTagName('treecell');
      _a = []; _c = tagCompleteCells;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        cell = _c[_b];
        _a.push((function() {
          prefId = cell.getAttribute('preference');
          if (prefId.length) {
            prefEl = document.getElementById(prefId);
            if ((typeof prefEl !== "undefined" && prefEl !== null)) {
              preferenceName = prefEl.getAttribute('name');
              return prefsService.setCharPref(preferenceName, cell.getAttribute('value'));
            }
          }
        })());
      }
      return _a;
    }
  };
  $toolkit.trapExceptions(eventsBag);
  window.addEventListener('load', eventsBag.onLoad, false);
  window.addEventListener('dialogaccept', eventsBag.onAccept, false);
})();
