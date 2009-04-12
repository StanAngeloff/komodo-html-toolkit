var REGEXP_PATTERNS = {

	'Tag': '<([a-zA-Z0-9\\-\\_\\:\\/]+)\\b',
	'ClosedTag': '<\\/([a-zA-Z0-9\\-\\_\\:]+)>',
	'Whitespace': '\\s+'
};

$self.match = function(regexp, context, prepend, append) {

	var re = new RegExp((prepend || '') + regexp + (append || ''));

	$self.lastMatches = ('' + context).match(re);

	return ($self.lastMatches && $self.lastMatches.length);
};

for (var pattern in REGEXP_PATTERNS)
	$self['match' + pattern] = (function(regexp) {
		return function(context, prepend, append) {
			return $self.match(regexp, context, prepend, append);
		};
	})(REGEXP_PATTERNS[pattern]);
