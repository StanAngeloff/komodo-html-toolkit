$toolkit.include('htmlUtils');

var $F = $toolkit.htmlUtils.fixTagCase;

var LIBRARY_SNIPPETS_MAP = {
	'ul': function(tagName) { return (
			  '<' + tagName + '>\n'
			+     '\t<' + $F('li', tagName) + '>[[%tabstop0]]</' + $F('li', tagName) + '>\n'
			+ '</' + tagName + '>');
		  },

	'ol': function(tagName) { return (
			  '<' + tagName + ' type="[[%tabstop1:1]]">\n'
			+     '\t<' + $F('li', tagName) + '>[[%tabstop0]]</' + $F('li', tagName) + '>\n'
			+ '</' + tagName + '>');
		  },

	'dl': function(tagName) { return (
			  '<' + tagName + '>\n'
			+     '\t<' + $F('dt', tagName) + '>[[%tabstop1]]</' + $F('dt', tagName) + '>\n'
			+     '\t<' + $F('dd', tagName) + '>[[%tabstop0]]</' + $F('dd', tagName) + '>\n'
			+ '</' + tagName + '>');
		  }
};

var LIBRARY_NEWLINE_MAP = {

	'@li': function(tagBefore, tagAfter) { return (
			   '\n<' + $F('li', tagBefore) + '>[[%tabstop0]]</' + $F('li', tagBefore) + '>');
		   },

		'</li><li>': '@li',
		'</li></ul>': '@li',
		'</li></ol>': '@li',

	'@td': function(tagBefore, tagAfter) { return (
			   '\n<' + $F('td', tagBefore) + '>[[%tabstop0]]</' + $F('td', tagBefore) + '>');
		   },

		'</td><td>': '@td',
		'</td></tr>': '@td',

	'@tr': function(tagBefore, tagAfter) { return (
			   '\n<' + $F('tr', tagBefore) + '>'
			 +     '\n\t[[%tabstop0]]'
			 + '\n</' + $F('tr', tagBefore) + '>');
		   },

		'</tr><tr>': '@tr',
		'</tr></thead>': '@tr',
		'</tr></tbody>': '@tr',
		'</tr></tfoot>': '@tr',
		'</tr></table>': '@tr',

	'@dt': function(tagBefore, tagAfter) { return (
			   '\n\n<' + $F('dt', tagBefore) + '>[[%tabstop1]]</' + $F('dt', tagBefore) + '>'
			 + '\n<' + $F('dd', tagBefore) + '>[[%tabstop0]]</' + $F('dd', tagBefore) + '>');
		   },

		'</dd></dl>': '@dt',

	'@dd': function(tagBefore, tagAfter) { return (
			   '\n<' + $F('dd', tagBefore) + '>[[%tabstop0]]</' + $F('dd', tagBefore) + '>');
		   },

		'</dt><dd>': '@dd',
		'</dd><dd>': '@dd',
		'</dd><dt>': '@dd'
};

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

	var tagNameLower = tagName.toLowerCase();
	if (tagNameLower in LIBRARY_SNIPPETS_MAP)
		return $self.createSnippet(LIBRARY_SNIPPETS_MAP[tagNameLower](tagName));

	return null;
};

$self.getNewLineSnippet = function(tagBefore, tagAfter) {

	var tagPairLower = ('<' + tagBefore + '><' + tagAfter + '>').toLowerCase();
	if (tagPairLower in LIBRARY_NEWLINE_MAP) {

		var newLineSnippet = LIBRARY_NEWLINE_MAP[tagPairLower];

		if (typeof (newLineSnippet) === 'string')
			return $self.createSnippet(LIBRARY_NEWLINE_MAP[newLineSnippet](tagBefore, tagAfter));

		return $self.createSnippet(newLineSnippet(tagBefore, tagAfter));
	}

	return null;
};
