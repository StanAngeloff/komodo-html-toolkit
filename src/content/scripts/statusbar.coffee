root: this
root.extensions: or {}
$toolkit: root.extensions.htmlToolkit: or {}

`const POLLING_INTERVAL = 1000`

pollingTimer:       null

encodingWidget:     null
indentationWidget:  null

lastEncodingName:   null
lastEncodingUseBOM: null
lastNewlineEndings: null

newlineEndings:     ['LF', 'CR', 'CRLF']

lastIndentHardTabs: null
lastIndentLevels:   null
lastIndentTabWidth: null

getEncodingButton: ->
  encodingWidget: or document.getElementById 'statusbar-new-encoding-button'

getIndentationButton: ->
  indentationWidget: or document.getElementById 'statusbar-indentation-button'

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
