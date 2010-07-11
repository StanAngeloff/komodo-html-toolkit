root: this
root.extensions: or {}
$toolkit: root.extensions.htmlToolkit: or {}

`const Cc = Components.classes`
`const Ci = Components.interfaces`

`const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'`

`const POLLING_INTERVAL = 1000`

encodingSvc: Cc['@activestate.com/koEncodingServices;1'].getService Ci.koIEncodingServices

pollingTimer:           null

newlineEndings:         ['LF', 'CR', 'CRLF']

indentationBuilt:       no
indentationsList:       [2, 3, 4, 8]
encodingsBuilt:         no

lastEncodingName:       null
lastEncodingLongName:   null
lastEncodingPythonName: null
lastEncodingUseBOM:     null
lastNewlineEndings:     null

lastIndentHardTabs:     null
lastIndentLevels:       null
lastIndentTabWidth:     null

clearEncoding: ->
  encodingWidget: document.getElementById 'statusbar-new-encoding-button'
  encodingWidget.removeAttribute 'label'
  encodingWidget.setAttribute    'collapsed', 'true'
  lastEncodingName:   null
  lastEncodingUseBOM: null

clearIndentation: ->
  indentationWidget: document.getElementById 'statusbar-indentation-button'
  indentationWidget.removeAttribute 'label'
  indentationWidget.setAttribute    'collapsed', 'true'
  lastIndentHardTabs: null
  lastIndentLevels:   null
  lastIndentTabWidth: null

clearEverything: ->
  clearEncoding()
  clearIndentation()

startPolling: (view) ->
  block: ->
    return clearEverything() unless view?.document
    try
      if view.getAttribute('type') is 'startpage'
        clearEverything()
      else
        newEncodingName:       view.document.encoding.short_encoding_name
        newEncodingPythonName: view.document.encoding.python_encoding_name
        newEncodingLongName:   view.document.encoding.friendly_encoding_name
        newEncodingUseBOM:     view.document.encoding.use_byte_order_marker
        newNewlineEndings:     view.document.new_line_endings
        if lastEncodingName       isnt newEncodingName \
        or lastEncodingPythonName isnt newEncodingPythonName \
        or lastEncodingLongName   isnt newEncodingLongName \
        or lastEncodingUseBOM     isnt newEncodingUseBOM \
        or lastNewlineEndings     isnt newNewlineEndings
          encodingButtonText: newEncodingName
          encodingButtonText: + '+BOM' if newEncodingUseBOM
          encodingButtonText: + ": ${ newlineEndings[newNewlineEndings] }"
          encodingWidget: document.getElementById 'statusbar-new-encoding-button'
          encodingWidget.setAttribute    'label', encodingButtonText
          encodingWidget.removeAttribute 'collapsed'
          lastEncodingName:       newEncodingName
          lastEncodingPythonName: newEncodingPythonName
          lastEncodingLongName:   newEncodingLongName
          lastEncodingUseBOM:     newEncodingUseBOM
          lastNewlineEndings:     newNewlineEndings
        if view.scimoz
          newIndentHardTabs: view.scimoz.useTabs
          newIndentLevels:   view.scimoz.indent
          newIndentTabWidth: view.scimoz.tabWidth
          if lastIndentHardTabs isnt newIndentHardTabs \
          or lastIndentLevels   isnt newIndentLevels \
          or lastIndentTabWidth isnt newIndentTabWidth
            indentationButtonText: "${ if newIndentHardTabs then 'Tabs' else 'Soft Tabs' }: "
            indentationButtonText: + newIndentLevels
            indentationButtonText: + " [$newIndentTabWidth]" if newIndentLevels isnt newIndentTabWidth
            indentationWidget: document.getElementById 'statusbar-indentation-button'
            indentationWidget.setAttribute    'label', indentationButtonText
            indentationWidget.removeAttribute 'collapsed'
            lastIndentHardTabs: newIndentHardTabs
            lastIndentLevels:   newIndentLevels
            lastIndentTabWidth: newIndentTabWidth
        else
          clearIndentation()
    catch e
      clearEverything()
  block()
  pollingTimer: setInterval block, POLLING_INTERVAL
  id: pollingTimer

stopPolling: ->
  return unless pollingTimer
  clearInterval pollingTimer
  pollingTimer: null

stopPollingAndClear: ->
  stopPolling()
  clearEverything()

restartPolling: (event) ->
  return if ko.views.manager.batchMode
  stopPolling()
  startPolling event.originalTarget

events: {
  'current_view_changed': restartPolling
  'view_closed':          stopPollingAndClear
}

currentView: ->
  view: ko.views.manager?.currentView
  if view and view.getAttribute('type') is 'editor' and view.document and view.scimoz then view else false

root.addEventListener eventName, eventHandler, true for eventName, eventHandler of events
ko.main.addWillCloseHandler -> root.removeEventListener eventName, eventHandler, true for eventName, eventHandler of events

$toolkit.statusbar: or {}

$toolkit.statusbar.updateViewLineEndings: (mode) ->
  return if lastNewlineEndings is mode
  return unless view: currentView()
  view.document.new_line_endings: mode
  view.document.prefs.setStringPref 'endOfLine', newlineEndings[mode]
  restartPolling { originalTarget: view }

$toolkit.statusbar.updateViewExistingEndings: ->
  return unless view: currentView()
  view.document.existing_line_endings: lastNewlineEndings

