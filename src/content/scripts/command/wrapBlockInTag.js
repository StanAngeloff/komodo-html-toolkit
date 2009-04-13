$toolkit.include('command.language');

$self.controller = function() {

	var isMac = (navigator.platform.indexOf('Mac') >= 0);

	// Call parent's constructor
	$toolkit.command.language.controller.apply(this, ['wrapBlockInTag', (isMac ? 'Meta' : 'Ctrl') + '+Alt+W', ['HTML', 'XML'], true]);

	this.trigger = function() {

		// TODO: If no selection, select entire line (see Community website for macro)
		// TODO: Insert and maintain selection if possible, perhaps after tabbing away from tabstop
		alert('This command is not implemented yet.');

		return false;
	};

	$toolkit.trapExceptions(this);
};
