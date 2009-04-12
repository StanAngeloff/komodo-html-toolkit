$toolkit.include('events');

$self.destroy = function() {

	if ($self.dispatcher)
		$self.dispatcher.unregister();
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

			eval('$self.dispatcher.event2key = ' + code.replace('normCharCode >=', 'normCharCode == 32 || normCharCode >=') + ';');

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

		if ($self.dispatcher.commands.length)
			$self.dispatcher.process($self.dispatcher.event2key(e, true), e);
	},

	process: function(key, e) {

		for (var i = 0; i < $self.dispatcher.commands.length; i ++)
			if ($self.dispatcher.commands[i].key === key)
				if ($self.dispatcher.commands[i].canExecute(e))
					$self.dispatcher.commands[i].trigger(e);
	}
};

$toolkit.events.onLoad($self.dispatcher.register);
$toolkit.events.onUnload($self.dispatcher.unregister);

$self.controller = function(command, key) {

	this.command = command;
	this.key = key;

	this.register();
};

$self.controller.prototype.constructor = $self.controller;

$self.controller.prototype.register = function() {

	$self.dispatcher.addCommand(this);
};

$self.controller.prototype.unregister = function() {

	$self.dispatcher.removeCommand(this);
};

$self.controller.prototype.canExecute = function(e) {

	// Most commands cannot execute outside an editor
	return (ko.views.manager &&
			ko.views.manager.currentView &&
			ko.views.manager.currentView.getAttribute('type') === 'editor' &&
			ko.views.manager.currentView.document &&
			ko.views.manager.currentView.scimoz);
}

$self.controller.prototype.onKeyUp = function(callback) {

	var topView = ko.views.manager.topView;
	if (topView) {

		var keyUpCallback = function() {

			try { callback(); }
			finally { topView.removeEventListener('keyup', keyUpCallback, true); }
		};

		topView.addEventListener('keyup', keyUpCallback, true);
	}
};

/** @abstract **/
$self.controller.prototype.trigger = function(e) {};
