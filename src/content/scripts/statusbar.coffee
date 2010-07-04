root: this
root.extensions: or {}
$toolkit: root.extensions.htmlToolkit: or {}

`const POLLING_INTERVAL = 500`

pollingTimer:       null

encodingWidget:     null

lastEncodingName:   null
lastEncodingUseBOM: null

getEncodingButton: ->
  encodingWidget: or document.getElementById 'statusbar-new-encoding-button'

clearEncoding: ->
  getEncodingButton().removeAttribute 'label'
  getEncodingButton().setAttribute    'collapsed', 'true'
  lastEncodingName:   null
  lastEncodingUseBOM: null

clearEverything: ->
  clearEncoding()

startPolling: (view) ->
  block: ->
    return clearEverything() unless view?.document
    try
      if view.getAttribute 'type' is 'startpage'
        clearEverything()
      else
        if lastEncodingName isnt (newEncodingName: view.document.encoding.short_encoding_name) \
        or lastEncodingUseBOM isnt (newEncodingUseBOM: view.document.encoding.use_byte_order_marker)
          lastEncodingName:   newEncodingName
          lastEncodingUseBOM: newEncodingUseBOM
          encodingButtonText: lastEncodingName
          encodingButtonText: + '+BOM' if lastEncodingUseBOM/
          getEncodingButton().setAttribute    'label', encodingButtonText
          getEncodingButton().removeAttribute 'collapsed'
    catch e
      clearEverything()
  block()
  pollingTimer: setInterval block, POLLING_INTERVAL

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
