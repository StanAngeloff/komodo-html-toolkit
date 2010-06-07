$toolkit.include('command.language');
$toolkit.include('debug');
$toolkit.include('editor');
$toolkit.include('events');
$toolkit.include('htmlUtils');

const DECORATOR_WBIT_SELECTION = 31; // Values above 32 just won't work

const Cc = Components.classes;
const Ci = Components.interfaces;

$self.schemeService = Cc['@activestate.com/koScintillaSchemeService;1'].getService(Ci.koIScintillaSchemeService);

$self.observerService = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
$self.observer = {

	isObserving: false,

	observe: function(subject, topic, data) {

		$self.applyThemeToEditors();
	}
};

$self.destroy = function() {

	// Remove existing observer and handler if included twice
	if ($self.observer.isObserving)
		$self.observerService.removeObserver($self.observer, 'scheme-changed');

	window.removeEventListener('view_opened', $self.onViewOpened, true);

	// Restore Komodo's default behaviour
	if (ko.tabstops._updateAllHits__wrapBlockInTag) {

		ko.tabstops._updateAllHits = ko.tabstops._updateAllHits__wrapBlockInTag;
		delete ko.tabstops['_updateAllHits__wrapBlockInTag'];
	}

	if (ko.tabstops._updateAllZeroWidthHits__wrapBlockInTag) {

		ko.tabstops._updateAllZeroWidthHits = ko.tabstops._updateAllZeroWidthHits__wrapBlockInTag;
		delete ko.tabstops['_updateAllZeroWidthHits__wrapBlockInTag'];
	}
};

$self.initialize = function() {

	// Capture new buffers and fire simulated event on existing
	window.addEventListener('view_opened', $self.onViewOpened, true);

	// Listen for scheme changes
	$self.observerService.addObserver($self.observer, 'scheme-changed', false);
	$self.observer.isObserving = true;

	// Replace Komodo's default behaviour when updating linked tabstops
	ko.tabstops._updateAllHits__wrapBlockInTag = ko.tabstops._updateAllHits;
	ko.tabstops._updateAllHits = function (scimoz, position, indicator, newUnicodeText, newUTF8Length) {

		// If the marker is active, this means we are still in the tabstop
		if ($self.markerActive && newUnicodeText.indexOf(' ') > 0) {

			// Split and don't update attributes in linked tabstop
			newUnicodeText = newUnicodeText.split(' ').shift();
			newUTF8Length = ko.stringutils.bytelength(newUnicodeText);
		}

		return ko.tabstops._updateAllHits__wrapBlockInTag(scimoz, position, indicator, newUnicodeText, newUTF8Length);
	};

	ko.tabstops._updateAllZeroWidthHits__wrapBlockInTag = ko.tabstops._updateAllZeroWidthHits;
	ko.tabstops._updateAllZeroWidthHits = function (scimoz, position, newUnicodeText, newUTF8Length) {

		// If the marker is active, this means we are still in the tabstop
		if ($self.markerActive && newUnicodeText.indexOf(' ') > 0) {

			// Split and don't update attributes in linked tabstop
			newUnicodeText = newUnicodeText.split(' ').shift();
			newUTF8Length = ko.stringutils.bytelength(newUnicodeText);
		}

		return ko.tabstops._updateAllZeroWidthHits__wrapBlockInTag(scimoz, position, newUnicodeText, newUTF8Length);
	};
};

$self.applyThemeToEditors = function() {

	var editorViews = ko.views.manager.topView.getViewsByType(true, 'editor');
	for (var i = 0; i < editorViews.length; i ++)
		$self.onViewOpened({ originalTarget: editorViews[i] });
};

$self.onViewOpened = function(e) {

	var view = e.originalTarget;
	if (view && view.scimoz) {

		// Read selection background colour from current theme
		var currentScheme = $self.schemeService.getScheme(gPrefs.getStringPref('editor-scheme')),
			schemeSelectionColour = currentScheme.getColor('selBack');

		view.scimoz.indicSetStyle(DECORATOR_WBIT_SELECTION, view.scimoz.INDIC_ROUNDBOX);
		view.scimoz.indicSetAlpha(DECORATOR_WBIT_SELECTION, 95);
		view.scimoz.indicSetFore(DECORATOR_WBIT_SELECTION,
								 parseInt(schemeSelectionColour.substr(1, 2), 16)
							   + parseInt(schemeSelectionColour.substr(3, 2), 16) * 256
							   + parseInt(schemeSelectionColour.substr(5, 2), 16) * 256 * 256);
	}
};

