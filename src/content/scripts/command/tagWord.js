$toolkit.include('command.language');
$toolkit.include('command.tagComplete');
$toolkit.include('editor');

$self.controller = function() {

	var isMac = (navigator.platform.indexOf('Mac') >= 0);

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['tagWord', (isMac ? 'Meta' : 'Ctrl') + '+.', ['HTML', 'XML'], true]);

	this.trigger = function() {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz,
			abbreviation = null,
			rangeStart = null, rangeEnd = null;

		// If no active selection within the document
		if (scimoz.anchor === scimoz.currentPos) {

			// Start at cursor position and break at any non-tag character
			rangeStart = scimoz.currentPos;
			rangeEnd = scimoz.currentPos;

			var currentRange = null;

			do {

				abbreviation = currentRange;
				rangeStart --;
				if (rangeStart >= 0)
					currentRange = scimoz.getTextRange(rangeStart, rangeEnd);

			} while	(rangeStart >= 0 &&
					 $toolkit.regexp.matchTagWord(currentRange, '^', '$') &&
					 ! $toolkit.regexp.matchOutOfTag(currentRange, '^'));

		} else
			abbreviation = scimoz.selText;

		// If we have a matching range, make sure it's a tag word
		if (abbreviation !== null && abbreviation !== '>' &&
			$toolkit.regexp.matchTagWord(abbreviation, '^', '$')) {

			var editorPosition = Math.max(scimoz.anchor, scimoz.currentPos),
				undoAnchor = editorPosition,

				adjustPosition = function(offset) {

					editorPosition += (offset || 0);

					// Move carret at new position
					scimoz.anchor = scimoz.currentPos = editorPosition;

					// Force re-painting of range so styles are recognised correctly
					$toolkit.editor.invalidate();
				};

			try {

				scimoz.beginUndoAction();

				// Move carret at end of tag
				scimoz.anchor = scimoz.currentPos = editorPosition;

				// If our range does not begin as a tag, prefix accordingly
				if (abbreviation.indexOf('<') !== 0) {

					scimoz.insertText(editorPosition - abbreviation.length, '<')
					abbreviation = '<' + abbreviation;

					adjustPosition(+1);
				}

				// If we have a closing tag, remove as expected
				if (abbreviation.indexOf('>') === abbreviation.length - 1) {

					adjustPosition();
					scimoz.deleteBack();

					adjustPosition(-1);
					abbreviation = abbreviation.substr(0, abbreviation.length - 1);
				}

				var $e = { preventUndo: true,
						   preventDefault: function() {},
						   stopPropagation: function() {} };
				new $toolkit.command.tagComplete.controller().trigger($e);

				if (typeof ($toolkit.command.undo) === 'object' &&
					$toolkit.command.undo.undoable)
					$toolkit.command.undo.anchor = undoAnchor;

				return true;

			} finally { scimoz.endUndoAction(); }
		}

		return false;
	};

	$toolkit.trapExceptions(this);
};
