$toolkit.include('regexp');

// Set limit of tags/attributes we capture before we stop guessing
const EDITOR_GUESS_LIMIT = 20;

// Set default word used when the casing of tags/attributes cannot be determined
const EDITOR_CASING_DEFAULT = 'undetermined';

// Set default quotes style when it cannot be determined
const EDITOR_QUOTES_DEFAULT = '"';

// Set default new-line ending style
const EDITOR_NEW_LINE_DEFAULT = '\n;'

// Set default DOCTYPE for markup documents
const EDITOR_DOCTYPE_DEFAULT = '-//W3C//DTD XHTML 1.0 Transitional//EN';

$self.isHtmlBuffer = function(view) {

	return ([view.document.subLanguage, view.document.language].indexOf('HTML') >= 0);
};

$self.findTagBefore = function(position, scimoz) {

	var positionChar, positionStyle,
		startTagCharCode = '<'.charCodeAt(0),
		closeTagCharCode = '>'.charCodeAt(0),
		closeTagFound = false;

	// Go back from the given location
	for (var prevPosition = position; prevPosition >= 0; prevPosition --) {

		positionChar = scimoz.getCharAt(prevPosition);

		// Process opening tag
		if (positionChar === startTagCharCode) {

			positionStyle = scimoz.getStyleAt(prevPosition);

			// Make sure it's a valid UDL style for an opening tag
			if ([scimoz.SCE_UDL_M_STAGO,
				 scimoz.SCE_UDL_M_ETAGO].indexOf(positionStyle) >= 0) {

				if (closeTagFound) {

					var tagComplete = scimoz.getTextRange(prevPosition, position);

					if ($toolkit.regexp.matchTag(tagComplete, '^'))
						return $toolkit.regexp.lastMatches[1];
				}
				// Fail if we encounter an opening tag first
				else
					return null;
			}

		// Process closing tag
		} else if (positionChar === closeTagCharCode) {

			positionStyle = scimoz.getStyleAt(prevPosition);

			// Make sure it's a valid UDL style for a closing tag
			if ([scimoz.SCE_UDL_M_STAGC,
				 scimoz.SCE_UDL_M_ETAGC].indexOf(positionStyle) >= 0)
				closeTagFound = true;

		// Process non-whitespace characters
		} else if ( ! closeTagFound && ! $toolkit.regexp.matchWhitespace(String.fromCharCode(positionChar))) {

			positionStyle = scimoz.getStyleAt(prevPosition);

			// If we encounter a character not in a comment or an operator, fail
			if ([scimoz.SCE_UDL_M_COMMENT,
				 scimoz.SCE_UDL_SSL_OPERATOR].indexOf(positionStyle) < 0)
				return null;
		}
	};

	return null;
};

$self.findTagAfter = function(position, scimoz) {

	var positionChar, positionStyle,
		startTagCharCode = '<'.charCodeAt(0),
		closeTagCharCode = '>'.charCodeAt(0),
		openTagPosition = -1;

	// Go forward from the given location
	for (var nextPosition = position; nextPosition < scimoz.length; nextPosition ++) {

		positionChar = scimoz.getCharAt(nextPosition);

		// Process closing tag
		if (positionChar === closeTagCharCode) {

			positionStyle = scimoz.getStyleAt(nextPosition);

			// Make sure it's a valid UDL style for a closing tag
			if ([scimoz.SCE_UDL_M_STAGC,
				 scimoz.SCE_UDL_M_ETAGC].indexOf(positionStyle) >= 0) {

				// Fail if we encounter a closing tag first
				if (openTagPosition < 0)
					return null;
				else {

					var tagComplete = scimoz.getTextRange(openTagPosition, nextPosition);

					if ($toolkit.regexp.matchTag(tagComplete, '^'))
						return $toolkit.regexp.lastMatches[1];
				}
			}

		// Process opening tag
		} else if (positionChar === startTagCharCode) {

			positionStyle = scimoz.getStyleAt(nextPosition);

			// Make sure it's a valid UDL style for an opening tag
			if ([scimoz.SCE_UDL_M_STAGO,
				 scimoz.SCE_UDL_M_ETAGO].indexOf(positionStyle) >= 0)
				openTagPosition = nextPosition;

		// Process non-whitespace characters
		} else if (openTagPosition < 0 && ! $toolkit.regexp.matchWhitespace(String.fromCharCode(positionChar))) {

			positionStyle = scimoz.getStyleAt(nextPosition);

			// If we encounter a character not in a comment or an operator, fail
			if ([scimoz.SCE_UDL_M_COMMENT,
				 scimoz.SCE_UDL_SSL_OPERATOR].indexOf(positionStyle) < 0)
				return null;
		}
	};

	return null;
};

$self.guessTagsCasing = function(scimoz) {

	var position, positionChar, positionStyle,
		startTagCharCode = '<'.charCodeAt(0),
		lastTagCaptured = null,
		longestTagCaptured = null,
		tagsCapturedLength = 0;

	// Look for tags from document start until document end
	for (position = 0; position < scimoz.length; position ++) {

		positionChar = scimoz.getCharAt(position);

		// Process opening tag
		if (positionChar === startTagCharCode) {

			positionStyle = scimoz.getStyleAt(position);

			// Make sure it's a valid UDL style for an opening/closing tag
			if ([scimoz.SCE_UDL_M_STAGC,
				 scimoz.SCE_UDL_M_STAGO,
				 scimoz.SCE_UDL_M_ETAGC,
				 scimoz.SCE_UDL_M_ETAGO].indexOf(positionStyle) >= 0) {

				// Read ahead and use buffer to extract the tag name
				lastTagCaptured = scimoz.getTextRange(position, Math.min(position + 256, scimoz.length));
				if ($toolkit.regexp.matchTagName(lastTagCaptured, '^')) {

					if (longestTagCaptured === null ||
						longestTagCaptured.length < $toolkit.regexp.lastMatches[1].length)
						longestTagCaptured = $toolkit.regexp.lastMatches[1];

					tagsCapturedLength ++;
					if (tagsCapturedLength > EDITOR_GUESS_LIMIT)
						break;

					position += $toolkit.regexp.lastMatches[1].length - 1;
				}
			}
		}
	}

	return (longestTagCaptured || EDITOR_CASING_DEFAULT);
};