$toolkit.statusbar.updateViewIndentation: (levels) ->
  return if levels is lastIndentLevels
  return unless view: currentView()
  view.scimoz.tabWidth: view.scimoz.indent: levels
  view.document.prefs.setLongPref 'indentWidth', levels
  view.document.prefs.setLongPref 'tabWidth', levels
  restartPolling { originalTarget: view }

$toolkit.statusbar.updateViewHardTabs: (useTabs) ->
  return if useTabs is lastIndentHardTabs
  return unless view: currentView()
  view.scimoz.useTabs: useTabs
  view.document.prefs.setBooleanPref 'useTabs', useTabs
  restartPolling { originalTarget: view }

$toolkit.statusbar.updateLineEndingsMenu: ->
  lineEndingsMenu: document.getElementById 'statusbar-line-endings-menu'
  itemsList:       {
    LF:   document.getElementById 'contextmenu_lineEndingsUnix'
    CR:   document.getElementById 'contextmenu_lineEndingsMac'
    CRLF: document.getElementById 'contextmenu_lineEndingsDOSWindows'
  }
  for type, index in newlineEndings
    itemsList[type].setAttribute 'checked', if lastNewlineEndings is index then yes else no

$toolkit.statusbar.updateEncodingsMenu: ->
  encodingsMenu: document.getElementById 'statusbar-encodings-menu'
  unless encodingsBuilt
    index:   encodingSvc.get_encoding_index lastEncodingPythonName
    popupEl: ko.widgets.getEncodingPopup encodingSvc.encoding_hierarchy, yes, 'alert(this)'
    if index < 0
      itemEl: document.createElementNS XUL_NS, 'menuitem'
      itemEl.setAttribute 'data', lastEncodingPythonName
      itemEl.setAttribute 'label', lastEncodingLongName
      itemEl.setAttribute 'oncommand', 'alert(this)'
      popupEl.insertBefore itemEl, popupEl.firstChild
    updateClass: (node) ->
      node.setAttribute 'class', 'statusbar-label'
      node.setAttribute 'type', 'checkbox' if node.getAttribute('data')?
      updateClass(child) for child in node.childNodes if node.childNodes.length
    updateClass popupEl
    encodingsMenu.appendChild popupEl.firstChild while popupEl.childNodes.length
    encodingsBuilt: yes
  updateChecked: (node) ->
    if (pythonName: node.getAttribute('data'))?
      node.setAttribute 'checked', if pythonName is lastEncodingPythonName then yes else no
    updateChecked(child) for child in node.childNodes if node.childNodes.length
  updateChecked encodingsMenu

$toolkit.statusbar.updateIndentationMenu: ->
  indentationMenu: document.getElementById 'statusbar-indentation-menu'
  unless indentationBuilt
    firstChild: indentationMenu.firstChild
    for levels in indentationsList
      itemEl: document.createElementNS XUL_NS, 'menuitem'
      itemEl.setAttribute 'class', 'statusbar-label'
      itemEl.setAttribute 'id', "contextmenu_indentation$levels"
      itemEl.setAttribute 'name', 'current_indentation'
      itemEl.setAttribute 'label', levels
      itemEl.setAttribute 'accesskey', levels
      itemEl.setAttribute 'type', 'checkbox'
      itemEl.setAttribute 'data-indent', levels
      itemEl.addEventListener 'command', ->
        $toolkit.statusbar.updateViewIndentation levels
      , null
      indentationMenu.insertBefore itemEl, firstChild
    indentationBuilt: yes
  inList: no
  for itemEl in indentationMenu.childNodes when (levels: itemEl.getAttribute 'data-indent')?
    itemEl.setAttribute('checked', if Number(levels) is lastIndentLevels then (inList: yes) else no)
  otherLevelEl: document.getElementById 'contextmenu_indentationOther'
  otherLevelEl.setAttribute('checked', if inList then no else yes)
  softTabsEl: document.getElementById 'contextmenu_indentationSoftTabs'
  softTabsEl.setAttribute('checked', if lastIndentHardTabs then no else yes)

$toolkit.statusbar.showCustomIndentationPanel: ->
  return unless view: currentView()
  scaleEl: document.getElementById 'customIndentation_scale'
  scaleEl.setAttribute 'value', lastIndentLevels
  panelEl:    document.getElementById 'customIndentation_panel'
  relativeEl: document.getElementById 'statusbarviewbox'
  panelEl.openPopup relativeEl, 'before_end', - document.getElementById('statusbar-language').boxObject.width - 10, 0

$toolkit.statusbar.handleCustomIndentationPanelKey: (event) ->
  return unless event.keyCode in [event.DOM_VK_ENTER, event.DOM_VK_RETURN]
  event.preventDefault()
  event.stopPropagation()
  scaleEl: document.getElementById 'customIndentation_scale'
  panelEl: document.getElementById 'customIndentation_panel'
  panelEl.hidePopup()
  $toolkit.statusbar.updateViewIndentation Number(scaleEl.getAttribute 'value')

$toolkit.statusbar.updateSoftTabs: ->
  softTabsEl: document.getElementById 'contextmenu_indentationSoftTabs'
  $toolkit.statusbar.updateViewHardTabs softTabsEl.getAttribute('checked') isnt 'true'
