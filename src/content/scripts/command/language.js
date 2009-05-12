$toolkit.include('command');
$toolkit.include('editor');

var LANGUAGE_SUPPORTED_LIST = ['HTML', 'XML', 'XUL', 'MXML', 'RXML', 'PHP', 'Smarty', 'Django', 'RHTML'];

$self.controller = function() {

	this.supportedLanguages = (arguments[2] ? (typeof (arguments[2]) === 'string' ? [arguments[2]] : arguments[2]) : []);
	this.languageMatch = null;

	// Call parent's constructor
	$toolkit.command.controller.apply(this, [arguments[0], arguments[1], arguments[3]]);

	this.canExecuteBase = this.canExecute;

	this.canExecute = function(e) {

		// This is in case the command overrides the return value of canExecute(..)
		this.languageMatch = null;

		if (this.canExecuteBase(e)) {

			var view = ko.views.manager.currentView,
				isSupportedLanguage = false;

			// First check if the document is in a supported language
			if (LANGUAGE_SUPPORTED_LIST.indexOf(view.document.language) >= 0 &&
				this.supportedLanguages.indexOf(view.document.subLanguage) >= 0) {

				isSupportedLanguage = true;
				this.languageMatch = view.document.subLanguage;

			// Check if we have 'special' languages defined e.g. PHPDoc
			} else {

				var $instance = this;

				this.supportedLanguages.forEach(function(language) {

					// If we don't have a match already
					if ( ! isSupportedLanguage) {

						if ('_PHPDoc' === language &&
							$toolkit.editor.isPHPDoc(view, view.scimoz.currentPos)) {

							isSupportedLanguage = true;
							$instance.languageMatch = '_PHPDoc';
						}
					}
				});
			}

			return isSupportedLanguage;
		}

		return false;
	};
};
