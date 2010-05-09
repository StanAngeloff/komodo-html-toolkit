(function(){
  var $toolkit, compileMacro, ko, languageEl, macroBufferEl, originalIndent, originalTabWidth, originalUseTabs, partService, prefsBranch, prefsService, switchLanguage;
  xtk.include('domutils');
  $toolkit = window.opener.extensions.htmlToolkit;
  ko = window.opener.ko;
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  prefsService = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService);
  prefsBranch = prefsService.getBranch('extensions.htmltoolkit.');
  partService = Cc['@activestate.com/koPartService;1'].getService(Ci.koIPartService);
  const cToolboxFolderName = 'Quick Macros';
  const cLastMacroContents = 'quickMacro.lastMacro.contents';
  const cLastMacroLanguage = 'quickMacro.lastMacro.language';
  macroBufferEl = null;
  languageEl = null;
  originalTabWidth = null;
  originalIndent = null;
  originalUseTabs = null;
  this.onDialogLoad = function onDialogLoad() {
    var dialogEl, lastMacroContents, lastMacroLanguage;
    dialogEl = document.getElementById('quick-macro');
    dialogEl.addEventListener('keypress', function(e) {
      if (e.keyCode === 13 && (e.metaKey || e.ctrlKey) && !(e.shiftKey || e.altKey)) {
        e.stopPropagation();
        e.preventDefault();
        return dialogEl.acceptDialog();
      }
    }, true);
    macroBufferEl = document.getElementById('macro-buffer');
    scintillaOverlayOnLoad();
    try {
      lastMacroContents = prefsBranch.getCharPref(cLastMacroContents);
      lastMacroLanguage = prefsBranch.getCharPref(cLastMacroLanguage);
    } catch (e) {
      lastMacroContents = '';
      lastMacroLanguage = 'coffeescript';
    }
    macroBufferEl.initWithBuffer(lastMacroContents, 'JavaScript');
    macroBufferEl.scimoz.scrollWidth = 1;
    macroBufferEl.scimoz.gotoLine(macroBufferEl.scimoz.lineCount - 1);
    macroBufferEl.scimoz.anchor = 0;
    macroBufferEl.scimoz.currentPos = macroBufferEl.scimoz.length;
    originalTabWidth = macroBufferEl.scimoz.tabWidth;
    originalIndent = macroBufferEl.scimoz.indent;
    originalUseTabs = macroBufferEl.scimoz.useTabs;
    languageEl = document.getElementById('language');
    languageEl.selectedItem = document.getElementById(("language-" + lastMacroLanguage));
    switchLanguage(lastMacroLanguage);
    return macroBufferEl.scintilla.focus();
  };
  this.onDialogAccept = function onDialogAccept() {
    var macroContents, macroLanguage, macroPart, quickMacroFolders;
    macroContents = macroBufferEl.scimoz.text;
    macroLanguage = languageEl.selectedItem.getAttribute('id').split('-').pop();
    prefsBranch.setCharPref(cLastMacroContents, macroContents);
    prefsBranch.setCharPref(cLastMacroLanguage, macroLanguage);
    quickMacroFolders = partService.getParts('folder', 'name', cToolboxFolderName, '*', partService.currentProject, {});
    if (!quickMacroFolders.length) {
      quickMacroFolders[0] = partService.toolbox.project.createPartFromType('folder');
      quickMacroFolders[0].type = 'folder';
      quickMacroFolders[0].setStringAttribute('name', cToolboxFolderName);
      ko.toolboxes.user.addItem(quickMacroFolders[0]);
    }
    macroPart = partService.toolbox.project.createPartFromType('macro');
    macroPart.setStringAttribute('name', ("(" + (window.arguments[0] + 1) + ") ") + macroContents.replace(/[\\\/:\*\?<>\|"']+/g, '').replace(/\s+/g, ' ').substr(0, 64));
    macroPart.setStringAttribute('language', 'JavaScript');
    macroPart.setBooleanAttribute('trigger_enabled', false);
    macroPart.setBooleanAttribute('async', false);
    macroPart.setLongAttribute('rank', 100);
    try {
      macroPart.value = compileMacro(macroContents, macroLanguage);
    } catch (e) {
      alert(e);
      return false;
    }
    macroPart.iconurl = 'chrome://htmltoolkit/skin/images/icon_quick_macro.png';
    ko.projects.addItem(macroPart, quickMacroFolders[0]);
    if (macroPart.project == ko.toolboxes.user.toolbox)
    ko.toolboxes.user.save();
    window.arguments[1].part = macroPart;
    return true;
  };
  this.onDialogUnload = function onDialogUnload() {
    return macroBufferEl.close();
  };
  switchLanguage = function switchLanguage(language) {
    if (language === 'coffeescript') {
      macroBufferEl.scimoz.tabWidth = 2;
      macroBufferEl.scimoz.indent = 2;
      macroBufferEl.scimoz.useTabs = false;
      return macroBufferEl.scimoz.useTabs;
    } else if (language === 'javascript') {
      macroBufferEl.scimoz.tabWidth = originalTabWidth;
      macroBufferEl.scimoz.indent = originalIndent;
      macroBufferEl.scimoz.useTabs = originalUseTabs;
      return macroBufferEl.scimoz.useTabs;
    }
  };
  compileMacro = function compileMacro(contents, language) {
    var _a, _b, code, templateFile, templatePath;
    templatePath = '/content/library/command/quickMacro.js';
    templateFile = $toolkit.io.getRelativeURI(templatePath, true);
    language === 'coffeescript' ? (contents = CoffeeScript.compile(contents)) : (contents = ("(function() {\n" + contents + "\n})();"));
    contents = contents.replace(/\s+$/, '').split(/[\r\n|\r|\n]+/);
    (_a = contents)[-2 + _a.length] = ("return " + ((_b = contents)[-2 + _b.length]));
    code = $toolkit.io.readEntireFile(templateFile);
    code = code.replace('"contents";', contents.join('\n'), 'g');
    return code;
  };
})();
