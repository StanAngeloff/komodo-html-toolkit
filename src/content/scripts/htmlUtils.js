const HTMLUTILS_EMPTY_ELEMENTS = ['base', 'br', 'hr', 'img', 'input', 'link', 'meta', 'param'];

const HTMLUTILS_BLOCK_ELEMENTS = ['blockquote', 'body', 'dl', 'fieldset', 'form', 'div', 'head',
								  'html', 'object', 'ol', 'select', 'style', 'table', 'tbody',
								  'tfoot', 'thead', 'tr'];

$self.isEmptyTag = function(tagName) {

	return HTMLUTILS_EMPTY_ELEMENTS.indexOf(tagName) >= 0;
};

$self.isBlockTag = function(tagName) {

	return HTMLUTILS_BLOCK_ELEMENTS.indexOf(tagName) >= 0;
};

$self.fixTagCase = function(tagName, referenceName) {

	referenceName = referenceName.replace(/^\/?/, '');
	// If our reference tag is shorter, expand its last character
	while (referenceName.length < tagName.length)
		referenceName += referenceName.charAt(referenceName.length - 1);

	var referenceChar,
		tagCased = '';

	for (var i = 0; i < tagName.length; i ++) {

		referenceChar = referenceName.charAt(i);
		// Test for uppercase
		if (referenceChar.toLowerCase() !== referenceChar)
			tagCased += tagName.charAt(i).toUpperCase();
		// Test for lowercase
		else if (referenceChar.toUpperCase() !== referenceChar)
			tagCased += tagName.charAt(i).toLowerCase();
		// Case remains unchanged
		else
			tagCased += tagName.charAt(i);
	}

	return tagCased;
};
