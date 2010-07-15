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
  lastEncodingName:       null
  lastEncodingLongName:   null
  lastEncodingPythonName: null
  lastEncodingUseBOM:     null
  lastNewlineEndings:     null

clearIndentation: ->
  indentationWidget: document.getElementById 'statusbar-indentation-button'
  indentationWidget.removeAttribute 'label'
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
      if view.getAttribute('type') is 'editor'
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
            lastIndentHardTabs: newIndentHardTabs
            lastIndentLevels:   newIndentLevels
            lastIndentTabWidth: newIndentTabWidth
        else
          clearIndentation()
      else
        clearEverything()
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

$toolkit.statusbar.updateViewEncoding: (pythonName) ->
  return if lastEncodingPythonName is pythonName
  return unless view: currentView()
  return unless newEncoding: encodingSvc.get_encoding_info pythonName
  viewEncoding: Cc['@activestate.com/koEncoding;1'].createInstance Ci.koIEncoding
  viewEncoding.python_encoding_name: pythonName
  viewEncoding.use_byte_order_marker: newEncoding.byte_order_marker and lastEncodingUseBOM
  warning:  view.document.languageObj.getEncodingWarning viewEncoding
  question: $toolkit.l10n('htmltoolkit').formatStringFromName 'areYouSureThatYouWantToChangeTheEncoding', [warning], 1
  if warning is '' or ko.dialogs.yesNo(question, 'No') is 'Yes'
    try
      view.document.encoding: viewEncoding
      view.lintBuffer.request()
      restartPolling { originalTarget: view }
    catch error
      lastErrorSvc: Cc['@activestate.com/koLastErrorService;1'].getService Ci.koILastErrorService
      errorCode:    lastErrorSvc.getLastErrorCode()
      errorMessage: lastErrorSvc.getLastErrorMessage()
      if errorCode is 0
        message: $toolkit.l10n('htmltoolkit').formatStringFromName 'internalErrorSettingTheEncoding', [view.document.displayPath, pythonName], 2
        ko.dialogs.internalError message, "$message\n\n$errorMessage", error
      else
        question: $toolkit.l10n('htmltoolkit').formatStringFromName 'forceEncodingConversion', [errorMessage], 1
        choice:   ko.dialogs.customButtons(
          question
          [
            "&${ applyButton:  $toolkit.l10n('htmltoolkit').GetStringFromName 'forceEncodingApplyButton' }"
            "&${ cancelButton: $toolkit.l10n('htmltoolkit').GetStringFromName 'forceEncodingCancelButton' }"
          ]
          cancelButton
        )
        if choice is applyButton
          try
            view.document.forceEncodingFromEncodingName pythonName
            restartPolling { originalTarget: view }
          catch error
            message: $toolkit.l10n('htmltoolkit').formatStringFromName 'internalErrorForcingTheEncoding', [view.document.displayPath, pythonName], 2
            ko.dialogs.internalError message, "$message\n\n$errorMessage", error

$toolkit.statusbar.updateViewEncodingBOM: ->
  return unless view: currentView()
  bomEl:  document.getElementById 'contextmenu_encodingUseBOM'
  wasBOM: bomEl.getAttribute('checked') is true
  return if lastEncodingUseBOM is useBOM: not wasBOM
  bomEl.setAttribute 'checked', useBOM
  view.document.encoding.use_byte_order_marker: useBOM
  view.document.isDirty: yes
  restartPolling { originalTarget: view }

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
    if lastNewlineEndings?
      itemsList[type].removeAttribute 'disabled'
      itemsList[type].setAttribute 'checked', if lastNewlineEndings is index then yes else no
    else
      itemsList[type].setAttribute 'disabled', yes
      itemsList[type].setAttribute 'checked', no
  convertEl: document.getElementById 'contextmenu_lineEndingsConvertExisting'
  if lastNewlineEndings?
    convertEl.removeAttribute 'disabled'
  else
    convertEl.setAttribute 'disabled', yes

