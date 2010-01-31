root = $toolkit ? this

$self.tool: ->

	# Call parent's constructor
	root.command.selectionTools.tool.apply(this, [toolName: 'general',
												  toolOrdering: 5000])

	this.getSupportedTransformers: ( -> ['capitalise', 'hyphenise', 'underscorise'])

	this.trigger: (transformer, string) ->
		switch transformer
			when 'capitalise'
				return string.
						replace(/[\-_]\D/g, (match) -> return match.charAt(1).toUpperCase()).
						replace(/\b\D/g, (match) -> return match.charAt(0).toUpperCase()).
						replace(/^\D/g, (match) -> return match.charAt(0).toUpperCase())
			when 'hyphenise'
				return string.
						replace(/([A-Z]+)/g, '-$1').
						toLowerCase().
						replace(/([0-9]+)/g, '-$1').
						replace(/[\W\_]+/g, '-').
						replace(/\-{2,}/g, '-').
						replace(/^\-+|\-+$/g, '')
			when 'underscorise'
				return string.
						replace(/([A-Z]+)/g, '_$1').
						toLowerCase().
						replace(/([0-9]+)/g, '_$1').
						replace(/[\W]+/g, '_').
						replace(/_{2,}/g, '_').
						replace(/^_+|_+$/g, '')
		return null

	# This is to instruct CoffeeScript to return this instead of this.getSupportedTransformers
	this

$self.registerAll: ->
	new $self.tool().register()
