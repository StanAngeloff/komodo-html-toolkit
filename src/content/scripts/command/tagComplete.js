$toolkit.include('command.language');
$toolkit.include('editor');
$toolkit.include('htmlUtils');
$toolkit.include('library');
$toolkit.include('regexp');

$self.controller = function() {

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['tagComplete', '>', ['HTML', 'XML']]);

	this.trigger = function(e) {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz,
			editorPosition = Math.min(scimoz.anchor, scimoz.currentPos),
			positionStyle = scimoz.getStyleAt(editorPosition);

		// Make sure we are not within an attribute or an operator
		if ([scimoz.SCE_UDL_M_ATTRNAME,
			 scimoz.SCE_UDL_M_STRING,
			 scimoz.SCE_UDL_M_OPERATOR].indexOf(positionStyle) >= 0)
			return false;

		// Work our way back to the beginning of the document
		for (var position = Math.max(0, editorPosition - 1); position >= 0; position --) {

			// If we match a closing tag, stop processing
			if ([scimoz.SCE_UDL_M_STAGC,
				 scimoz.SCE_UDL_M_ETAGC,
				 scimoz.SCE_UDL_M_ETAGO].indexOf(scimoz.getStyleAt(position)) >= 0)
				break;

			// If we match an opening tag, evaluate and stop processing
			if (scimoz.getStyleAt(position) === scimoz.SCE_UDL_M_STAGO) {

				var lineBuffer = scimoz.getTextRange(position, editorPosition);

				// Test if we have matched a tag name
				if ( ! $toolkit.regexp.matchOperator(lineBuffer, '', '$') &&
					$toolkit.regexp.matchOpeningTag(lineBuffer, '^')) {

					var tagName, tagNameLower, tagComplete, tagPosition,
						isTagEmpty = false,
						isTagAbbreviation = false;

					tagName = $toolkit.regexp.lastMatches[1];
					tagNameLower = tagName.toLowerCase();

					var editorEndUndo = false;

					// If this was an internal call, do no begin another undo action
					if ( ! e || ! e.preventUndo) {

						editorEndUndo = true;
						scimoz.beginUndoAction();
					}

					try {

						// If autocomplete is visible, close it to prevent autocomplete on selected item
						if (scimoz.autoCActive())
							scimoz.autoCCancel();

						// We will complete the tag ourselves, don't bubble the event to Komodo
						scimoz.targetStart = editorPosition;
						scimoz.targetEnd = Math.max(scimoz.anchor, scimoz.currentPos);
						scimoz.replaceTarget(1, '>');
						scimoz.anchor = scimoz.currentPos = editorPosition + 1;

						// Do not process event any further
						e.preventDefault();
						e.stopPropagation();

						// Re-paint document so closing arrow is recognised correctly
						$toolkit.editor.invalidate();

						// If we have no attributes defined and we are still on the same line,
						// check for a suitable abbreviation
						if ('<' + tagName === lineBuffer &&
							scimoz.lineFromPosition(editorPosition) === scimoz.lineFromPosition(position)) {

							// Check in toolbox first
							var abbrevSnippet = null;

							abbrevSnippet = ko.abbrev.findAbbrevSnippet(tagName) ||
											ko.abbrev.findAbbrevSnippet(tagNameLower);
							// Check in pre-defined HTML snippets next if no match
							if ( ! abbrevSnippet &&
								$toolkit.editor.isHtmlBuffer(view)) {

								// Some built-in snippets have different contents depending on the buffer DOCTYPE
								var isXHtml = $toolkit.htmlUtils.isXHtmlDoctype($toolkit.editor.guessDoctype(view)),
									doctypeSwitch = (isXHtml ? '-xhtml' : '-html');

								[doctypeSwitch, ''].forEach(function(suffix) {

									if ( ! abbrevSnippet)
										abbrevSnippet = $toolkit.library.getTagSnippet(tagName + suffix) ||
														$toolkit.library.getTagSnippet(tagNameLower + suffix.toLowerCase());
								});
							}

							// If we have a snippet in either location, notify User
							if (abbrevSnippet) {

								tagComplete = abbrevSnippet;
								isTagAbbreviation = true;

								ko.statusBar.AddMessage($toolkit.l10n('command').formatStringFromName('tagComplete.snippetFound', [tagName, tagComplete.parent.name], 2), 'htmltoolkit', 2500, true);
							}
						}

						// We know a few HTML empty elements, process those accordingly
						if ( ! isTagAbbreviation &&
							$toolkit.editor.isHtmlBuffer(view) &&
							$toolkit.htmlUtils.isEmptyTag(tagNameLower)) {

							tagComplete = ($toolkit.regexp.matchWhitespace(lineBuffer, null, '$') ? '' : ' ') + '/';
							tagPosition = editorPosition;
							isTagEmpty = true;
						}

						// If we are processing a non-empty tag, check if it isn't closed already
						if ( ! isTagAbbreviation && ! isTagEmpty) {

							// Get the number of open tags within the entire document
							var startTagCharCode = '<'.charCodeAt(0),
								closeTagCharCode = '>'.charCodeAt(0);

								isOpenTag = function(scimoz, position, tagName) {
									return (scimoz.getCharAt(position) === startTagCharCode &&
											scimoz.getStyleAt(position) === scimoz.SCE_UDL_M_STAGO &&
											scimoz.getTextRange(position, Math.min(position + tagName.length + 1, scimoz.length)) === '<' + tagName);
								},

								isCloseTag = function(scimoz, position, tagName) {
									return (scimoz.getCharAt(position) === closeTagCharCode &&
											scimoz.getStyleAt(position) === scimoz.SCE_UDL_M_ETAGC &&
											scimoz.getTextRange(Math.max(position - tagName.length - 1, 0), position) === '/' + tagName);
								};

							var openTagsLength = 0;

							for (var prevPosition = 0; prevPosition <= editorPosition; prevPosition ++) {
								if (isOpenTag(scimoz, prevPosition, tagName))
									openTagsLength ++;
								else if (isCloseTag(scimoz, prevPosition, tagName))
									// When working before the current position, ignore extra closing tags
									if (openTagsLength > 0)
										openTagsLength --;
							}

							for (var nextPosition = editorPosition; nextPosition < scimoz.length; nextPosition ++) {
								if (isOpenTag(scimoz, nextPosition, tagName))
									openTagsLength ++;
								else if (isCloseTag(scimoz, nextPosition, tagName))
									openTagsLength --;
							}

							// If we have closed all tags within the document, don't autocomplete
							if (openTagsLength < 1)
								return false;

							// We also know a few HTML block elements
							if ($toolkit.editor.isHtmlBuffer(view) &&
								$toolkit.htmlUtils.isBlockTag(tagNameLower)) {

								tagComplete = '\n\t[[%tabstop0]]\n</' + tagName + '>';
								tagPosition = editorPosition + 1;

							} else {

								// Don't autocomplete HTML tags we don't know about
								if ($toolkit.editor.isHtmlBuffer(view) &&
									tagName.indexOf(':') < 0 && // Allow tags in namespaces
									! $toolkit.htmlUtils.isHtmlTag(tagNameLower))
									return false;

								tagComplete = '[[%tabstop0]]</' + tagName + '>';
								tagPosition = editorPosition + 1;
							}
						}

						if (typeof ($toolkit.command.undo) === 'object')
							$toolkit.command.undo.anchor = editorPosition;

						if (isTagAbbreviation) {

							// Select the entire tag
							scimoz.setSel(editorPosition - tagName.length - 1, editorPosition + 1);
							// Call Komodo's built-in functions
							Snippet_insert(tagComplete);

						// If our replacement has tabstops, build a fake snippet and insert
						} else if (ko.tabstops.textHasTabstops(tagComplete)) {

							scimoz.anchor = scimoz.currentPos = tagPosition;

							Snippet_insert($toolkit.library.createSnippet(tagComplete));

						// Nothing fancy, just text insertion
						} else
							scimoz.insertText(tagPosition, tagComplete);

						scimoz.scrollCaret();

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

					} finally {

						if (editorEndUndo) scimoz.endUndoAction();
					}
				}

				break;
			}
		}

		return false;
	};

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.controller().register();
};
