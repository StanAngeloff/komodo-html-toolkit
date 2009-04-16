$toolkit.include('command.language');
$toolkit.include('debug');
$toolkit.include('events');

const DECORATOR_WBIT_SELECTION = 31; // Values above 32 just won't work

const Ci = Components.interfaces;

$self.destroy = function() {

	// Remove existing handler if included twice
	window.removeEventListener('view_opened', $self.onViewOpened, true);
};

$self.initialize = function() {

	// Capture new buffers and fire simulated event on existing
	window.addEventListener('view_opened', $self.onViewOpened, true);

	$toolkit.events.onLoad(function() {

		var editorViews = ko.views.manager.topView.getViewsByType(true, 'editor');
		for (var i = 0; i < editorViews.length; i ++)
			$self.onViewOpened({ originalTarget: editorViews[i] });
	});
};

$self.onViewOpened = function(e) {

	var view = e.originalTarget;
	if (view && view.scimoz) {

		view.scimoz.indicSetStyle(DECORATOR_WBIT_SELECTION, view.scimoz.INDIC_ROUNDBOX);
		// Keep this if we decide to change the style to a box
		view.scimoz.indicSetFore(DECORATOR_WBIT_SELECTION, 0xFF + 0xFF * 256 + 0xCC * 256 * 256);
	}
};

$self.controller = function() {

	var isMac = (navigator.platform.indexOf('Mac') >= 0);

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['wrapBlockInTag', (isMac ? 'Meta' : 'Ctrl') + '+Alt+W', ['HTML', 'XML'], true]);

	this.trigger = function() {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz,
			originalAnchor = scimoz.anchor,
			originalPosition = scimoz.currentPos;

		// Make sure another wrapping is not already in progress
		for (var i = 0; i < scimoz.length; i ++)
			if (scimoz.indicatorValueAt(DECORATOR_WBIT_SELECTION, i))
				return false;

		// If no selection, select entire line
		if (scimoz.anchor === scimoz.currentPos) {

			scimoz.anchor = scimoz.positionFromLine(scimoz.lineFromPosition(scimoz.anchor));
			scimoz.currentPos = scimoz.getLineEndPosition(scimoz.lineFromPosition(scimoz.currentPos));
		}

		// Unselect whitespace from beginning and end of selection
		var rangeStart = Math.min(scimoz.anchor, scimoz.currentPos),
			rangeEnd = Math.max(scimoz.anchor, scimoz.currentPos),
			originalRangeStart = rangeStart,
			originalRangeEnd = rangeEnd;

		while (rangeStart < rangeEnd &&
			   $toolkit.regexp.matchWhitespace(scimoz.getTextRange(rangeStart, rangeStart + 1), '^', '$'))
			rangeStart ++;

		while (rangeEnd > rangeStart &&
			   $toolkit.regexp.matchWhitespace(scimoz.getTextRange(rangeEnd - 1, rangeEnd), '^', '$'))
			rangeEnd --;

		// TODO: Add status bar message and restore original anchor and position
		if (rangeStart === rangeEnd) {

			// Restore original anchor and position
			scimoz.anchor = originalAnchor;
			scimoz.currentPos = originalPosition;

			ko.statusBar.AddMessage($toolkit.l10n('command').GetStringFromName('command.wrapBlockInTag.rangeEmpty'), 'htmltoolkit', 2500, true);

			return false;
		}

		scimoz.anchor = rangeStart;
		scimoz.currentPos = rangeEnd;

		var wrapSnippet = '<[[%tabstop1:p]]>\n[[%s]]\n[[%tabstop]]</[[%tabstop1]]>';

		Snippet_insert($toolkit.library.createSnippet(wrapSnippet));

		// Highlight old selection with our custom marker
		var markerStart = Math.max(scimoz.anchor, scimoz.currentPos) + 2,
			markerEnd = -1;

		// Find where last tabstop is
		for (i = markerStart; i < scimoz.length; i ++)
			if (scimoz.indicatorValueAt(Ci.koILintResult.DECORATOR_TABSTOP_TSZW, i)) {

				markerEnd = i;
				break;
			}

		// Remove whitespace before last tabstop
		while (markerEnd > markerStart &&
			   $toolkit.regexp.matchWhitespace(scimoz.getTextRange(markerEnd - 1, markerEnd), '^', '$'))
			markerEnd --;

		// Make sure we know both where we start and where we end
		if (markerEnd < markerStart)
			return false;

		// Restored selection should include entire lines
		markerStart = scimoz.positionFromLine(scimoz.lineFromPosition(markerStart));
		markerEnd = Math.min(scimoz.getLineEndPosition(scimoz.lineFromPosition(markerEnd)) + 1, scimoz.length - 1);

		// Make sure start point is not past end point as that's not acceptable
		if (markerEnd <= markerStart)
			return false;

		scimoz.indicatorCurrent = DECORATOR_WBIT_SELECTION;
		scimoz.indicatorFillRange(markerStart, markerEnd - markerStart);

		// Make sure we clear after ourselves
		var clearLeftoversTimer = window.setInterval(function() {

			// If there is at least one more tabstop within the document, leave marker
			if (view.document.hasTabstopInsertionTable && view.document.getTabstopInsertionTable({}).length > 0)
				return false;

			// There are no more tabstops within the buffer, clear marker and restore selection
			try {

				// First where marker starts and ends
				for (i = 0; i < scimoz.length; i ++)
					if (scimoz.indicatorValueAt(DECORATOR_WBIT_SELECTION, i)) {

						var indicatorStart = scimoz.indicatorStart(DECORATOR_WBIT_SELECTION, i),
							indicatorEnd = scimoz.indicatorEnd(DECORATOR_WBIT_SELECTION, i);

						scimoz.indicatorCurrent = DECORATOR_WBIT_SELECTION;
						scimoz.indicatorClearRange(indicatorStart, indicatorEnd);

						// Respect anchor position i.e. before or after the cursor
						scimoz.anchor = Math[originalAnchor < originalPosition ? 'min' : 'max'](indicatorStart, indicatorEnd);
						scimoz.currentPos = Math[originalAnchor < originalPosition ? 'max' : 'min'](indicatorStart, indicatorEnd);

						break;
					}

				return true;

			} finally { window.clearInterval(clearLeftoversTimer); }

		}, 100);

		return true;
	};

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.controller().register();
};
