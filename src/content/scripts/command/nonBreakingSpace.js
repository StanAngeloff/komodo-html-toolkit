$toolkit.include('command.language');

$self.controller = function() {

	// Call parent's constructor
	var command, triggerKeys, supportedLanguages, canChangeTriggerKeys;

	$toolkit.command.language.controller.apply(this, [command = 'nonBreakingSpace',
													  triggerKeys = 'Shift+Space',
													  supportedLanguages = ['HTML', 'HTML5'],
													  canChangeTriggerKeys = false]);

	this.trigger = function(e) {

		var scimoz = ko.views.manager.currentView.scimoz;

		if ( ! this.stopUndo) {

			// Make sure we are not inside a tag or an attribute
			if ([scimoz.SCE_UDL_M_STAGO,
				 scimoz.SCE_UDL_M_TAGNAME,
				 scimoz.SCE_UDL_M_TAGSPACE,
				 scimoz.SCE_UDL_M_ATTRNAME,
				 scimoz.SCE_UDL_M_OPERATOR,
				 scimoz.SCE_UDL_M_STRING,
				 scimoz.SCE_UDL_M_STAGC,
				 scimoz.SCE_UDL_M_ETAGO,
				 scimoz.SCE_UDL_M_ETAGC,
				 scimoz.SCE_UDL_M_EMP_TAGC].indexOf(scimoz.getStyleAt(scimoz.currentPos)) >= 0) {

				ko.statusBar.AddMessage($toolkit.l10n('command').GetStringFromName('nonBreakingSpace.invalidStyle'), 'htmltoolkit', 1500, false);

				return false;
			}

			this.stopUndo = true;

			scimoz.beginUndoAction();

			var $instance = this;
			this.onKeyEvent('up', function() { $instance.stop(); });
		}

		var htmlEntity = '&nbsp;';

		// If no selection, insert after current position
		if (scimoz.anchor === scimoz.currentPos) {

			scimoz.insertText(scimoz.currentPos, htmlEntity);
			scimoz.anchor = scimoz.currentPos += htmlEntity.length;
		}
		// Otherwise if we have a selection, replace it
		else
			scimoz.replaceSel(htmlEntity);

		scimoz.scrollCaret();

		// Do not process event any further
		e.preventDefault();
		e.stopPropagation();

		return true;
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
