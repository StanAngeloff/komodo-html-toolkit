xtk.include('controller');

$toolkit.include('events');

const Cc = Components.classes;
const Ci = Components.interfaces;

const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

$self.destroy = function() {

	if ($self.dispatcher)
		$self.dispatcher.unregister();
};

$self.initialize = function() {

	$toolkit.events.onLoad($self.dispatcher.register);
};

$self.dispatcher = {

	isRegistered: false,
	commands: [],
	event2key: function() { return null; },

	register: function() {

		var topView = ko.views.manager.topView;
		if (topView) {

			topView.addEventListener('keypress', $self.dispatcher.onKeyPress, true);

			$self.dispatcher.isRegistered = true;

			// HACK: Komodo does not recognise Shift+Space so we need to hack
			// it in the most dumb way possible
			var keybindingManager = new ko.keybindings.manager(),
				code = keybindingManager.event2keylabel.toString();

			code = code.replace('var data', 'var _log = { info: function(e) { $log(e); }, '
													   + 'warn: function(e) { $log(e); }, '
													   + 'error: function(e) { $log(e); }, '
													   + 'exception: function(e) { $log(e); } }; var data');
			code = code.replace('var data', 'var VKCodes = ko.keybindings.VKCodes; var data');
			code = code.replace('var data', 'var VKModifiers = ko.keybindings.VKModifiers; var data');

			code = code.replace('normCharCode >=', 'normCharCode == 32 || normCharCode >=');

			eval('$self.dispatcher.event2key = ' + code + ';');

			return true;
		}

		return false;
	},

	unregister: function() {

		if ($self.dispatcher.isRegistered) {

			var topView = ko.views.manager.topView;
			if (topView) {

				topView.removeEventListener('keypress', $self.dispatcher.onKeyPress, true);

				$self.dispatcher.isRegistered = false;

				return true;
			}
		}

		return false;
	},

	addCommand: function(obj) {

		var index = $self.dispatcher.indexOfCommand(obj);
		if (index < 0) {

			$self.dispatcher.commands.push(obj);
			$self.dispatcher.sortCommands();

			return $self.dispatcher.commands.length;
		}

		return index;
	},

	removeCommand: function(obj) {

		var index = $self.dispatcher.indexOfCommand(obj);
		if (index >= 0) {

			var command = $self.dispatcher.commands.splice(index, 1);

			$self.dispatcher.sortCommands();

			return command;
		}

		return null;
	},

	indexOfCommand: function(obj) {

		for (var index = 0; index < $self.dispatcher.commands.length; index ++)
			if ($self.dispatcher.commands[index] === obj)
				return index;

		return -1;
	},

	sortCommands: function() {

		$self.dispatcher.commands.sort(function(left, right) {
			return (left.ordering < right.ordering ? -1 : (left.ordering > right.ordering ? +1 : 0));
		});
	},

	onKeyPress: function(e) {

		// We cannot undo if the user makes changes to the buffer
		if (typeof ($toolkit.command.undo) === 'object')
			if (e.charCode > 0) $toolkit.command.undo.undoable = 0;

		if ($self.dispatcher.commands.length)
			$self.dispatcher.process($self.dispatcher.event2key(e, true), e);
	},

	process: function(key, e) {

		var eventWrapped = false;

		for (var i = 0; i < $self.dispatcher.commands.length; i ++)
			if ($self.dispatcher.commands[i].triggerKeys.indexOf(key) >= 0)
				if ($self.dispatcher.commands[i].canExecute(e)) {

					if ( ! eventWrapped) {

						e.stopPropagation__command = e.stopPropagation;
						e.cancelled__command = false;
						e.stopPropagation = function() {

							e.cancelled__command = true;
							e.stopPropagation__command();
						};

						eventWrapped = true;
					}

					$self.dispatcher.commands[i].trigger(e);
					if (e.cancelled__command)
						break;
				}

		if (eventWrapped) {

			e.stopPropagation = e.stopPropagation__command;
			delete e['stopPropagation__command'];
		}
	}
};

$toolkit.trapExceptions($self.dispatcher);

