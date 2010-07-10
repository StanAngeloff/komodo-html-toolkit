root: this
root.extensions: or {}
$toolkit: root.extensions.htmlToolkit: or {}

`const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'`

`const POLLING_INTERVAL = 1000`

pollingTimer:       null

encodingWidget:     null

indentationWidget:  null
indentationMenu:    null
indentationBuilt:   false

lastEncodingName:   null
lastEncodingUseBOM: null
lastNewlineEndings: null

newlineEndings:     ['LF', 'CR', 'CRLF']
indentationsList:   [2, 3, 4, 8]

lastIndentHardTabs: null
lastIndentLevels:   null
lastIndentTabWidth: null

getEncodingButton: ->
  encodingWidget: or document.getElementById 'statusbar-new-encoding-button'

getIndentationButton: ->
  indentationWidget: or document.getElementById 'statusbar-indentation-button'

getIndentationMenu: ->
  indentationMenu: or document.getElementById 'statusbar-indentation-menu'

clearEncoding: ->
  getEncodingButton().removeAttribute 'label'
  getEncodingButton().setAttribute    'collapsed', 'true'
  lastEncodingName:   null
  lastEncodingUseBOM: null

clearIndentation: ->
  getIndentationButton().removeAttribute 'label'
  getIndentationButton().setAttribute    'collapsed', 'true'
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
      if view.getAttribute 'type' is 'startpage'
        clearEverything()
      else

        newEncodingName:   view.document.encoding.short_encoding_name
        newEncodingUseBOM: view.document.encoding.use_byte_order_marker
        newNewlineEndings: view.document.new_line_endings
        if lastEncodingName   isnt newEncodingName \
        or lastEncodingUseBOM isnt newEncodingUseBOM \
        or lastNewlineEndings isnt newNewlineEndings
          encodingButtonText: newEncodingName
          encodingButtonText: + '+BOM' if newEncodingUseBOM
          encodingButtonText: + ": ${ newlineEndings[newNewlineEndings] }"
          getEncodingButton().setAttribute    'label', encodingButtonText
          getEncodingButton().removeAttribute 'collapsed'
          lastEncodingName:   newEncodingName
          lastEncodingUseBOM: newEncodingUseBOM
          lastNewlineEndings: newNewlineEndings

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
            getIndentationButton().setAttribute    'label', indentationButtonText
            getIndentationButton().removeAttribute 'collapsed'
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

root.addEventListener eventName, eventHandler, true for eventName, eventHandler of events
ko.main.addWillCloseHandler -> root.removeEventListener eventName, eventHandler, true for eventName, eventHandler of events

$toolkit.statusbar: or {}

$toolkit.statusbar.updateViewIndentation: (levels) ->
  view: ko.views.manager?.currentView
  return unless view and view.getAttribute('type') is 'editor' and view.document and view.scimoz
  view.scimoz.tabWidth: view.scimoz.indent: levels
  view.document.prefs.setLongPref 'indentWidth', levels
  view.document.prefs.setLongPref 'tabWidth', levels
  restartPolling { originalTarget: view }

$toolkit.statusbar.updateViewHardTabs: (useTabs) ->
  view: ko.views.manager?.currentView
  return unless view and view.getAttribute('type') is 'editor' and view.document and view.scimoz
  view.scimoz.useTabs: useTabs
  view.document.prefs.setBooleanPref 'useTabs', useTabs
  restartPolling { originalTarget: view }

$toolkit.statusbar.updateIndentationMenu: ->
  indentationMenu: getIndentationMenu()
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

$toolkit.statusbar.updateSoftTabs: ->
  softTabsEl: document.getElementById 'contextmenu_indentationSoftTabs'
  $toolkit.statusbar.updateViewHardTabs softTabsEl.getAttribute('checked') isnt 'true'
