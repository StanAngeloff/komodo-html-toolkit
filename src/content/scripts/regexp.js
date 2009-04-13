$self.patterns = {

	'Tag': '<([a-zA-Z0-9\\-\\_\\:\\/]+)\\b',
	'TagWord': '[<a-zA-Z0-9\\-\\_\\:]+>?',
	'OpeningTag': '<([a-zA-Z0-9\\-\\_\\:]+)',
	'ClosedTag': '(<\\/([a-zA-Z0-9\\-\\_\\:]+)>)|(\s*\\/>)',
	'SnippetTag': '(<[\\/]?)html\\:([a-zA-Z0-9\\-\\_\\:]+)(\\b)',
	'Operator': '[\\/\\-\\?\\#\\%]+\\s*',
	'OutOfTag': '(.<)|(<\\/)',
	'Whitespace': '\\s+'
};

$self.match = function(regexp, context, prepend, append) {

	var re = new RegExp((prepend || '') + regexp + (append || ''));

	$self.lastMatches = ('' + context).match(re);

	return ($self.lastMatches && $self.lastMatches.length);
};

for (var pattern in $self.patterns)
	$self['match' + pattern] = (function(regexp) {
		return function(context, prepend, append) {
			return $self.match(regexp, context, prepend, append);
		};
	})($self.patterns[pattern]);
