$toolkit.include('editor');

const Cc = Components.classes;
const Ci = Components.interfaces;

$self.provider = function() {

	// Call parent's constructor
	var providerName, supportedLanguages, unsupportedLanguages;

	$toolkit.command.abbreviation.provider.apply(this, [providerName = 'toolbox',
														supportedLanguages = true,
														unsupportedLanguages = false]);

	this.getAllowedCharacters = function() { return ['\\w', '\\.']; };

	this.findSnippet = function(view, abbreviation) {

		var viewLanguages = [];

		if (view.document.subLanguage)
			viewLanguages.push(view.document.subLanguage);

		if (view.document.language && viewLanguages.indexOf(view.document.language) < 0)
			viewLanguages.push(view.document.language);

		if (viewLanguages.indexOf('General') < 0)
			viewLanguages.push('General');

		// Special cases
		if (viewLanguages.indexOf('HTML') < 0) {

			// subLanguage is not set to HTML in Smarty templates
			if (view.document.subLanguage === 'Smarty')
				viewLanguages.push('HTML');
			// Advanced cases e.g. immediately before <?php blocks
			else if ($toolkit.editor.isHtmlBuffer(view))
				viewLanguages.push('HTML');
		}

		var partService = Cc['@activestate.com/koPartService;1'].getService(Ci.koIPartService),
			abbreviationsFolders = partService.getParts('folder', 'name', 'Abbreviations', '*', partService.currentProject, {}),
			abbreviationName = abbreviation.split('.').shift();

		for (var i = 0; i < abbreviationsFolders.length; i ++)
			for (var j = 0; j < viewLanguages.length; j ++) {

				var languageFolder = abbreviationsFolders[i].getChildWithTypeAndStringAttribute('folder', 'name', viewLanguages[j], false);
				if (languageFolder) {

					var snippet = languageFolder.getChildWithTypeAndStringAttribute('snippet', 'name', abbreviationName, false);
					if (snippet)
						return snippet;

					var folder = languageFolder.getChildWithTypeAndStringAttribute('folder', 'name', abbreviationName, true);
					if (folder)
						return folder;
				}
			}

		return null;
	};
};

$self.registerAll = function() {

	new $self.provider().register();
};
