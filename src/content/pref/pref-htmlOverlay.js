// Store existing event handler
var OnPreferencePageInitalizeBase = (typeof (OnPreferencePageInitalize) === 'function' ? OnPreferencePageInitalize : function() {});

OnPreferencePageInitalize = function(prefset) {

	// Call previous event handler
	OnPreferencePageInitalizeBase(prefset);

	// TODO: Collapse first spacer in document
};
