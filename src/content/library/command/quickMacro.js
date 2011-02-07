(function() {
  var anchor, document, print, scimoz, session, view, _, __;
  view = ko.views.manager && ko.views.manager.currentView;
  document = view && view.document;
  scimoz = view && view.scimoz;
  session = (this.__quickMacro_session || (this.__quickMacro_session = {}));
  _ = __ = scimoz && scimoz.selText;
  print = function(string) {
    scimoz.insertText(scimoz.currentPos, string);
    return scimoz.anchor = scimoz.currentPos += string.length;
  };
  _ = "contents";
  if (__ && _ !== __) {
    scimoz.beginUndoAction();
    anchor = Math.min(scimoz.anchor, scimoz.currentPos);
    try {
      scimoz.replaceSel(_);
      scimoz.currentPos = Math.max(scimoz.anchor, scimoz.currentPos);
      scimoz.anchor = anchor;
      try {
        scimoz.focus = true;
      } catch (e) {
        scimoz.isFocused = true;
      }
    } finally {
      scimoz.endUndoAction();
    }
  }
}).call(this);
