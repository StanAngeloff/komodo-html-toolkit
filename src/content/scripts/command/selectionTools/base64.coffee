root: $toolkit ? this

$self.tool: ->
  root.command.selectionTools.tool.apply @, [
    toolName:     'base64'
    toolOrdering: 5800
  ]

  @getSupportedTransformers: -> ['encode', 'decode']

  @trigger: (transformer, string) ->
    switch transformer
      when 'encode'
        try
          return window.btoa string
        catch e then
          # ignore
      when 'decode'
        try
          return window.atob string
        catch e then
          # ignore
    null

  this

$self.registerAll: ->
  new $self.tool().register()