$self.guessAttributesCasing = function(scimoz) {

	var position, positionStyle,
		lastAttributeCaptured = null,
		longestAttributeCaptured = null,
		attributesCapturedLength = 0;

	// Look for attributes from document start until document end
	for (position = 0; position < scimoz.length; position ++) {

		positionStyle = scimoz.getStyleAt(position);

		// Make sure it's a valid UDL style for an opening/closing tag
		if (scimoz.SCE_UDL_M_ATTRNAME === positionStyle) {

			// Read ahead and use buffer to extract the tag name
			lastAttributeCaptured = scimoz.getTextRange(position, Math.min(position + 256, scimoz.length));
			if ($toolkit.regexp.matchAttributeName(lastAttributeCaptured, '^')) {

				if (longestAttributeCaptured === null ||
					longestAttributeCaptured.length < $toolkit.regexp.lastMatches[0].length)
					longestAttributeCaptured = $toolkit.regexp.lastMatches[0];

				attributesCapturedLength ++;
				if (attributesCapturedLength > EDITOR_GUESS_LIMIT)
					break;

				position += $toolkit.regexp.lastMatches[0].length - 1;
			}
		}
	}

	return (longestAttributeCaptured || $self.guessTagsCasing(scimoz));
};

$self.guessQuotesStyle = function(scimoz) {

	var position, positionStyle,
		singleQuoteCharCode = "'".charCodeAt(0),
		doubleQuoteCharCode = '"'.charCodeAt(0),
		quotesCaptured = {},
		quotesCapturedLength = 0;

	quotesCaptured[singleQuoteCharCode] = 0;
	quotesCaptured[doubleQuoteCharCode] = 0;

	// Look for quotes from document start until document end
	for (position = 0; position < scimoz.length; position ++) {

		positionChar = scimoz.getCharAt(position);

		// Process quotes
		if (positionChar === singleQuoteCharCode ||
			positionChar === doubleQuoteCharCode) {

			positionStyle = scimoz.getStyleAt(position);

			// Make sure it's a valid UDL style for a quote
			if (scimoz.SCE_UDL_M_STRING === positionStyle) {

				quotesCaptured[positionChar] ++;

				quotesCapturedLength ++;
				if (quotesCapturedLength > EDITOR_GUESS_LIMIT * 2)
					break;
			}
		}
	}

	if (quotesCaptured[singleQuoteCharCode] > quotesCaptured[doubleQuoteCharCode])
		return String.fromCharCode(singleQuoteCharCode);
	else if (quotesCaptured[doubleQuoteCharCode] > quotesCaptured[singleQuoteCharCode])
		return String.fromCharCode(doubleQuoteCharCode);

	return EDITOR_QUOTES_DEFAULT;
};

$self.guessNewLine = function(document) {

	return (document.new_line_endings === document.EOL_LF ? '\n' :
		   (document.new_line_endings === document.EOL_CR ? '\r' :
		   (document.new_line_endings === document.EOL_CRLF ? '\r\n' : EDITOR_NEW_LINE_DEFAULT)));
};

$self.guessDoctype = function(view) {

	// Figure out which DOM language we are in
	var domLanguages = ['XML', 'HTML', 'XHTML', 'XSLT'],
		languageService = view.document.languageObj,
		viewLanguage = domLanguages.indexOf(languageService.name) < 0 ? null : languageService.name;

	// If the document itself is not a DOM language, check against sub-languages i.e. HTML in PHP
	if ( ! viewLanguage) {

		var subLanguages = languageService.getSubLanguages({});
		for (var i = 0; i < subLanguages.length; i ++)
			if (domLanguages.indexOf(subLanguages[i]) >= 0) {

				viewLanguage = subLanguages[i];
				break;
			}
	}

	// Attempt to fetch the DOCTYPE from view preferences
	if (viewLanguage) {

		var declaredPrefKey = 'default' + viewLanguage + 'Decl';

		if (view.prefs.hasPrefHere(declaredPrefKey)) {

			var declaredDoctype = view.prefs.getStringPref(declaredPrefKey);
			if (declaredDoctype)
				return declaredDoctype;
		}
	}

	// Attempt to match DOCTYPE in buffer
	if ($toolkit.regexp.matchDoctypeDeclaration(view.scimoz.text))
		return $toolkit.regexp.lastMatches[3];

	return EDITOR_DOCTYPE_DEFAULT;
};

$self.isPHPDoc = function(view, position) {

	return ('PHP' === view.document.language &&
			view.scimoz.SCE_UDL_SSL_COMMENTBLOCK === view.scimoz.getStyleAt(position));
};

$self.invalidate = function() {

	ko.views.manager.currentView.scimoz.colourise(0, ko.views.manager.currentView.scimoz.length);
};
