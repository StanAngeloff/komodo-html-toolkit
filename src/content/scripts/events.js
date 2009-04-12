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

window.addEventListener('load', $self.callLoadChain, false);
window.addEventListener('unload', $self.callUnloadChain, false);
