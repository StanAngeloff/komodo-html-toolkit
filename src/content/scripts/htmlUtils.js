const HTMLUTILS_ELEMENTS = ['a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside',
							'audio', 'b', 'base', 'basefont', 'bb', 'bdo', 'big', 'blink', 'blockquote',
							'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col',
							'colgroup', 'command', 'datagrid', 'datalist', 'dd', 'del', 'details', 'dfn',
							'dialog', 'dir', 'div', 'dl', 'dt', 'em', 'embed', 'eventsource', 'fieldset',
							'figure', 'font', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3',
							'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img',
							'input', 'ins', 'isindex', 'kbd', 'keygen', 'label', 'legend', 'li', 'link',
							'map', 'mark', 'marquee', 'menu', 'meta', 'meter', 'nav', 'noframes',
							'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param',
							'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section',
							'select', 'small', 'source', 'span', 'strike', 'strong', 'style', 'sub',
							'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time',
							'title', 'tr', 'tt', 'u', 'ul', 'var', 'video'];

const HTMLUTILS_EMPTY_ELEMENTS = ['area', 'base', 'basefont', 'br', 'col', 'command', 'embed',
								  'eventsource', 'hr', 'img', 'input', 'isindex', 'keygen', 'link',
								  'meta', 'param', 'source'];

const HTMLUTILS_BLOCK_ELEMENTS = ['article', 'aside', 'blockquote', 'body', 'center', 'datagrid',
								  'datalist', 'details', 'dialog', 'dir', 'div', 'dl', 'fieldset',
								  'figure', 'footer', 'form', 'frameset', 'head', 'header', 'html',
								  'map', 'marquee', 'menu', 'nav', 'noframes', 'noscript', 'object',
								  'ol', 'optgroup', 'ruby', 'script', 'section', 'select', 'style',
								  'table', 'tbody', 'tfoot', 'thead', 'tr', 'ul'];

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

$self.isXHtmlDoctype = function(doctype) {

	return ((doctype || '').toUpperCase().indexOf('XHTML') > 0);
};

$self.escape = function(unsafe) {

	return ('' + unsafe).replace(/&/g, '&amp;')
						.replace(/"/g, '&quot;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;');
};
