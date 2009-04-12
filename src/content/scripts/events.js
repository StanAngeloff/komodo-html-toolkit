const Cc = Components.classes;
const Ci = Components.interfaces;

var EVENTS_LOAD_CHAIN = [];
var EVENTS_UNLOAD_CHAIN = [];

var EVENTS_HAS_LOADED = false;
var EVENTS_HAS_UNLOADED = false;

$self.onLoad = function(callback) {

	if (EVENTS_HAS_LOADED)
		return callback();

	EVENTS_LOAD_CHAIN.push(callback);
	return EVENTS_LOAD_CHAIN.length;
};

$self.onUnload = function(callback) {

	if (EVENTS_HAS_UNLOADED)
		return callback();

	EVENTS_UNLOAD_CHAIN.push(callback);
	return EVENTS_UNLOAD_CHAIN.length;
};

$self.callLoadChain = function() {

	while ((callback = EVENTS_LOAD_CHAIN.pop()))
		callback();

	EVENTS_HAS_LOADED = true;
};

$self.callUnloadChain = function() {

	while ((callback = EVENTS_UNLOAD_CHAIN.pop()))
		callback();

	EVENTS_HAS_UNLOADED = true;
};

$self.observerService = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
$self.observer = {

	observe: function(subject, topic, data) {

		$self.observerService.removeObserver($self.observer, 'komodo-ui-started');

		$self.callLoadChain();
	}
};

// Listen for komodo-ui-started instead of window.load to ensure all managers are set up
$self.observerService.addObserver($self.observer, 'komodo-ui-started', false);
window.addEventListener('unload', $self.callUnloadChain, false);
