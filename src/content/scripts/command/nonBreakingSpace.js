$toolkit.include('command.language');

$self.controller = function() {

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['nonBreakingSpace', 'Shift+Space', ['HTML']]);

	this.trigger = function(e) {

		var scimoz = ko.views.manager.currentView.scimoz;

		if ( ! this.stopUndo) {

			this.stopUndo = true;

			scimoz.beginUndoAction();

			var $instance = this;
			this.onKeyEvent('up', function() { $instance.stop(); });
		}

		// If no selection, insert after current position
		if (scimoz.anchor === scimoz.currentPos) {

			scimoz.insertText(scimoz.currentPos, '&nbsp;');
			scimoz.anchor = scimoz.currentPos += 6;
		}
		// Otherwise if we have a selection, replace it
		else
			scimoz.replaceSel('&nbsp;');

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
