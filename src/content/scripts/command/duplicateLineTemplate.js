$toolkit.include('command');
$toolkit.include('editor');

$self.controller = function() {

	// Call parent's constructor
	$toolkit.command.controller.apply(this, ['duplicateLineTemplate', ['Ctrl+Alt+D'], true]);

	this.trigger = function(e) {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz;

		// Duplicate current line if no selection
		if (scimoz.anchor !== scimoz.currentPos)
			return false;

		// If autocomplete is visible, close it
		if (scimoz.autoCActive())
			scimoz.autoCCancel();

		for (var line = scimoz.lineFromPosition(scimoz.currentPos); line >= 0; line --) {

			// Copy entire line
			var lineStartPosition = scimoz.positionFromLine(line),
				lineEndPosition = scimoz.getLineEndPosition(line),
				lineRange = scimoz.getTextRange(lineStartPosition, lineEndPosition);

			// Ignore lines with whitespace only
			if ( ! (/^\s*$/.test(lineRange))) {

				var snippetValue = lineRange,
					tabstopsLength = 0;

				if ($toolkit.editor.isHtmlBuffer(view)) {

											   // Replace content within tags
					snippetValue = snippetValue.replace(/>([^<]+)</g, function(match, innerText) { return '>[[%tabstop' + (++ tabstopsLength) + ':' + innerText + ']]<'; })
											   // Replace content within arguments
											   .replace(/(["']{1})([\s\S]*?)\1/g, function(match, quoteStyle, attributeValue) { return quoteStyle + '[[%tabstop' + (++ tabstopsLength) + ':' + attributeValue + ']]' + quoteStyle; })

				} else {

					// Support for server-side languages; remove any escape characters and
					// place tabstops inside quotes
					snippetValue = snippetValue.replace(/\\"|\\'/g, '')
											   .replace(/(["']{1}).*?\1/g, function(match, quoteStyle) { return quoteStyle + '[[%tabstop' + (++ tabstopsLength) + ']]' + quoteStyle; })
				}

				// Wrap final snippet
				snippetValue = '\n' + snippetValue + '[[%tabstop0]]';

				// Move cursor at line end; this is where we insert the wrapped snippet
				scimoz.anchor = scimoz.currentPos = lineEndPosition;

				Snippet_insert($toolkit.library.createSnippet(snippetValue, null, null, 'false', 'false'));

				scimoz.scrollCaret();

				break;
			}
		}

		return true;
	};

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.controller().register();
};
