$toolkit.include('command.language');
$toolkit.include('editor');
$toolkit.include('htmlUtils');
$toolkit.include('regexp');

$self.controller = function() {

	// Call parent's constructor
	var command, triggerKeys, supportedLanguages, canChangeTriggerKeys;

	$toolkit.command.language.controller.apply(this, [command = 'breakingLine',
													  triggerKeys = ['Ctrl+Enter', 'Ctrl+Return'],
													  supportedLanguages = ['HTML', 'HTML5'],
													  canChangeTriggerKeys = false]);

	this.trigger = function(e) {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz;

		if ( ! this.stopUndo) {

			this.stopUndo = true;

			scimoz.beginUndoAction();

			var $instance = this;
			this.onKeyEvent('up', function() { $instance.stop(); });
		}

		// If autocomplete is visible, close it
		if (scimoz.autoCActive())
			scimoz.autoCCancel();

		// When we have a selection, we want the indentation level of the line we are going to end up on
		var editorPosition = Math.min(scimoz.anchor, scimoz.currentPos),
			lineStartPosition = scimoz.positionFromLine(scimoz.lineFromPosition(editorPosition)),
			lineEndPosition = scimoz.getLineEndPosition(scimoz.lineFromPosition(editorPosition)),
			lineRange = scimoz.getTextRange(lineStartPosition, lineEndPosition);

		// Determine indentation level by looking at the current line
		$toolkit.regexp.matchWhitespace(lineRange, '^');
		var thisLineIndent = ($toolkit.regexp.lastMatches || ['']).shift();

		var newLineStyle = $toolkit.editor.guessNewLine(view.document),
			brTag = $toolkit.htmlUtils.fixTagCase('br', $toolkit.editor.guessTagsCasing(scimoz)),
			closingStyle = ($toolkit.htmlUtils.isXHtmlDoctype($toolkit.editor.guessDoctype(view)) ? ' /' : ''),
			breakingLineText = '<' + brTag + closingStyle + '>' + newLineStyle + thisLineIndent;

		// If no selection, insert after current position
		if (scimoz.anchor === scimoz.currentPos) {

			scimoz.insertText(scimoz.currentPos, breakingLineText);
			scimoz.anchor = scimoz.currentPos += breakingLineText.length;
		}
		// Otherwise if we have a selection, replace it
		else
			scimoz.replaceSel(breakingLineText);

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
