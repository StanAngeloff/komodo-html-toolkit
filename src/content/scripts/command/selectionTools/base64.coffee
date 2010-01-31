root = $toolkit ? this

$self.tool: ->

	# Call parent's constructor
	root.command.selectionTools.tool.apply(this, [toolName: 'base64',
												  toolOrdering: 5800])

	this.getSupportedTransformers: ( -> ['encode', 'decode'])

	this.trigger: (transformer, string) ->
		switch transformer
			when 'encode'
				try
					return window.btoa(string)
				catch e
					return null
			when 'decode'
				try
					return window.atob(string)
				catch e
					return null
		return null

	# This is to instruct CoffeeScript to return this instead of this.getSupportedTransformers
	this

$self.registerAll: ->
	new $self.tool().register()