var COMMAND_ORDERING = 9900;

$self.controller = function(command, triggerKeys, canChangeTriggerKeys, commandOrdering) {

	this.command = command;

	this.commandName = 'cmd_htmlToolkit_' + this.command;
	this.commandKey = 'key_' + this.commandName;

	this.triggerKeys = (typeof (triggerKeys) === 'string' ? [triggerKeys] : triggerKeys);

	// Ctrl is Meta on a Mac, update assigned triggers keys to match
	var isMac = (navigator.platform.indexOf('Mac') >= 0);
	if (isMac && this.triggerKeys)
		for (var i = 0; i < this.triggerKeys.length; i ++)
			this.triggerKeys[i] = this.triggerKeys[i].replace('Ctrl', 'Meta', 'g');

	this.canChangeTriggerKeys = !! canChangeTriggerKeys;

	this.ordering = (typeof (commandOrdering) === 'undefined' ? ++ COMMAND_ORDERING : parseInt(commandOrdering));

	this.register = function() {

		if (this.canChangeTriggerKeys) {

			var $instance = this;
			$toolkit.events.onLoad(function() {

				$instance.registerCommand();
				window.controllers.appendController($instance);
			});

		} else
			$self.dispatcher.addCommand(this);
	};

	this.registerCommand = function() {

		var globalSet = document.getElementById('broadcasterset_global');
		if ( ! globalSet)
			throw "FATAL: Cannot find Komodo's global broadcaster set.";

		// Make sure we are not registered already
		if (globalSet.getElementsByAttribute('id', this.commandName).length > 0)
			return true;

		// Register command as new broadcaster
		var broadcasterEl = document.createElementNS(XUL_NS, 'broadcaster');

		broadcasterEl.setAttribute('id', this.commandName);
		broadcasterEl.setAttribute('key', this.commandKey);
		broadcasterEl.setAttribute('oncommand', 'ko.commands.doCommandAsync("' + this.commandName + '", event);');

		broadcasterEl.setAttribute('desc', $toolkit.l10n('command').GetStringFromName(this.command + '.binding'));

		globalSet.appendChild(broadcasterEl);

		// Make sure the User has not overridden the default key bindings
		var existingKeyBindings = gKeybindingMgr.command2keysequences(this.commandName);
		if (existingKeyBindings.length < 1) {

			var defaultKeyBindings = {};

			defaultKeyBindings[this.commandName] = this.triggerKeys;
			gKeybindingMgr._add_keybinding_sequences(defaultKeyBindings);
		}

		return true;
	};

	this.unregister = function() {

		if (this.canChangeTriggerKeys) {

			var $instance = this;
			$toolkit.events.onUnload(function() { window.controllers.removeController($instance); });
		}
		else
			$self.dispatcher.removeCommand(this);
	};

	this.supportsCommand = function(command) {

		if (command === this.commandName)
			return true;

		return false;
	};

	this.isCommandEnabled = function(command) {

		if (command === this.commandName)
			return this.canExecute(false);

		return false;
	};

	this.doCommand = function(command) {

		if (this.isCommandEnabled(command)) {

			var $a = [];
			for (var i = 1; i < arguments.length; i ++)
				$a.push(arguments[i]);

			this.trigger.apply(this, $a);
		}
	};

	this.canExecute = function(e) {

		// Most commands cannot execute outside an editor
		return (ko.views.manager &&
				ko.views.manager.currentView &&
				ko.views.manager.currentView.getAttribute('type') === 'editor' &&
				ko.views.manager.currentView.document &&
				ko.views.manager.currentView.scimoz);
	}

	this.onKeyEvent = function(type, callback) {

		var topView = ko.views.manager.topView;
		if (topView) {

			var keyEventCallback = function(e) {

				e.keyLabel = $self.dispatcher.event2key(e, true);

				try { callback(e); }
				finally { topView.removeEventListener('key' + type, keyEventCallback, true); }
			};

			topView.addEventListener('key' + type, keyEventCallback, true);
		}
	};

	/** @abstract **/
	this.trigger = function(e) {};
};
