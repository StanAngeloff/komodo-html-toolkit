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
	$toolkit.events.onUnload($self.dispatcher.unregister);
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
			return $self.dispatcher.commands.length;
		}

		return index;
	},

	removeCommand: function(obj) {

		var index = $self.dispatcher.indexOfCommand(obj);
		if (index >= 0)
			return $self.dispatcher.commands.splice(index, 1);

		return null;
	},

	indexOfCommand: function(obj) {

		for (var index = 0; index < $self.dispatcher.commands.length; index ++)
			if ($self.dispatcher.commands[index] === obj)
				return index;

		return -1;
	},

	onKeyPress: function(e) {

		// We cannot undo if the user makes changes to the buffer
		if (typeof ($toolkit.command.undo) === 'object')
			if (e.charCode > 0) $toolkit.command.undo.undoable = false;

		if ($self.dispatcher.commands.length)
			$self.dispatcher.process($self.dispatcher.event2key(e, true), e);
	},

	process: function(key, e) {

		for (var i = 0; i < $self.dispatcher.commands.length; i ++)
			if ($self.dispatcher.commands[i].keys.indexOf(key) >= 0)
				if ($self.dispatcher.commands[i].canExecute(e))
					$self.dispatcher.commands[i].trigger(e);
	}
};

$toolkit.trapExceptions($self.dispatcher);

$self.controller = function(command, keys, allowChange) {

	this.command = command;

	this.commandName = 'cmd_htmlToolkit_' + this.command;
	this.commandKey = 'key_' + this.commandName;

	this.keys = (typeof (keys) === 'string' ? [keys] : keys);
	this.allowChange = !! allowChange;

	this.register = function() {

		if (this.allowChange) {

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

		var l10n = Cc['@mozilla.org/intl/stringbundle;1'].getService(Ci.nsIStringBundleService)
														 .createBundle('chrome://htmltoolkit/locale/command.properties');

		broadcasterEl.setAttribute('desc', l10n.GetStringFromName(this.command));

		globalSet.appendChild(broadcasterEl);

		// Make sure the User has not overridden the default key bindings
		var existingKeyBindings = gKeybindingMgr.command2keysequences(this.commandName);
		if (existingKeyBindings.length < 1) {

			var defaultKeyBindings = {};

			defaultKeyBindings[this.commandName] = this.keys;
			gKeybindingMgr._add_keybinding_sequences(defaultKeyBindings);
		}

		return true;
	};

	this.unregister = function() {

		if (this.allowChange) {

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
