$toolkit.include('command.language');
$toolkit.include('regexp');

$self.controller = function() {

	var isMac = (navigator.platform.indexOf('Mac') >= 0),
		modifier = (isMac ? 'Meta' : 'Ctrl');

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['breakingLine', [modifier + '+Enter', modifier + '+Return'], ['HTML']]);

	this.trigger = function(e) {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz;

		if ( ! this.stopUndo) {

			this.stopUndo = true;

			scimoz.beginUndoAction();

			var $instance = this;
			this.onKeyEvent('up', function() { $instance.stop(); });
		}

		// When we have a selection, we want the indentation level of the line we are going to end up on
		var editorPosition = Math.min(scimoz.anchor, scimoz.currentPos),
			lineStartPosition = scimoz.positionFromLine(scimoz.lineFromPosition(editorPosition)),
			lineEndPosition = scimoz.getLineEndPosition(scimoz.lineFromPosition(editorPosition)),
			lineRange = scimoz.getTextRange(lineStartPosition, lineEndPosition);

		// Determine indentation level by looking at the current line
		$toolkit.regexp.matchWhitespace(lineRange, '^');

		var newLine = (view.document.new_line_endings === view.document.EOL_LF ? '\n' :
					  (view.document.new_line_endings === view.document.EOL_CR ? '\r' :
					  (view.document.new_line_endings === view.document.EOL_CRLF ? '\r\n' : '\n')));
			lineIndent = newLine + ($toolkit.regexp.lastMatches || '');

		// TODO: check casing for the rest of the document and determine whether we should use uppercase or lowercase
		//       Look for <html, <body <any-other-known-html-tag and match against first occurrence

		// TODO: Perhaps determine from DOCTYPE whether to complete as <br /> or <br>?
		// TODO: Another macro for Ctrl+Alt+Enter for <hr />?

		// If no selection, insert after current position
		if (scimoz.anchor === scimoz.currentPos) {

			scimoz.insertText(scimoz.currentPos, '<br />' + lineIndent);
			scimoz.anchor = scimoz.currentPos += 6 + lineIndent.length;
		}
		// Otherwise if we have a selection, replace it
		else
			scimoz.replaceSel('<br />' + lineIndent);

		scimoz.scrollCaret();

		// Do not process event any further
		e.preventDefault();
		e.stopPropagation();
	};

	this.stop = function(e) {

		ko.views.manager.currentView.scimoz.endUndoAction();

		this.stopUndo = false;
	};

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.controller().register();
};
