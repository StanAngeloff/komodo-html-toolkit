$toolkit.include('command.language');
$toolkit.include('regexp');

$self.controller = function() {

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['jumpClosingTag', 'Tab', ['HTML', 'XML']]);

	this.trigger = function(e) {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz;

		// Move caret if no selection and remaining tabstops
		if (scimoz.anchor !== scimoz.currentPos ||
			(view.document.hasTabstopInsertionTable && view.document.getTabstopInsertionTable({}).length > 0))
			return false;

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

			return true;
		}

		return false;
	};

	$toolkit.trapExceptions(this);
};
