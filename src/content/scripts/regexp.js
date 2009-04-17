$self.patterns = {

	'Tag': '<([a-zA-Z0-9\\-\\_\\:\\/]+)\\b',
	'TagWord': '[<a-zA-Z0-9\\-\\_\\:]+>?',
	'OpeningTag': '<([a-zA-Z0-9\\-\\_\\:]+)',
	'ClosedTag': '(<\\/([a-zA-Z0-9\\-\\_\\:]+)>)|(\\s*\\/>)',
	'SnippetTag': '(<[\\/]?)html\\:([a-zA-Z0-9\\-\\_\\:]+)(\\b)',
	'Operator': '[\\/\\-\\?\\#\\%]+\\s*',
	'OutOfTag': '(.<)|(<\\/)',
	'Whitespace': '\\s+',
	'GeckoImageFormats': '(\.(?:png|apng|jpg|jpeg|gif|bmp|xbm|svg))',
	'Protocol': '\\w+:\/\/'
};

$self.match = function(regexp, context, prepend, append, modifiers) {

	var re = new RegExp((prepend || '')
					  + regexp.replace('|', (append || '') + '|' + (prepend || ''), (modifiers || 'g'))
					  + (append || ''));

	$self.lastMatches = ('' + context).match(re);

	return ($self.lastMatches && $self.lastMatches.length);
};

for (var pattern in $self.patterns)
	$self['match' + pattern] = (function(regexp) {
		return function(context, prepend, append, modifiers) {
			return $self.match(regexp, context, prepend, append, modifiers);
		};
	})($self.patterns[pattern]);
