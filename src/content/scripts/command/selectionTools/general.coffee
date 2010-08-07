root = $toolkit ? this

$self.tool = ->
  root.command.selectionTools.tool.apply @, [
    toolName     = 'general'
    toolOrdering = 5900
  ]

  @getSupportedTransformers = -> ['capitalise', 'hyphenise', 'underscorise']

  @trigger = (transformer, string) ->
    switch transformer
      when 'capitalise'
        return string
          .replace(/[\-_]\D/g, (match) -> match.charAt(1).toUpperCase())
          .replace(/\b\D/g, (match) -> match.charAt(0).toUpperCase())
          .replace(/^\D/g, (match) -> match.charAt(0).toUpperCase())
      when 'hyphenise'
        return string
          .replace(/([A-Z]+)/g, '-$1')
          .toLowerCase()
          .replace(/([0-9]+)/g, '-$1')
          .replace(/[\W\_]+/g, '-')
          .replace(/\-{2,}/g, '-')
          .replace(/^\-+|\-+$/g, '')
      when 'underscorise'
        return string
          .replace(/([A-Z]+)/g, '_$1')
          .toLowerCase()
          .replace(/([0-9]+)/g, '_$1')
          .replace(/[\W]+/g, '_')
          .replace(/_{2,}/g, '_')
          .replace(/^_+|_+$/g, '')
    null

  this

$self.registerAll = ->
  new $self.tool().register()
