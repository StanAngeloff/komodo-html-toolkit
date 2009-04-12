$toolkit.include('command');

$self.controller = function() {

	// Call parent's constructor
	$toolkit.command.controller.apply(this, ['nonBreakingSpace', 'Shift+Space']);

	$toolkit.trapExceptions(this);
};

$self.controller.prototype = $toolkit.command.controller.prototype;
$self.controller.prototype.constructor = $self.controller;

$self.controller.prototype.canExecuteBase = $self.controller.prototype.canExecute;

$self.controller.prototype.canExecute = function(e) {

	if (this.canExecuteBase(e))
		return (['HTML', 'XML'].indexOf(ko.views.manager.currentView.document.subLanguage) >= 0);

	return false;
};

$self.controller.prototype.trigger = function(e) {

	var scimoz = ko.views.manager.currentView.scimoz;

	if ( ! this.stopUndo) {

		this.stopUndo = true;

		scimoz.beginUndoAction();

		var $instance = this;
		this.onKeyUp(function() { $instance.stop(); });
	}

	// If no selection, insert after current position
	if (scimoz.anchor === scimoz.currentPos) {

		scimoz.insertText(scimoz.currentPos, '&nbsp;');
		scimoz.anchor = scimoz.currentPos += 6;
	}
	// Otherwise if we have a selection, replace it
	else
		scimoz.replaceSel('&nbsp;');

	// Do not process event any further
	e.preventDefault();
	e.stopPropagation();
};

$self.controller.prototype.stop = function(e) {

	ko.views.manager.currentView.scimoz.endUndoAction();

	this.stopUndo = false;
};
