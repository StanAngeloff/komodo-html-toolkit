const HTMLUTILS_ELEMENTS = ['a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside',
							'audio', 'b', 'base', 'basefont', 'bb', 'bdo', 'big', 'blink', 'blockquote',
							'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col',
							'colgroup', 'command', 'datagrid', 'datalist', 'dd', 'del', 'details', 'dfn',
							'dialog', 'dir', 'div', 'dl', 'dt', 'em', 'embed', 'eventsource', 'fieldset',
							'figure', 'font', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3',
							'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img',
							'input', 'ins', 'isindex', 'kbd', 'label', 'legend', 'li', 'link', 'map',
							'mark', 'marquee', 'menu', 'meta', 'meter', 'nav', 'noframes', 'noscript',
							'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre',
							'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section',
							'select', 'small', 'source', 'span', 'strike', 'strong', 'style', 'sub',
							'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time',
							'title', 'tr', 'tt', 'u', 'ul', 'var', 'video'];

const HTMLUTILS_EMPTY_ELEMENTS = ['base', 'br', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param'];

const HTMLUTILS_BLOCK_ELEMENTS = ['blockquote', 'body', 'dl', 'fieldset', 'form', 'div', 'head', 'html',
								  'marquee', 'object', 'ol', 'select', 'style', 'table', 'tbody', 'tfoot',
								  'thead', 'tr'];

$self.isHtmlTag = function(tagName) {

	return HTMLUTILS_ELEMENTS.indexOf(tagName) >= 0;
};

$self.isEmptyTag = function(tagName) {

	return HTMLUTILS_EMPTY_ELEMENTS.indexOf(tagName) >= 0;
};

$self.isBlockTag = function(tagName) {

	return HTMLUTILS_BLOCK_ELEMENTS.indexOf(tagName) >= 0;
};

$self.fixTagCase = function(tagName, referenceName) {

	// Strip leading slash e.g. when passed as /tagName
	referenceName = referenceName.replace(/^\/?/, '');
	// If our reference tag is shorter, expand its last character
	while (referenceName.length < tagName.length)
		referenceName += referenceName.charAt(referenceName.length - 1);

	var referenceChar,
		tagCased = '';

	for (var i = 0; i < tagName.length; i ++) {

		referenceChar = referenceName.charAt(i);
		if (referenceChar.toLowerCase() !== referenceChar)
			tagCased += tagName.charAt(i).toUpperCase();
		else if (referenceChar.toUpperCase() !== referenceChar)
			tagCased += tagName.charAt(i).toLowerCase();
		else
			tagCased += tagName.charAt(i);
	}

	return tagCased;
};
