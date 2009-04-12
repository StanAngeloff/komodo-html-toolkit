$toolkit.include('command');

$self.controller = function() {

	// Call parent's constructor
	$toolkit.command.controller.apply(this, ['nonBreakingSpace']);

	// TODO: ?
};

$self.controller.prototype = $toolkit.command.controller.prototype;
$self.controller.prototype.constructor = $self.controller;

$self.controller.prototype.trigger = function() {

	alert('TODO: ');
};
