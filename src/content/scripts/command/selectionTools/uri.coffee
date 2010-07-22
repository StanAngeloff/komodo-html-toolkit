root: $toolkit ? this

$self.tool: ->
  root.command.selectionTools.tool.apply @, [
    toolName:     'uri'
    toolOrdering: 5700
  ]

  @getSupportedTransformers: -> ['encode', 'decode']

  @trigger: (transformer, string) ->
    switch transformer
      when 'encode'
        return encodeURIComponent string
      when 'decode'
        return decodeURIComponent string
    null

  this

$self.registerAll: ->
  new $self.tool().register()
