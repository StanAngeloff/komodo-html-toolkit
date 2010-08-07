view     = ko.views.manager and ko.views.manager.currentView
document = view and view.document
scimoz   = view and view.scimoz
session  = (this.__quickMacro_session or= {})
_ = __   = scimoz and scimoz.selText

print = (string) ->
  scimoz.insertText(scimoz.currentPos, string);
  scimoz.anchor = scimoz.currentPos += string.length

_ = "contents"

if __ and _ isnt __
  scimoz.beginUndoAction()
  anchor = Math.min scimoz.anchor, scimoz.currentPos
  try
    scimoz.replaceSel _
    scimoz.currentPos = Math.max scimoz.anchor, scimoz.currentPos
    scimoz.anchor = anchor
    try
      scimoz.focus = yes
    catch e
      scimoz.isFocused = yes
  finally
    scimoz.endUndoAction()
