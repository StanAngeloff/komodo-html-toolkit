$toolkit.include('regexp');

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
