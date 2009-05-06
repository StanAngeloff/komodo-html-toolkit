$toolkit.include('command.language');

$self.controller = function() {

	var isMac = (navigator.platform.indexOf('Mac') >= 0);

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['googleLink', (isMac ? 'Meta' : 'Ctrl') + '+Alt+Shift+L', ['HTML'], true]);

	this.trigger = function() {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz,
			searchQuery = null,
			rangeStart = null, rangeEnd = null,
			searchStart = null, searchEnd = null;

		// If no active selection within the document
		if (scimoz.anchor === scimoz.currentPos) {

			// Start at cursor position and break at any non-word character before or after
			rangeStart = searchStart = scimoz.currentPos;
			rangeEnd = searchEnd = scimoz.currentPos;

			var currentRange = null;

			do {

				searchQuery = currentRange;
				searchStart = rangeStart;
				rangeStart --;
				if (rangeStart >= 0)
					currentRange = scimoz.getTextRange(rangeStart, rangeEnd);

			} while	(rangeStart >= 0 &&
					 $toolkit.regexp.matchWord(currentRange, '^', '$'));

			do {

				searchQuery = currentRange;
				searchEnd = rangeEnd;
				rangeEnd ++;
				if (rangeEnd <= scimoz.length)
					currentRange = scimoz.getTextRange(searchStart, rangeEnd);

			} while	(rangeEnd <= scimoz.length &&
					 $toolkit.regexp.matchWord(currentRange, '^', '$'));

		} else {

			searchQuery = scimoz.selText;

			searchStart = Math.min(scimoz.anchor, scimoz.currentPos);
			searchEnd = Math.max(scimoz.anchor, scimoz.currentPos);
		}

		// If we have a matching range
		if (searchQuery !== null && searchQuery.length) {

			if (typeof ($toolkit.command.undo) === 'object')
				$toolkit.command.undo.anchor = searchEnd;

			try {

				scimoz.beginUndoAction();

				// Select search query as our snippet wraps around the selection
				scimoz.anchor = searchStart;
				scimoz.currentPos = searchEnd;

				var searchResult = { address: null },
					wnd = window.openDialog('chrome://htmltoolkit/content/scripts/command/googleLink.xul',
											'googleLinkWindow',
											'chrome=yes,modal=yes,centerscreen=yes,resizable=no,minimizable=no',
											searchQuery.substring(0, 256),
											searchResult);

				wnd.focus();

				// Restore focus to the editor
				scimoz.focus = true;

				if (searchResult.address) {

					// TODO: check casing for the rest of the document and determine whether we should use uppercase or lowercase
					//       Look for <html, <body <any-other-known-html-tag and match against first occurrence
					// TODO: Also need to escape the .address so it goes in as valid HTML: <"&>
					// TODO: Fix selection as its lost after the insertion
					Snippet_insert($toolkit.library.createSnippet('<a href="' + searchResult.address + '">[[%s]]</a>'));
				}

				if (typeof ($toolkit.command.undo) === 'object') {

					$toolkit.command.undo.position = Math.max(scimoz.anchor, scimoz.currentPos);

					// If we have indicators within the document, we can't undo
					if (view.document.hasTabstopInsertionTable &&
						view.document.getTabstopInsertionTable({}).length > 0 &&
						scimoz.anchor !== scimoz.currentPos)
						$toolkit.command.undo.undoable = false;
					else
						$toolkit.command.undo.undoable = true;
				}

				return true;

			} finally { scimoz.endUndoAction(); }

		} else
			ko.statusBar.AddMessage($toolkit.l10n('command').GetStringFromName('googleLink.noWordUnderCursor'), 'htmltoolkit', 2500, true);

		return false;
	};

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.controller().register();
};
