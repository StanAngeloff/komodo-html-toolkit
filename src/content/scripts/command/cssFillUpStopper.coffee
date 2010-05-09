root: $toolkit ? this
root.include 'command.language'

$self.controller: ->
  root.command.language.controller.apply @, [command: 'cssFillUpStopper',
                                             triggerKeys: 'Space',
                                             supportedLanguages: ['CSS'],
                                             canChangeTriggerKeys: false]

  @trigger: (e) ->
    if root.pref('cssFillUpStopper.enabled') is 'true'
      scimoz: ko.views.manager.currentView.scimoz
      scimoz.autoCCancel() if scimoz.autoCActive()
    true

  root.trapExceptions this
  this

$self.registerAll: ->
  new $self.controller().register()