$self.controller = function() {

	// Call parent's constructor
	var command, triggerKeys, supportedLanguages, canChangeTriggerKeys;

	$toolkit.command.language.controller.apply(this, [command = 'wrapBlockInTag',
													  triggerKeys = 'Ctrl+Alt+W',
													  supportedLanguages = ['HTML', 'XML', 'XBL'],
													  canChangeTriggerKeys = true]);

	this.trigger = function() {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz,
			originalAnchor = scimoz.anchor,
			originalPosition = scimoz.currentPos;

		// Make sure another wrapping is not already in progress
		for (var i = 0; i < scimoz.length; i ++)
			if (scimoz.indicatorValueAt(DECORATOR_WBIT_SELECTION, i))
				return false;

		var lineStart = scimoz.positionFromLine(scimoz.lineFromPosition(scimoz.anchor)),
			lineEnd = scimoz.getLineEndPosition(scimoz.lineFromPosition(scimoz.currentPos));

		// If no selection, select entire line
		if (scimoz.anchor === scimoz.currentPos) {

			scimoz.anchor = lineStart;
			scimoz.currentPos = lineEnd;
		}

		var wrapSnippet, restoreSelection;

		// If start and end position are on the same line and the entire line
		// has not been selected, wrap on the same line
		if (scimoz.lineFromPosition(scimoz.anchor) === scimoz.lineFromPosition(scimoz.currentPos) &&
			(scimoz.anchor > lineStart || scimoz.currentPos < lineEnd)) {

			var strongTag = $toolkit.htmlUtils.fixTagCase('strong', $toolkit.editor.guessTagsCasing(scimoz));

			wrapSnippet = '<[[%tabstop1:' + strongTag + ']]>[[%s]][[%tabstop]]</[[%tabstop1]]>';
			restoreSelection = false;

		} else {

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

			if (rangeStart === rangeEnd) {

				// Restore original anchor and position
				scimoz.anchor = originalAnchor;
				scimoz.currentPos = originalPosition;

				ko.statusBar.AddMessage($toolkit.l10n('command').GetStringFromName('wrapBlockInTag.rangeEmpty'), 'htmltoolkit', 2500, true);

				return false;
			}

			scimoz.anchor = rangeStart;
			scimoz.currentPos = rangeEnd;

			var paragraphTag = $toolkit.htmlUtils.fixTagCase('p', $toolkit.editor.guessTagsCasing(scimoz));

			wrapSnippet = '<[[%tabstop1:' + paragraphTag + ']]>\n[[%s]]\n[[%tabstop]]</[[%tabstop1]]>';
			restoreSelection = true;
		}

		ko.projects.snippetInsert($toolkit.library.createSnippet(wrapSnippet));
		scimoz.scrollCaret();

		// Highlight old selection with our custom marker
		var markerStart = Math.max(scimoz.anchor, scimoz.currentPos) + $toolkit.editor.guessNewLine(view.document).length + 1,
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
		if (restoreSelection && markerEnd <= markerStart)
			return false;

		$self.markerActive = true;

		if (restoreSelection) {

			scimoz.indicatorCurrent = DECORATOR_WBIT_SELECTION;
			scimoz.indicatorFillRange(markerStart, markerEnd - markerStart);
		}

		var $instance = this,

			clearMarker = function(restoreSelection) {

				// First find where marker starts and ends
				for (i = 0; i < scimoz.length; i ++)
					if (scimoz.indicatorValueAt(DECORATOR_WBIT_SELECTION, i)) {

						var indicatorStart = scimoz.indicatorStart(DECORATOR_WBIT_SELECTION, i),
							indicatorEnd = scimoz.indicatorEnd(DECORATOR_WBIT_SELECTION, i);

						scimoz.indicatorCurrent = DECORATOR_WBIT_SELECTION;
						scimoz.indicatorClearRange(indicatorStart, indicatorEnd);

						// Select marker, respect anchor position i.e. before or after the cursor
						if (restoreSelection) {

							var selectionStart = Math[originalAnchor < originalPosition ? 'min' : 'max'](indicatorStart, indicatorEnd),
								selectionEnd = Math[originalAnchor < originalPosition ? 'max' : 'min'](indicatorStart, indicatorEnd);

							try {

								scimoz.beginUndoAction();

								scimoz.anchor = selectionStart;
								scimoz.currentPos = selectionEnd;

								// This is to work around Komodo's bug where zero-width tabstops are still active within
								// the document even when the last one is activated. This will indent and dedent on
								// currentPos and next indendation will work as expected
								ko.commands.doCommand('cmd_indent');
								ko.commands.doCommand('cmd_dedent');

								scimoz.anchor = selectionStart;
								scimoz.currentPos = selectionEnd;

							} finally { scimoz.endUndoAction(); }
						}

						break;
					}

				$self.markerActive = false;
			},

			onTabKey = function(e) {

				if ($self.markerActive) {

					// TAB was pressed, restore original selection
					if (e.keyLabel === 'Tab') {

						if (clearLeftoversTimer) {

							window.clearInterval(clearLeftoversTimer);
							clearLeftoversTimer = null;
						}

						// Let Komodo handle the key first
						window.setTimeout(function() { clearMarker(restoreSelection); }, 1);
					}
					// If the selection marker is still within the document, wait for TAB key
					else
						$instance.onKeyEvent('press', onTabKey);
				}
			};

		// Wait for TAB key
		$instance.onKeyEvent('press', onTabKey);

		// Make sure we clear after ourselves e.g. after Undo is triggered
		var clearLeftoversTimer = window.setInterval(function() {

			// If there is at least one more tabstop within the document, leave marker
			if ($toolkit.editor.hasTabstops(view))
				return false;

			// There are no more tabstops within the buffer, clear marker
			try {

				clearMarker(false);

				return true;

			} finally {

				window.clearInterval(clearLeftoversTimer);
				clearLeftoversTimer = null;
			}

		}, 500);

		return true;
	};

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.controller().register();
};
