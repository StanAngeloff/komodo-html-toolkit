(function(){
  var $toolkit, eventsBag, prefsBranch, prefsService, recentKomodoWindow, windowManagerService;
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
  windowManagerService = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
  recentKomodoWindow = windowManagerService.getMostRecentWindow('Komodo');
  $toolkit = recentKomodoWindow.extensions.htmlToolkit;
  prefsService = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService);
  prefsBranch = prefsService.getBranch('extensions.htmltoolkit.');
  eventsBag = {
    onLoad: function() {
      var abbreviationReplaceExpandControlEl, abbreviationReplaceExpandPrefEl, cssFillUpStopperControlEl, cssFillUpStopperPrefEl, tagCompleteGroup;
      prefsService.QueryInterface(Ci.nsIPrefBranch2);
      abbreviationReplaceExpandControlEl = document.getElementById('abbreviation-replace-expand-control');
      abbreviationReplaceExpandPrefEl = document.getElementById(abbreviationReplaceExpandControlEl.getAttribute('preference'));
      abbreviationReplaceExpandControlEl.setAttribute('checked', prefsService.getCharPref(abbreviationReplaceExpandPrefEl.getAttribute('name')) === 'true' ? true : false);
      cssFillUpStopperControlEl = document.getElementById('css-fillup-stopper-control');
      cssFillUpStopperPrefEl = document.getElementById(cssFillUpStopperControlEl.getAttribute('preference'));
      cssFillUpStopperControlEl.setAttribute('checked', prefsService.getCharPref(cssFillUpStopperPrefEl.getAttribute('name')) === 'true' ? true : false);
      tagCompleteGroup = document.getElementById('tag-complete-group');
      tagCompleteGroup.addEventListener('keypress', eventsBag.onTagCompleteGroupKeyPress, false);
      abbreviationReplaceExpandControlEl.label = abbreviationReplaceExpandControlEl.label.replace('keybinding', recentKomodoWindow.gKeybindingMgr.command2key['cmd_expandAbbrev'] || $toolkit.l10n('pref/htmltoolkit').GetStringFromName('noKeybinding'));
      return window.setTimeout((function() {
        return window.centerWindowOnScreen();
      }), 1);
    },
    onTagCompleteGroupKeyPress: function(e) {
      var _a, _b, _c, _d, groupedState, i, j, rangeEnd, rangeStart, selectedRows, selection, selectionLength, tree;
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
        for (i = 0; (0 <= selectionLength ? i < selectionLength : i > selectionLength); (0 <= selectionLength ? i += 1 : i -= 1)) {
          selection.getRangeAt(i, rangeStart, rangeEnd);
          (_a = rangeStart.value); (_b = rangeEnd.value);
          for (j = _a; (_a <= _b ? j <= _b : j >= _b); (_a <= _b ? j += 1 : j -= 1)) {
            if (j >= 0) {
              selectedRows.push(j);
            }
          }
        }
        groupedState = true;
        (_c = selectedRows.length);
        for (i = 0; (0 <= _c ? i < _c : i > _c); (0 <= _c ? i += 1 : i -= 1)) {
          groupedState = groupedState && tree.view.getCellValue(selectedRows[i], {}) === 'true';
          if (!(groupedState)) {
            break;
          }
        }
        (_d = selectedRows.length);
        for (i = 0; (0 <= _d ? i < _d : i > _d); (0 <= _d ? i += 1 : i -= 1)) {
          tree.view.setCellValue(selectedRows[i], {}, groupedState ? 'false' : 'true');
        }
        return false;
      }
      return true;
    },
    onAccept: function() {
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
            if (typeof prefEl !== "undefined" && prefEl !== null) {
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
