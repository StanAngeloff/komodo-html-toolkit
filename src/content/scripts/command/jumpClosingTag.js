$toolkit.include('command.language');
$toolkit.include('regexp');

$self.controller = function(type, keys, direction) {

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['jumpClosingTag.' + type, keys, ['HTML', 'XML']]);

	this.direction = direction;

	this.trigger = function(e) {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz;

		// Move caret if no selection and remaining tabstops
		if (scimoz.anchor !== scimoz.currentPos ||
			(view.document.hasTabstopInsertionTable && view.document.getTabstopInsertionTable({}).length > 0))
			return false;

		// Going backwards i.e. jump before closing tag
		if (this.direction < 0) {

			// Read buffer until start of line
			var lineStartPosition = scimoz.positionFromLine(scimoz.lineFromPosition(scimoz.currentPos)),
				currentRange = scimoz.getTextRange(lineStartPosition, scimoz.currentPos);

			// Check if we match a closing tag before the cursor
			if (currentRange && currentRange.length &&
				$toolkit.regexp.matchClosedTag(currentRange, '', '$')) {

				scimoz.anchor = scimoz.currentPos -= $toolkit.regexp.lastMatches[0].length;
				scimoz.scrollCaret();

				// Do not process event any further
				e.preventDefault();
				e.stopPropagation();

				return true;
			}

		// Going forwards i.e. jump after closing tag
		} else {

			// Read buffer until end of line
			var lineEndPosition = scimoz.getLineEndPosition(scimoz.lineFromPosition(scimoz.currentPos)),
				lineStartPosition = scimoz.positionFromLine(scimoz.lineFromPosition(scimoz.currentPos)),
				rangeBefore = scimoz.getTextRange(lineStartPosition, scimoz.currentPos),
				currentRange = scimoz.getTextRange(scimoz.currentPos, lineEndPosition);

			// Check if we match a closing tag after the cursor and that we
			// are not at the beginning of the line
			if ( ! $toolkit.regexp.matchWhitespace(rangeBefore, '^', '$') &&
				currentRange && currentRange.length &&
				$toolkit.regexp.matchClosedTag(currentRange, '^')) {

				scimoz.anchor = scimoz.currentPos += $toolkit.regexp.lastMatches[0].length;
				scimoz.scrollCaret();

				// Do not process event any further
				e.preventDefault();
				e.stopPropagation();

				return true;
			}
		}

		return false;
	};

	$toolkit.trapExceptions(this);
};

$self.after = {};
$self.after.controller = function() {

	// Call parent's constructor
	$self.controller.apply(this, ['after', 'Tab', +1]);
};

$self.before = {};
$self.before.controller = function() {

	// Call parent's constructor
	$self.controller.apply(this, ['before', 'Shift+Tab', -1]);
};

$self.registerAll = function() {

	new $self.after.controller().register();
	new $self.before.controller().register();
};
