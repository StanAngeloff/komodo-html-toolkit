$toolkit.include('command');
$toolkit.include('regexp');

$self.controller = function() {

	// Call parent's constructor
	$toolkit.command.controller.apply(this, ['jumpClosingTag', 'Tab']);

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

	// Move caret while if no selection and remaining tabstops
	if (scimoz.anchor === scimoz.currentPos &&
		( ! view.document.hasTabstopInsertionTable || view.document.getTabstopInsertionTable({}).length < 1)) {

		// Read buffer until end of line
		var lineEndPosition = scimoz.getLineEndPosition(scimoz.lineFromPosition(scimoz.currentPos)),
			currentRange = scimoz.getTextRange(scimoz.currentPos, lineEndPosition);

		// Check if we match a closing tag
		if (currentRange && currentRange.length &&
			$toolkit.regexp.matchClosedTag(currentRange, '^')) {

			scimoz.anchor = scimoz.currentPos += $toolkit.regexp.lastMatches[0].length;

			// Do not process event any further
			e.preventDefault();
			e.stopPropagation();
		}
	}
};
