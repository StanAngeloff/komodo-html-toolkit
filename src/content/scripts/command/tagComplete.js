$toolkit.include('command.language');
$toolkit.include('editor');
$toolkit.include('htmlUtils');
$toolkit.include('library');
$toolkit.include('regexp');

const Cc = Components.classes;
const Ci = Components.interfaces;

$self.controller = function() {

	// Call parent's constructor
	var command, triggerKeys, supportedLanguages, canChangeTriggerKeys;

	$toolkit.command.language.controller.apply(this, [command = 'tagComplete',
													  triggerKeys = '>',
													  supportedLanguages = ['HTML', 'XML', 'XBL', 'PHP', '_PHPDoc'],
													  canChangeTriggerKeys = false]);

	this.trigger = function(e) {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz,
			languagePair = [view.document.subLanguage, view.document.language];

		// If we are working in a PHP buffer, check one position back to make sure we have HTML
		if (languagePair.indexOf('PHP') >= 0 &&
			'HTML' !== view.document.languageForPosition(Math.max(0, Math.max(scimoz.anchor, scimoz.currentPos) - 1)))
			return false;

		var editorPosition = Math.min(scimoz.anchor, scimoz.currentPos),
			positionStyle = scimoz.getStyleAt(editorPosition),
			startTagCharCode = '<'.charCodeAt(0);

		// Make sure we are not within an attribute or an operator
		if ([scimoz.SCE_UDL_M_ATTRNAME,
			 scimoz.SCE_UDL_M_STRING,
			 scimoz.SCE_UDL_M_OPERATOR].indexOf(positionStyle) >= 0)
			return false;

		var isDocLanguage = (['_PHPDoc'].indexOf(this.languageMatch) >= 0);

		// Work our way back to the beginning of the document
		for (var position = Math.max(0, editorPosition - 1); position >= 0; position --) {

			// If we match a closing tag, stop processing
			if ([scimoz.SCE_UDL_M_STAGC,
				 scimoz.SCE_UDL_M_ETAGC,
				 scimoz.SCE_UDL_M_ETAGO].indexOf(scimoz.getStyleAt(position)) >= 0)
				break;

			// If we match an opening tag, evaluate and stop processing
			if (scimoz.getStyleAt(position) === scimoz.SCE_UDL_M_STAGO ||
				(isDocLanguage && startTagCharCode === scimoz.getCharAt(position))) {

				var lineBuffer = scimoz.getTextRange(position, editorPosition);

				// Test if we have matched a tag name
				if ( ! $toolkit.regexp.matchOperator(lineBuffer, '', '$') &&
					$toolkit.regexp.matchOpeningTag(lineBuffer, '^')) {

					var tagName, tagNameLower, tagComplete, tagPosition,
						isTagEmpty = false,
						isTagAbbreviation = false;

					tagName = $toolkit.regexp.lastMatches[1];
					tagNameLower = tagName.toLowerCase();

					var isXHtmlView = $toolkit.htmlUtils.isXHtmlDoctype($toolkit.editor.guessDoctype(view)),
						editorEndUndo = false;

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

							if ('true' === $toolkit.pref('tagComplete.toolboxEnabled')) {

								abbrevSnippet = ko.abbrev.findAbbrevSnippet(tagName) ||
												ko.abbrev.findAbbrevSnippet(tagNameLower);
							}

							// Check in pre-defined HTML snippets next if no match
							if ( ! abbrevSnippet &&
								'true' === $toolkit.pref('tagComplete.libraryEnabled') &&
								$toolkit.editor.isHtmlBuffer(view)) {

								// Some built-in snippets have different contents depending on the buffer DOCTYPE
								[(isXHtmlView ? '-xhtml' : '-html'), ''].forEach(function(suffix) {

									if ( ! abbrevSnippet)
										abbrevSnippet = $toolkit.library.getTagSnippet(tagName + suffix) ||
														$toolkit.library.getTagSnippet(tagNameLower + suffix);
								});
							}

							// If we have a snippet in either location, notify User
							if (abbrevSnippet) {

								tagComplete = abbrevSnippet;
								isTagAbbreviation = true;

								// Give more detailed information about where the snippet was found
								var parentName = null;

								if ('*internal*' === tagComplete.parent.name)
									parentName = $toolkit.l10n('command').GetStringFromName('abbreviation.builtIn');
								else {

									var tagParent = tagComplete.parent,
										tagPath = [];

									while (tagParent) {

										tagPath.push(tagParent.name);
										tagParent = tagParent.parent;
									}

									tagPath.pop();
									tagPath.push($toolkit.l10n('command').GetStringFromName('abbreviation.toolbox'));

									parentName = tagPath.reverse().join(' > ');
								}

								ko.statusBar.AddMessage($toolkit.l10n('command').formatStringFromName('abbreviation.snippetFound', [tagName, parentName], 2), 'htmltoolkit', 2500, true);
							}
						}

						// Don't proceed any further if we don't have a snippet and
						// the default auto-complete has been turned off
						if ( ! isTagAbbreviation &&
							'false' === $toolkit.pref('tagComplete.defaultEnabled'))
							return false;

						// We know a few HTML empty elements, process those accordingly
						if ( ! isTagAbbreviation &&
							(isDocLanguage || $toolkit.editor.isHtmlBuffer(view)) &&
							$toolkit.htmlUtils.isEmptyTag(tagNameLower)) {

							if (isXHtmlView)
								tagComplete = ($toolkit.regexp.matchWhitespace(lineBuffer, null, '$') ? '' : ' ') + '/';
							else
								tagComplete = '';

							tagPosition = editorPosition;
							isTagEmpty = true;
						}

						// If we are processing a non-empty tag, check if it isn't closed already
						if ( ! isTagAbbreviation && ! isTagEmpty) {

							// Get the number of open tags within the entire document
							if ( ! isDocLanguage) {

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
							}

							// Don't autocomplete HTML tags we don't know about
							if ($toolkit.editor.isHtmlBuffer(view) &&
								tagName.indexOf(':') < 0 && // Allow tags in namespaces
								! $toolkit.htmlUtils.isHtmlTag(tagNameLower))
								return false;

							tagComplete = '[[%tabstop0]]</' + tagName + '>';
							tagPosition = editorPosition + 1;
						}

						if (typeof ($toolkit.command.undo) === 'object')
							$toolkit.command.undo.anchor = editorPosition;

						if (isTagAbbreviation) {

							// Select the entire tag
							scimoz.setSel(editorPosition - tagName.length - 1, editorPosition + 1);
							// Call Komodo's built-in functions
							ko.projects.snippetInsert(tagComplete);

						// If our replacement has tabstops, build a fake snippet and insert
						} else if (ko.tabstops.textHasTabstops(tagComplete)) {

							scimoz.anchor = scimoz.currentPos = tagPosition;

							ko.projects.snippetInsert($toolkit.library.createSnippet(tagComplete));

						// Nothing fancy, just text insertion
						} else
							scimoz.insertText(tagPosition, tagComplete);

						scimoz.scrollCaret();

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
