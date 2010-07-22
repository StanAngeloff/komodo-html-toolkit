// Store existing event handler
var OnPreferencePageInitalize__htmlOverlay = (typeof (OnPreferencePageInitalize) === 'function' ? OnPreferencePageInitalize : function() {});

OnPreferencePageInitalize = function(prefset) {

	// Call previous event handler
	OnPreferencePageInitalize__htmlOverlay(prefset);

	// We need to remove Komodo's spacer at document end
	var spacerEl = document.getElementsByTagName('spacer')[0];

	if (spacerEl && spacerEl.parentNode &&
		'window' === spacerEl.parentNode.tagName)
		spacerEl.parentNode.removeChild(spacerEl);

	// Bring up Options dialogue on button click
	document.getElementById('htmltoolkitOptions').addEventListener('click', function() {
		window.openDialog('chrome://htmltoolkit/content/pref/htmltoolkit.xul', 'htmltoolkitPrefWindow', 'chrome,titlebar,toolbar,dialog,modal,centerscreen');
	}, false);
};
