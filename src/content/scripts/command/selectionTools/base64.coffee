root: $toolkit ? this

$self.tool: ->
  root.command.selectionTools.tool.apply @, [toolName: 'base64',
                                             toolOrdering: 5800]

  @getSupportedTransformers: -> ['encode', 'decode']

  @trigger: (transformer, string) ->
    switch transformer
      when 'encode'
        try
          return window.btoa string
        catch e
          # ignore
      when 'decode'
        try
          return window.atob string
        catch e
          # ignore
    null

  this

$self.registerAll: ->
  new $self.tool().register()
