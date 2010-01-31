root = $toolkit ? this
root.include('command.language');

$self.controller: ->
	# Call parent's constructor
	root.command.language.controller.apply(this, [command: 'cssFillUpStopper',
												  triggerKeys: 'Space',
												  supportedLanguages: ['CSS'],
												  canChangeTriggerKeys: false])

	this.trigger: (e) ->
		if root.pref('cssFillUpStopper.enabled') is 'true'
			scimoz: ko.views.manager.currentView.scimoz
			scimoz.autoCCancel() if scimoz.autoCActive()

	# This is to instruct CoffeeScript to return $self instead of $self.trigger
	this

$self.registerAll: ->
	new $self.controller().register();
