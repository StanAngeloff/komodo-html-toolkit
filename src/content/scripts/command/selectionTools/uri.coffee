root = $toolkit ? this

$self.tool: ->

	# Call parent's constructor
	root.command.selectionTools.tool.apply(this, [toolName: 'uri',
												  toolOrdering: 5700])

	this.getSupportedTransformers: ( -> ['encode', 'decode'])

	this.trigger: (transformer, string) ->
		switch transformer
			when 'encode'
				return encodeURIComponent(string)
			when 'decode'
				return decodeURIComponent(string)
		return null

	# This is to instruct CoffeeScript to return this instead of this.getSupportedTransformers
	this

$self.registerAll: ->
	new $self.tool().register()
