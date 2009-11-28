$toolkit.include('editor');
$toolkit.include('htmlUtils');
$toolkit.include('library');

const Cc = Components.classes;
const Ci = Components.interfaces;

var SUBLANGUAGE_SUPPORTED_LIST = ['HTML', 'XML', 'PHP'];

$self.provider = function() {

	// Call parent's constructor
	var providerName, providerOrdering;

	$toolkit.command.abbreviation.provider.apply(this, [providerName = 'tagComplete',
														providerOrdering = 6000]);

	this.getAllowedCharacters = function() {

		return ['<', 'a-z', 'A-Z', '0-9', '\\-', '\\_', '\\:'];
	};

	this.canExecute = function(view) {

		return (SUBLANGUAGE_SUPPORTED_LIST.indexOf(view.document.subLanguage) >= 0 &&
				$toolkit.editor.isHtmlBuffer(view));
	}

	this.findSnippet = function(view, abbreviation) {

		if ('<' === abbreviation.charAt(0))
			abbreviation = abbreviation.substr(1);

		var isXHtmlView = $toolkit.htmlUtils.isXHtmlDoctype($toolkit.editor.guessDoctype(view)),
			abbreviationLower = ('' + abbreviation).toLowerCase();
			snippet = null;

		// Some built-in snippets have different contents depending on the buffer DOCTYPE
		[(isXHtmlView ? '-xhtml' : '-html'), ''].forEach(function(suffix) {

			if ( ! snippet)
				snippet = $toolkit.library.getTagSnippet(abbreviation + suffix) ||
						  $toolkit.library.getTagSnippet(abbreviationLower + suffix);
		});

		// Advanced cases
		if ( ! snippet) {

			// We know a few HTML empty elements, wrap those accordingly
			if ($toolkit.htmlUtils.isEmptyTag(abbreviationLower))
				snippet = $toolkit.library.createSnippet('<' + abbreviation + (isXHtmlView ? ' /' : '') + '>[[%tabstop0]]');
			else if ($toolkit.htmlUtils.isHtmlTag(abbreviationLower))
				snippet = $toolkit.library.createSnippet('<' + abbreviation + '>[[%tabstop0]]</' + abbreviation + '>');
		}

		return snippet;
	};
};

$self.registerAll = function() {

	new $self.provider().register();
};
