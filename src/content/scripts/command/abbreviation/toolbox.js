$toolkit.include('editor');

const Cc = Components.classes;
const Ci = Components.interfaces;

$self.provider = function() {

	// Call parent's constructor
	var providerName, providerOrdering;

	$toolkit.command.abbreviation.provider.apply(this, [providerName = 'toolbox',
														providerOrdering = 5000]);

	this.getAllowedCharacters = function() { return ['\\w', '\\.']; };

	this.findSnippet = function(view, abbreviation) {

		var viewLanguages = [];

		if (view.document.subLanguage)
			viewLanguages.push(view.document.subLanguage);

		if (view.document.language && viewLanguages.indexOf(view.document.language) < 0)
			viewLanguages.push(view.document.language);

		// Special cases
		if (viewLanguages.indexOf('HTML') < 0) {

			// subLanguage is not set to HTML in Smarty templates
			if (view.document.subLanguage === 'Smarty')
				viewLanguages.push('HTML');
			// Advanced cases e.g. immediately before <?php blocks
			else if ($toolkit.editor.isHtmlBuffer(view))
				viewLanguages.push('HTML');
		}

		if (viewLanguages.indexOf('General') < 0)
			viewLanguages.push('General');

		var partService = Cc['@activestate.com/koPartService;1'].getService(Ci.koIPartService),
			abbreviationsFolders = partService.getParts('folder', 'name', 'Abbreviations', '*', partService.currentProject, {}),
			abbreviationName = abbreviation.split('.').shift(),
			languageContainers, languageSnippetsContainer, languageSnippets;

		for (var i = 0; i < abbreviationsFolders.length; i ++)
			for (var j = 0; j < viewLanguages.length; j ++) {

				// Find all sub-folders at top level
				languageContainers = {};
				abbreviationsFolders[i].getChildrenByType('folder', false, languageContainers, {});
				if (languageContainers.value) {

					languageContainers = languageContainers.value;

					// Match the view language against the name of each folder
					languageSnippetsContainer = null;
					for (var k = 0; k < languageContainers.length; k ++)
						if (viewLanguages[j].toLowerCase() === languageContainers[k].name.toLowerCase()) {

							languageSnippetsContainer = languageContainers[k];
							break;
						}

					// If we have found a folder matching our view language, look for a snippet inside
					if (languageSnippetsContainer) {

						languageSnippets = {};
						// Find all snippets (incl. nested folders) inside the view language folder
						languageSnippetsContainer.getChildrenByType('snippet', true, languageSnippets, {});
						if (languageSnippets.value) {

							languageSnippets = languageSnippets.value;
							for (k = 0; k < languageSnippets.length; k ++) {

								// Attempt a full-name match
								if (languageSnippets[k].name == abbreviationName)
									return languageSnippets[k];
								// Attempt to match first word-part of the snippet name
								else if (languageSnippets[k].name.split(/[\W\.]+/).shift() == abbreviationName)
									return languageSnippets[k];
							}
						}

						languageSnippets = {};
						// Find all folders (incl. nested folders) inside the view language folder
						languageSnippetsContainer.getChildrenByType('folder', true, languageSnippets, {});
						if (languageSnippets.value) {

							languageSnippets = languageSnippets.value;
							for (k = 0; k < languageSnippets.length; k ++) {

								// Attempt a full-name match
								if (languageSnippets[k].name == abbreviationName)
									return languageSnippets[k];
							}
						}
					}
				}
			}

		return null;
	};
};

$self.registerAll = function() {

	new $self.provider().register();
};
