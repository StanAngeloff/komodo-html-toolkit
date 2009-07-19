$toolkit.include('command.language');
$toolkit.include('editor');
$toolkit.include('htmlUtils');

$self.controller = function() {

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['googleLink', 'Ctrl+Alt+Shift+L', ['HTML'], true]);

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

			// This allows us to capture a new range first before we assign it over to searchQuery
			currentRange = searchQuery;

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

		// Trim whitespace from query, this happens when we are at the last word in the buffer
		searchQuery = (searchQuery || '').replace(/^\s+|\s+$/g, '');

		// If we have a matching range
		if (searchQuery.length) {

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

					var escapedAddress = $toolkit.htmlUtils.escape(searchResult.address),

						anchorTag = $toolkit.htmlUtils.fixTagCase('a', $toolkit.editor.guessTagsCasing(scimoz)),
						hrefAttribute = $toolkit.htmlUtils.fixTagCase('href', $toolkit.editor.guessAttributesCasing(scimoz)),
						quotesStyle = $toolkit.editor.guessQuotesStyle(scimoz),

						snippetValue = '<' + anchorTag + ' ' + hrefAttribute + '=' + quotesStyle + escapedAddress + quotesStyle + '>[[%s]]</' + anchorTag + '>';

					Snippet_insert($toolkit.library.createSnippet(snippetValue));

					// Unfortunately Komodo does not keep the selection so we need to restore it manually
					scimoz.anchor = searchStart + snippetValue.split('>').shift().length + 1;
					scimoz.currentPos = scimoz.anchor + searchQuery.length;

					scimoz.scrollCaret();
				}

				if (typeof ($toolkit.command.undo) === 'object') {

					$toolkit.command.undo.position = Math.max(scimoz.anchor, scimoz.currentPos);

					// If we have indicators within the document, we can't undo
					if ($toolkit.editor.hasTabstops(view) &&
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
