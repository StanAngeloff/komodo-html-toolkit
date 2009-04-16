$self.undoable = false;
$self.anchor = $self.position = null;

$toolkit.include('command');

$self.controller = function() {

	// Call parent's constructor
	$toolkit.command.controller.apply(this, ['undo', 'Backspace']);

	this.canExecuteBase = this.canExecute;

	this.canExecute = function(e) {

		if (this.canExecuteBase(e))
			return $self.undoable;

		return false;
	};

	this.trigger = function(e) {

		$self.undoable = false;

		var scimoz = ko.views.manager.currentView.scimoz;
		$log(scimoz.currentPos + ' === ' + $self.position);
		if (scimoz.currentPos === $self.position) {

			scimoz.undo();
			scimoz.anchor = scimoz.currentPos = $self.anchor;

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
