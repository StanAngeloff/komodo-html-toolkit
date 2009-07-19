$self.patterns = {

	'Tag': '<([a-zA-Z0-9\\-\\_\\:\\/]+)\\b',
	'TagWord': '[<a-zA-Z0-9\\-\\_\\:]+>?',
	'TagName': '[<\\/]*([a-zA-Z0-9\\-\\_\\:]+)\\b',
	'OpeningTag': '<([a-zA-Z0-9\\-\\_\\:]+)',
	'ClosedTag': '(<\\/([a-zA-Z0-9\\-\\_\\:]+)>)|(\\s*\\/>)',
	'SnippetTag': '(<[\\/]?)html\\:([a-zA-Z0-9\\-\\_\\:]+)(\\b)',
	'AttributeName': '[a-zA-Z0-9\\-\\_\\:]+\\b',
	'Operator': '[\\/\\-\\?\\#\\%]+\\s*',
	'OutOfTag': '(.<)|(<\\/)',
	'Word': '\\w+',
	'Whitespace': '\\s+',
	'GeckoImageFormats': '(\.(?:png|apng|jpg|jpeg|gif|bmp|xbm|svg))',
	'Protocol': '\\w+:\/\/',
	'DoctypeDeclaration': '<!DOCTYPE\\s+(\\S+)\\s+(PUBLIC|SYSTEM)\\s+("[^"]*"|\'[^\']*\')\\s*("[^"]*"|\'[^\']*\')?\\s*(\\[|>)',
	'Html5DoctypeDeclaration': '<!doctype\\s+html>',
	'XmlDeclaration': '<\\?xml\\s+[^\\?]+\\?>'
};

$self.match = function(regexp, context, prepend, append, modifiers) {

	prepend = (prepend || '');
	append = (append || '');

	var re = new RegExp(prepend + regexp.replace('|', append + '|' + prepend, 'g') + append,
						(modifiers || ''));

	$self.lastMatches = ('' + context).match(re);

	return ($self.lastMatches && $self.lastMatches.length);
};

for (var pattern in $self.patterns)
	$self['match' + pattern] = (function(regexp) {
		return function(context, prepend, append, modifiers) {
			return $self.match(regexp, context, prepend, append, modifiers);
		};
	})($self.patterns[pattern]);
