$toolkit.include('command.language');
$toolkit.include('editor');
$toolkit.include('library');

$self.controller = function() {

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['newLine', ['Enter', 'Return'], 'HTML']);

	this.trigger = function(e) {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz;

		// If autocomplete is visible and an item is focused, do not process as new line
		if (scimoz.autoCActive() && scimoz.autoCGetCurrent() >= 0)
			return false;

		// Find tag before and after current position
		var tagBefore = $toolkit.editor.findTagBefore(Math.max(0, Math.min(scimoz.anchor - 1, scimoz.currentPos - 1)), scimoz),
			tagAfter = $toolkit.editor.findTagAfter(Math.max(scimoz.anchor, scimoz.currentPos), scimoz);

		// Continue if we have tags on both ends of the cursor
		if (tagBefore === null || tagAfter === null)
			return false;

		// Find appropriate abbreviation
		var newLineSnippet = $toolkit.library.getNewLineSnippet(tagBefore, tagAfter);
		if (newLineSnippet) {

			ko.statusBar.AddMessage($toolkit.l10n('command').GetStringFromName('newLine.triggered'), 'htmltoolkit', 1500, false);

			try {

				scimoz.beginUndoAction();

				if (typeof ($toolkit.command.undo) === 'object')
					$toolkit.command.undo.anchor = Math.min(scimoz.anchor, scimoz.currentPos);

				Snippet_insert(newLineSnippet);
				scimoz.scrollCaret();

				// Do not process event any further
				e.preventDefault();
				e.stopPropagation();

				if (typeof ($toolkit.command.undo) === 'object')
					$toolkit.command.undo.position = Math.max(scimoz.anchor, scimoz.currentPos);

				// If we have indicators within the document, we can't undo
				if (typeof ($toolkit.command.undo) === 'object') {

					if (view.document.hasTabstopInsertionTable &&
						view.document.getTabstopInsertionTable({}).length > 0 &&
						scimoz.currentPos !== scimoz.anchor)
						$toolkit.command.undo.undoable = false;
					else
						$toolkit.command.undo.undoable = true;
				}

				return true;

			} finally { scimoz.endUndoAction(); }
		}

		return false;
	};

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.controller().register();
};
