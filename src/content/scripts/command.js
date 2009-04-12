xtk.include("controller");

$toolkit.include('events');

const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

// TODO: Need another set of command - keyboard interception, not controller

$self.controller = function(cmd) {

	this.setCommand(cmd);

	var $instance = this;

	$toolkit.events.onLoad(function() {

		$instance.registerCommand();
		window.controllers.appendController($instance);
	});

	$toolkit.events.onUnload(function() { window.controllers.removeController($instance); });
};

$self.controller.prototype = new xtk.Controller();
$self.controller.prototype.constructor = $self.controller;

$self.controller.prototype.onEvent = function(e) {};

$self.controller.prototype.supportsCommand = function(cmd) {

	$log('supportsCommand: ' + cmd + ' = ' + (cmd === this.commandName));
	if (cmd === this.commandName)
		return true;

	return false;
};

$self.controller.prototype.isCommandEnabled = function(cmd) {

	$log('isCommandEnabled: ' + cmd + ' = ' + (cmd === this.commandName));
	if (cmd === this.commandName)
		return this.canExecute();

	return false;
};

$self.controller.prototype.doCommand = function(cmd) {

	$log('doCommand: ' + cmd + ' = ' + (cmd === this.commandName));
	if (cmd === this.commandName)
		this.trigger();
};

$self.controller.prototype.setCommand = function(cmd) {

	this.command = cmd;

	this.commandId = 'HTMLToolkit:' + this.command;
	this.commandName = 'cmd_htmlToolkit_' + this.command;
	this.commandKey = 'key_' + this.commandName;

	// If a broadcaster is already registered, update accordingly
	if (this.broadcasterEl) {

		this.broadcasterEl.setAttribute('key', this.commandKey);
		this.broadcasterEl.setAttribute('oncommand', 'ko.commands.doCommand("' + this.commandName + '");');
	};
};

$self.controller.prototype.registerCommand = function() {

	var globalSet = document.getElementById('broadcasterset_global');
	if ( ! globalSet)
		throw "FATAL: Cannot find Komodo's global broadcaster set.";

	// Make sure we are not registered already
	if (globalSet.getElementsByAttribute('id', this.commandId).length > 0)
		return true;

	// Register command as new broadcaster
	var broadcasterEl = document.createElementNS(XUL_NS, 'broadcaster');

	broadcasterEl.setAttribute('id', this.commandId);
	broadcasterEl.setAttribute('key', this.commandKey);
	broadcasterEl.setAttribute('desc', 'Hello: World');
	// TODO: event ?
	broadcasterEl.setAttribute('oncommand', 'ko.commands.doCommand("' + this.commandName + '");');

	globalSet.appendChild(broadcasterEl);

	this.broadcasterEl = broadcasterEl;

	// Register default keybinding
	var wideKeyset = document.getElementById('widekeyset');
	if ( ! wideKeyset)
		throw "FATAL: Cannot find Komod's keybinding set.";

	var keyEl = document.createElementNS(XUL_NS, 'key');

	keyEl.setAttribute('id', this.commandKey);
	keyEl.setAttribute('command', this.commandId);
	keyEl.setAttribute('modifiers', 'accel,shift');
	keyEl.setAttribute('key', 'D');

	wideKeyset.appendChild(keyEl);

	this.keyEl = keyEl;

	return true;
};

$self.controller.prototype.canExecute = function() {

	// Most commands cannot execute outside an editor
	return (ko.views.manager &&
			ko.views.manager.currentView &&
			ko.views.manager.currentView.getAttribute('type') === 'editor' &&
			ko.views.manager.currentView.document &&
			ko.views.manager.currentView.scimoz);
}

/** @abstract **/
$self.controller.prototype.trigger = function() {};
