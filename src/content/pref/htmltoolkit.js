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
      return window.setTimeout(((centerWindow = function centerWindow() {
        return window.centerWindowOnScreen();
      })), 1);
    },
    onTagCompleteGroupKeyPress: function onTagCompleteGroupKeyPress(e) {
      var __a, __b, __c, __d, __e, __f, __g, __h, __i, __j, __k, __l, __m, __n, __o, __p, groupedState, i, j, rangeEnd, rangeStart, selectedRows, selection, selectionLength, tree;
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
        __c = 0; __d = selectionLength;
        for (__b=0, i=__c; (__c <= __d ? i < __d : i > __d); (__c <= __d ? i += 1 : i -= 1), __b++) {
          selection.getRangeAt(i, rangeStart, rangeEnd);
          __g = rangeStart.value; __h = rangeEnd.value;
          for (__f=0, j=__g; (__g <= __h ? j <= __h : j >= __h); (__g <= __h ? j += 1 : j -= 1), __f++) {
            if (j >= 0) {
              selectedRows.push(j);
            }
          }
        }
        groupedState = true;
        __k = 0; __l = selectedRows.length;
        for (__j=0, i=__k; (__k <= __l ? i < __l : i > __l); (__k <= __l ? i += 1 : i -= 1), __j++) {
          groupedState = groupedState && tree.view.getCellValue(selectedRows[i], {
          }) === 'true';
          if (!(groupedState)) {
            break;
          }
        }
        __o = 0; __p = selectedRows.length;
        for (__n=0, i=__o; (__o <= __p ? i < __p : i > __p); (__o <= __p ? i += 1 : i -= 1), __n++) {
          tree.view.setCellValue(selectedRows[i], {
          }, groupedState ? 'false' : 'true');
        }
        return false;
      }
      return true;
    },
    onAccept: function onAccept() {
      var __a, __b, __c, cell, prefEl, prefId, preferenceName, tagCompleteCells, tagCompleteTree;
      tagCompleteTree = document.getElementById('tag-complete-tree');
      tagCompleteCells = tagCompleteTree.getElementsByTagName('treecell');
      __a = []; __b = tagCompleteCells;
      for (__c = 0; __c < __b.length; __c++) {
        cell = __b[__c];
        __a.push((function() {
          prefId = cell.getAttribute('preference');
          if ((prefId.length)) {
            prefEl = document.getElementById(prefId);
            if (((typeof prefEl !== "undefined" && prefEl !== null))) {
              preferenceName = prefEl.getAttribute('name');
              return prefsService.setCharPref(preferenceName, cell.getAttribute('value'));
            }
          }
        }).call(this));
      }
      return __a;
    }
  };
  $toolkit.trapExceptions(eventsBag);
  window.addEventListener('load', eventsBag.onLoad, false);
  window.addEventListener('dialogaccept', eventsBag.onAccept, false);
})();
