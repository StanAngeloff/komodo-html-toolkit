$toolkit.include('command');

var LANGUAGE_SUPPORTED_LIST = ['HTML', 'XML', 'XUL', 'MXML', 'RXML', 'PHP', 'Smarty', 'Django', 'RHTML'];

$self.controller = function() {

	this.supportedLanguages = (arguments.length > 2 ? (typeof (arguments[2]) === 'string' ? [arguments[2]] : arguments[2]) : []);

	// Call parent's constructor
	$toolkit.command.controller.apply(this, [arguments[0], arguments[1]]);

	this.canExecuteBase = this.canExecute;

	this.canExecute = function(e) {

		if (this.canExecuteBase(e)) {

			var document = ko.views.manager.currentView.document;

			return (LANGUAGE_SUPPORTED_LIST.indexOf(document.language) >= 0 &&
					this.supportedLanguages.indexOf(document.subLanguage) >= 0);
		}

		return false;
	};
};
