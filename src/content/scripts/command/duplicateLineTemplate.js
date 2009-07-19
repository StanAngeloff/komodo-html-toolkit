$toolkit.include('command');

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

		// Copy entire line
		var lineStartPosition = scimoz.positionFromLine(scimoz.lineFromPosition(scimoz.currentPos)),
			lineEndPosition = scimoz.getLineEndPosition(scimoz.lineFromPosition(scimoz.currentPos)),
			lineRange = scimoz.getTextRange(lineStartPosition, lineEndPosition);

		var snippetValue = lineRange,
			tabstopsLength = 0;

		// Support for server-side languages; remove any escape characters and
		// place tabstops inside quotes
		snippetValue = snippetValue.replace(/\\"|\\'/g, '')
								   .replace(/(["']{1}).*?\1/g, function(match, quoteStyle) { return quoteStyle + '[[%tabstop' + (++ tabstopsLength) + ']]' + quoteStyle; })

		// Wrap final snippet
		snippetValue = '\n' + snippetValue + '[[%tabstop0]]';

		// Move cursor at line end; this is where we insert the wrapped snippet
		scimoz.anchor = scimoz.currentPos = lineEndPosition;

		Snippet_insert($toolkit.library.createSnippet(snippetValue, null, null, 'false', 'false'));

		scimoz.scrollCaret();

		return true;
	};

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.controller().register();
};
