$self.undoable = false;
$self.anchor = $self.position = null;

$toolkit.include('command');

$self.controller = function() {

	// Call parent's constructor
	var command, triggerKeys, canChangeTriggerKeys;

	$toolkit.command.controller.apply(this, [command = 'undo',
											 triggerKeys = 'Backspace',
											 canChangeTriggerKeys = false]);

	this.canExecuteBase = this.canExecute;

	this.canExecute = function(e) {

		if (this.canExecuteBase(e))
			return $self.undoable;

		return false;
	};

	this.trigger = function(e) {

		$self.undoable = false;

		var scimoz = ko.views.manager.currentView.scimoz;
		if (scimoz.currentPos === $self.position) {

			scimoz.undo();
			scimoz.anchor = scimoz.currentPos = $self.anchor;
			scimoz.scrollCaret();

			// Do not process event any further
			e.preventDefault();
			e.stopPropagation();
		}
	};

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.controller().register();
};
