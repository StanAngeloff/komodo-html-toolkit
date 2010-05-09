root: $toolkit ? this
root.include 'command.language'

$self.controller: ->
  root.command.language.controller.apply @, [command: 'quickMacro',
                                             triggerKeys: 'Ctrl+Alt+R',
                                             supportedLanguages: '*',
                                             canChangeTriggerKeys: true]

  @parts: []
  $toolkit.events.onUnload => ko.projects.active.manager.removeItems @parts

  @trigger: (e) ->
    if ko.macros?.recorder?.mode is 'recording'
      ko.macros.recorder.undo()

    result: { part: null }
    wnd: window.openDialog 'chrome://htmltoolkit/content/scripts/command/quickMacro/quickMacro.xul',
                           'quickMacroWindow',
                           'chrome=yes,modal=yes,centerscreen=yes,resizable=yes,minimizable=no',
                           @parts.length,
                           result
    wnd.focus()

    # Restore focus to the editor
    scimoz: ko.views.manager.currentView.scimoz
    try
      scimoz.focus: yes
    catch e
      scimoz.isFocused: yes

    if result.part?
      @parts.push result.part
      ko.projects.invokePart result.part

  root.trapExceptions this
  this

$self.registerAll: ->
  new $self.controller().register()