$toolkit.statusbar.updateEncodingsMenu: ->
  encodingsMenu: document.getElementById 'statusbar-encodings-menu'
  unless encodingsBuilt
    popupEl: ko.widgets.getEncodingPopup encodingSvc.encoding_hierarchy, yes, 'window.extensions.htmlToolkit.statusbar.updateViewEncoding(this.getAttribute("data"));'
    updateClass: (node) ->
      node.setAttribute 'class', 'statusbar-label'
      node.setAttribute 'type', 'checkbox' if node.getAttribute('data')?
      updateClass(child) for child in node.childNodes if node.childNodes.length
    updateClass popupEl
    encodingsMenu.insertBefore popupEl.firstChild, (firstChild: or encodingsMenu.firstChild) while popupEl.childNodes.length
    encodingsBuilt: yes
  index: encodingSvc.get_encoding_index(lastEncodingPythonName) if lastEncodingPythonName?
  if index < 0
    itemEl: document.createElementNS XUL_NS, 'menuitem'
    itemEl.setAttribute 'data', lastEncodingPythonName
    itemEl.setAttribute 'label', lastEncodingLongName
    itemEl.setAttribute 'oncommand', 'window.extensions.htmlToolkit.statusbar.updateViewEncoding(this.getAttribute("data"));'
    encodingsMenu.insertBefore itemEl, encodingsMenu.firstChild
  updateChecked: (node) ->
    node.removeAttribute 'disabled'
    if (pythonName: node.getAttribute('data'))?
      node.setAttribute 'checked', if pythonName is lastEncodingPythonName then yes else no
    updateChecked(child) for child in node.childNodes if node.childNodes.length
  updateDisabled: (node) ->
    node.setAttribute('disabled', yes) if not node.childNodes.length
    if (pythonName: node.getAttribute('data'))?
      node.setAttribute 'checked', no
    updateDisabled(child) for child in node.childNodes if node.childNodes.length
  bomEl:        document.getElementById 'contextmenu_encodingUseBOM'
  lastEncoding: encodingSvc.get_encoding_info lastEncodingPythonName if lastEncodingPythonName?
  if lastEncoding?
    updateChecked(encodingsMenu)
  else
    updateDisabled(encodingsMenu)
  if lastEncoding?.byte_order_marker
    bomEl.removeAttribute 'disabled'
    bomEl.setAttribute 'checked', if lastEncodingUseBOM then yes else no
  else
    bomEl.setAttribute 'disabled', yes
    bomEl.setAttribute 'checked', no

$toolkit.statusbar.updateIndentationMenu: ->
  indentationMenu: document.getElementById 'statusbar-indentation-menu'
  unless indentationBuilt
    for levels in indentationsList
      itemEl: document.createElementNS XUL_NS, 'menuitem'
      itemEl.setAttribute 'class', 'statusbar-label'
      itemEl.setAttribute 'id', "contextmenu_indentation$levels"
      itemEl.setAttribute 'name', 'current_indentation'
      itemEl.setAttribute 'label', levels
      itemEl.setAttribute 'accesskey', levels
      itemEl.setAttribute 'type', 'checkbox'
      itemEl.setAttribute 'data-indent', levels
      itemEl.addEventListener 'command', ( -> $toolkit.statusbar.updateViewIndentation levels), null
      indentationMenu.insertBefore itemEl, (firstChild: or indentationMenu.firstChild)
    indentationBuilt: yes
  if lastIndentLevels?
    inList: no
    for itemEl in indentationMenu.childNodes
      itemEl.removeAttribute 'disabled'
      itemEl.setAttribute('checked', if Number(levels) is lastIndentLevels then (inList: yes) else no) if (levels: itemEl.getAttribute 'data-indent')?
    otherLevelEl: document.getElementById 'contextmenu_indentationOther'
    otherLevelEl.setAttribute('checked', if inList then no else yes)
    softTabsEl: document.getElementById 'contextmenu_indentationSoftTabs'
    softTabsEl.setAttribute('checked', if lastIndentHardTabs then no else yes)
  else
    for itemEl in indentationMenu.childNodes
      itemEl.setAttribute 'disabled', yes
      itemEl.setAttribute 'checked', no

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
