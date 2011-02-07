(function() {
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';  var $toolkit, eventsBag, prefsBranch, prefsService, recentKomodoWindow, windowManagerService;
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
      var groupedState, i, j, rangeEnd, rangeStart, selectedRows, selection, selectionLength, tree, _ref, _ref2, _ref3, _ref4;
      if (e.charCode === 32 && !e.altKey) {
        tree = document.getElementById('tag-complete-tree');
        selection = tree.view.selection;
        selectionLength = selection.getRangeCount();
        if (!selectionLength) {
          return false;
        }
        selectedRows = [];
        rangeStart = {};
        rangeEnd = {};
        for (i = 0; (0 <= selectionLength ? i < selectionLength : i > selectionLength); (0 <= selectionLength ? i += 1 : i -= 1)) {
          selection.getRangeAt(i, rangeStart, rangeEnd);
          for (j = _ref = rangeStart.value, _ref2 = rangeEnd.value; (_ref <= _ref2 ? j <= _ref2 : j >= _ref2); (_ref <= _ref2 ? j += 1 : j -= 1)) {
            if (j >= 0) {
              selectedRows.push(j);
            }
          }
        }
        groupedState = true;
        for (i = 0, _ref3 = selectedRows.length; (0 <= _ref3 ? i < _ref3 : i > _ref3); (0 <= _ref3 ? i += 1 : i -= 1)) {
          groupedState && (groupedState = tree.view.getCellValue(selectedRows[i], {}) === 'true');
          if (!groupedState) {
            break;
          }
        }
        for (i = 0, _ref4 = selectedRows.length; (0 <= _ref4 ? i < _ref4 : i > _ref4); (0 <= _ref4 ? i += 1 : i -= 1)) {
          tree.view.setCellValue(selectedRows[i], {}, groupedState ? 'false' : 'true');
        }
        return false;
      }
      return true;
    },
    onAccept: function() {
      var cell, prefEl, prefId, preferenceName, tagCompleteCells, tagCompleteTree, _i, _len, _results;
      tagCompleteTree = document.getElementById('tag-complete-tree');
      tagCompleteCells = tagCompleteTree.getElementsByTagName('treecell');
      _results = [];
      for (_i = 0, _len = tagCompleteCells.length; _i < _len; _i++) {
        cell = tagCompleteCells[_i];
        prefId = cell.getAttribute('preference');
        _results.push(prefId.length ? (prefEl = document.getElementById(prefId), prefEl != null ? (preferenceName = prefEl.getAttribute('name'), prefsService.setCharPref(preferenceName, cell.getAttribute('value'))) : void 0) : void 0);
      }
      return _results;
    }
  };
  $toolkit.trapExceptions(eventsBag);
  window.addEventListener('load', eventsBag.onLoad, false);
  window.addEventListener('dialogaccept', eventsBag.onAccept, false);
}).call(this);
