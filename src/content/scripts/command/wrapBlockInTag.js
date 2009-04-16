$toolkit.include('command.language');

$self.controller = function() {

	var isMac = (navigator.platform.indexOf('Mac') >= 0);

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['wrapBlockInTag', (isMac ? 'Meta' : 'Ctrl') + '+Alt+W', ['HTML', 'XML'], true]);

	this.trigger = function() {

		var scimoz = ko.views.manager.currentView.scimoz;

		// If no selection, select entire line
		if (scimoz.anchor === scimoz.currentPos) {

			scimoz.anchor = scimoz.positionFromLine(scimoz.lineFromPosition(scimoz.anchor));
			scimoz.currentPos = scimoz.getLineEndPosition(scimoz.lineFromPosition(scimoz.currentPos));
		}

		// Unselect whitespace from beginning and end of selection
		var rangeStart = Math.min(scimoz.anchor, scimoz.currentPos),
			rangeEnd = Math.max(scimoz.anchor, scimoz.currentPos);

		while (rangeStart < rangeEnd &&
			   $toolkit.regexp.matchWhitespace(scimoz.getTextRange(rangeStart, rangeStart + 1), '^', '$'))
			rangeStart ++;

		while (rangeEnd > rangeStart &&
			   $toolkit.regexp.matchWhitespace(scimoz.getTextRange(rangeEnd - 1, rangeEnd), '^', '$'))
			rangeEnd --;

		if (rangeStart === rangeEnd)
			return false;

		scimoz.anchor = rangeStart;
		scimoz.currentPos = rangeEnd;

		var wrapSnippet = '<[[%tabstop1:p]]>\n[[%s]]\n[[%tabstop]]</[[%tabstop1]]>';

		Snippet_insert($toolkit.library.createSnippet(wrapSnippet));

		dump(ko.views.manager.currentView.document.getTabstopInsertionTable({}));
		alert(1);

		return true;
	};

	$toolkit.trapExceptions(this);
};
