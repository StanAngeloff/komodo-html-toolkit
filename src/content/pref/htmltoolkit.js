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
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, groupedState, i, j, rangeEnd, rangeStart, selectedRows, selection, selectionLength, tree;
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
        _c = 0; _d = selectionLength;
        for (_b = 0, i = _c; (_c <= _d ? i < _d : i > _d); (_c <= _d ? i += 1 : i -= 1), _b++) {
          selection.getRangeAt(i, rangeStart, rangeEnd);
          _g = rangeStart.value; _h = rangeEnd.value;
          for (_f = 0, j = _g; (_g <= _h ? j <= _h : j >= _h); (_g <= _h ? j += 1 : j -= 1), _f++) {
            if (j >= 0) {
              selectedRows.push(j);
            }
          }
        }
        groupedState = true;
        _k = 0; _l = selectedRows.length;
        for (_j = 0, i = _k; (_k <= _l ? i < _l : i > _l); (_k <= _l ? i += 1 : i -= 1), _j++) {
          groupedState = groupedState && tree.view.getCellValue(selectedRows[i], {}) === 'true';
          if (!(groupedState)) {
            break;
          }
        }
        _o = 0; _p = selectedRows.length;
        for (_n = 0, i = _o; (_o <= _p ? i < _p : i > _p); (_o <= _p ? i += 1 : i -= 1), _n++) {
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
      _a = []; _b = tagCompleteCells;
      for (_c = 0, _d = _b.length; _c < _d; _c++) {
        cell = _b[_c];
        _a.push((function() {
          prefId = cell.getAttribute('preference');
          if (prefId.length) {
            prefEl = document.getElementById(prefId);
            if ((typeof prefEl !== "undefined" && prefEl !== null)) {
              preferenceName = prefEl.getAttribute('name');
              return prefsService.setCharPref(preferenceName, cell.getAttribute('value'));
            }
          }
        }).call(this));
      }
      return _a;
    }
  };
  $toolkit.trapExceptions(eventsBag);
  window.addEventListener('load', eventsBag.onLoad, false);
  window.addEventListener('dialogaccept', eventsBag.onAccept, false);
})();
