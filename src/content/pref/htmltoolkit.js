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
      var centerWindow, tagCompleteGroup;
      prefsService.QueryInterface(Ci.nsIPrefBranch2);
      tagCompleteGroup = document.getElementById('tag-complete-group');
      tagCompleteGroup.addEventListener('keypress', eventsBag.onTagCompleteGroupKeyPress, false);
      return window.setTimeout((centerWindow = function centerWindow() {
        return window.centerWindowOnScreen();
      }), 1);
    },
    onTagCompleteGroupKeyPress: function onTagCompleteGroupKeyPress(e) {
      var __a, __b, __c, __d, __e, __f, __g, __h, __i, __j, __k, __l, __m, __n, __o, __p, __q, __r, __s, __t, groupedState, i, j, rangeEnd, rangeStart, selectedRows, selection, selectionLength, tree;
      if (e.charCode === 32 && !e.altKey) {
        tree = document.getElementById('tag-complete-tree');
        selection = tree.view.selection;
        selectionLength = selection.getRangeCount();
        if (!(selectionLength)) {
          return false;
        }
        selectedRows = [];
        rangeStart = {
        };
        rangeEnd = {
        };
        __d = 0;
        __e = selectionLength;
        for (__c=0, i=__d; (__d <= __e ? i < __e : i > __e); (__d <= __e ? i += 1 : i -= 1), __c++) {
          selection.getRangeAt(i, rangeStart, rangeEnd);
          __i = rangeStart.value;
          __j = rangeEnd.value + 1;
          for (__h=0, j=__i; (__i <= __j ? j < __j : j > __j); (__i <= __j ? j += 1 : j -= 1), __h++) {
            if (j >= 0) {
              selectedRows.push(j);
            }
          }
        }
        groupedState = true;
        __n = 0;
        __o = selectedRows.length;
        for (__m=0, i=__n; (__n <= __o ? i < __o : i > __o); (__n <= __o ? i += 1 : i -= 1), __m++) {
          groupedState = groupedState && tree.view.getCellValue(selectedRows[i], {
          }) === 'true';
          if (!(groupedState)) {
            break;
          }
        }
        __s = 0;
        __t = selectedRows.length;
        for (__r=0, i=__s; (__s <= __t ? i < __t : i > __t); (__s <= __t ? i += 1 : i -= 1), __r++) {
          tree.view.setCellValue(selectedRows[i], {
          }, groupedState ? 'false' : 'true');
        }
        return false;
      }
      return true;
    },
    onAccept: function onAccept() {
      var __a, __b, __c, __d, cell, prefEl, prefId, preferenceName, tagCompleteCells, tagCompleteTree;
      tagCompleteTree = document.getElementById('tag-complete-tree');
      tagCompleteCells = tagCompleteTree.getElementsByTagName('treecell');
      __a = tagCompleteCells;
      __c = [];
      for (__b in __a) {
        if (__a.hasOwnProperty(__b)) {
          cell = __a[__b];
          __d = (function() {
            prefId = cell.getAttribute('preference');
            if ((prefId.length)) {
              prefEl = document.getElementById(prefId);
              if (((typeof prefEl !== "undefined" && prefEl !== null))) {
                preferenceName = prefEl.getAttribute('name');
                return prefsService.setCharPref(preferenceName, cell.getAttribute('value'));
              }
            }
          })();
          __c.push(__d);
        }
      }
      return __c;
    }
  };
  $toolkit.trapExceptions(eventsBag);
  window.addEventListener('load', eventsBag.onLoad, false);
  window.addEventListener('dialogaccept', eventsBag.onAccept, false);
})();
