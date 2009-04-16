$toolkit.include('htmlUtils');
$toolkit.include('io');
$toolkit.include('regexp');

var LIBRARY_SNIPPETS_MAP = null,
	LIBRARY_SNIPPETS_PATH = 'content/library/tagSnippets';

var LIBRARY_NEWLINE_MAP = null,
	LIBRARY_NEWLINE_PATH = 'content/library/newlineSnippets';

$self.createSnippet = function(value, name, parentName, setSelection, indentRelative) {

	return { type: 'snippet',
			 name: (name || 'HTML Toolkit'),
			 parent: { name: (parentName || '*internal*') },
			 set_selection: (typeof (setSelection) === 'undefined' ? 'true' : setSelection),
			 indent_relative: (typeof (indentRelative) === 'undefined' ? 'true' : indentRelative),
			 value: value,
			 hasAttribute: function(name) { return (name in this); },
			 getStringAttribute: function(name) { return ('' + this[name]); } };
};

$self.getTagSnippet = function(tagName) {

	if (LIBRARY_SNIPPETS_MAP === null)
		$self.initializeTagSnippets();

	var tagNameLower = '$' + tagName.toLowerCase();
	if (tagNameLower in LIBRARY_SNIPPETS_MAP)
		return $self.createSnippet(LIBRARY_SNIPPETS_MAP[tagNameLower](tagName));

	return null;
};

$self.getNewLineSnippet = function(tagBefore, tagAfter) {

	if (LIBRARY_NEWLINE_MAP === null)
		$self.initializeNewlineSnippets();

	var tagPairLower = ('<' + tagBefore + '><' + tagAfter + '>').toLowerCase();
	if (tagPairLower in LIBRARY_NEWLINE_MAP) {

		var newLineSnippet = LIBRARY_NEWLINE_MAP[tagPairLower];

		if (typeof (newLineSnippet) === 'string')
			return $self.createSnippet(LIBRARY_NEWLINE_MAP[newLineSnippet](tagBefore, tagAfter));

		return $self.createSnippet(newLineSnippet(tagBefore, tagAfter));
	}

	return null;
};

$self.initializeTagSnippets = function() {

	LIBRARY_SNIPPETS_MAP = {};
	$self.initializeSnippetsFromURI(LIBRARY_SNIPPETS_PATH, LIBRARY_SNIPPETS_MAP);
};

$self.initializeNewlineSnippets = function() {

	LIBRARY_NEWLINE_MAP = {};
	$self.initializeSnippetsFromURI(LIBRARY_NEWLINE_PATH, LIBRARY_NEWLINE_MAP);

	var whereFiles = $toolkit.io.findFilesInURI(LIBRARY_NEWLINE_PATH, '*.where', true);

	for (var i = 0; i < whereFiles.length; i ++) {

		var snippetName = whereFiles[i].leafName.replace(/\.where$/, ''),
			whereLines = $toolkit.io.readLinesFromFile(whereFiles[i]);

		if ( ! (whereLines && whereLines.length))
			continue;

		for (var j = 0; j < whereLines.length; j ++)
			LIBRARY_NEWLINE_MAP[whereLines[j]] = '$' + snippetName;
	}
};

$self.initializeSnippetsFromURI = function(path, map) {

	var snippetFiles = $toolkit.io.findFilesInURI(path, '*.html', true);

	for (var i = 0; i < snippetFiles.length; i ++) {

		var snippetName = snippetFiles[i].leafName.replace(/\.html$/, ''),
			snippetContents = $toolkit.io.readEntireFile(snippetFiles[i]);

		if ( ! snippetContents)
			continue;

		map['$' + snippetName] = (function(contents) {
			return function(tagName) {
				return contents.replace(new RegExp($toolkit.regexp.patterns['SnippetTag'], 'g'),
										function(entireMatch, tagBefore, tagMatch, tagAfter) {
					return tagBefore + $toolkit.htmlUtils.fixTagCase(tagMatch, tagName) + tagAfter;
				});
			};
		})(snippetContents);
	}
};
