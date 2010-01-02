$toolkit.include('editor');
$toolkit.include('htmlUtils');
$toolkit.include('library');

var SUBLANGUAGE_SUPPORTED_LIST = ['HTML', 'XML', 'XBL', 'PHP'];

$self.provider = function() {

	// Call parent's constructor
	var providerName, providerOrdering;

	$toolkit.command.abbreviation.provider.apply(this, [providerName = 'lipsum',
														providerOrdering = 6100]);

	this.getAllowedCharacters = function() {

		return ['lipsum', '\\.', 'chars', 'words', 'paras', '\\*', '0-9'];
	};

	this.canExecute = function(view) {

		return (SUBLANGUAGE_SUPPORTED_LIST.indexOf(view.document.subLanguage) >= 0 &&
				$toolkit.editor.isHtmlBuffer(view));
	}

	this.findSnippet = function(view, abbreviation) {

		var snippet = null,
			lipsumRegExp = /^lipsum(?:\.(?:(c(?:har(?:s)?)?|w(?:ord(?:s)?)?|p(?:ara(?:s)?)?){1})?)?(?:[^\*]*\*(\d+))?$/,
			lipsumMatch;

		lipsumMatch = lipsumRegExp.exec(abbreviation)
		if (lipsumMatch) {

			var lipsumSnippet;

			lipsumSnippet = $self.createLipsum((lipsumMatch[1] ? lipsumMatch[1][0] : null), parseInt(lipsumMatch[2] || '0'));
			if (lipsumSnippet) {

				var scimoz = view.scimoz;

				// Reflow generated content if the view has an edge
				if (scimoz.edgeMode !== scimoz.EDGE_NONE) {

					var availableWidth = scimoz.edgeColumn;

					// Determine whitespace before abbreviation
					var line = scimoz.lineFromPosition(scimoz.currentPos),
						lineStartPosition = scimoz.positionFromLine(line),
						lineEndPosition = scimoz.getLineEndPosition(line),
						lineBuffer = scimoz.getTextRange(lineStartPosition, lineEndPosition);

					if ($toolkit.regexp.matchWhitespace(lineBuffer, '^')) {

						var lineWhitespace = $toolkit.regexp.lastMatches[0],
							tabWhitespace = '';

						// Replace tabs with their actual width
						for (var i = 0; i < scimoz.tabWidth; i ++)
							tabWhitespace += ' ';

						lineWhitespace = lineWhitespace.replace(/\t/g, tabWhitespace);
						availableWidth -= lineWhitespace.length;
					}

					lipsumSnippet = $self.wordwrap(lipsumSnippet, availableWidth);
				}

				if (lipsumSnippet.indexOf('\n\n') > 0) {

					var isXHtmlView = $toolkit.htmlUtils.isXHtmlDoctype($toolkit.editor.guessDoctype(view)),
						brTag = '<' + $toolkit.htmlUtils.fixTagCase('br', $toolkit.editor.guessTagsCasing(scimoz)) + (isXHtmlView ? ' /' : '') + '>';

					lipsumSnippet = lipsumSnippet.replace('\n\n', '\n' + brTag + '\n' + brTag + '\n', 'g');
				}

				snippet = $toolkit.library.createSnippet(lipsumSnippet + '[[%tabstop0]]');
			}
		}

		return snippet;
	};

	$self.createLipsum = function(type, length) {

    	var lorem = ['Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
					 'Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
					 'Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.',
					 'Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.',
					 'Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis.',
					 'At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, At accusam aliquyam diam diam dolore dolores duo eirmod eos erat, et nonumy sed tempor et et invidunt justo labore Stet clita ea et gubergren, kasd magna no rebum. sanctus sea sed takimata ut vero voluptua. est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.',
					 'Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus.'];

        if ('c'/*hars*/ == type) {

        	var outputString = '',
				loremString = lorem.join(' ') + ' ';

            length = length || 11;

			if (length > 15000 && ! $self.promptContinue())
				return null;

            while (outputString.length < length)
				outputString += loremString;

            return outputString.substr(0, length);

        } else if ('w'/*ords*/ == type) {

			length = length || 2;
			if (length > 2500 && ! $self.promptContinue())
				return null;

            var outputList = [],
				wordList = lorem[0].split(' '),
				wordsLength = 0,
				paragraphsLength = 0;

            while (outputList.length < length) {

            	if (wordsLength > wordList.length) {

            		wordsLength = 0;
            		paragraphsLength ++;

					if (paragraphsLength + 1 > lorem.length)
						paragraphsLength = 0;

            		wordList = lorem[paragraphsLength].split(' ');
            		wordList[0] = '\n\n' + wordList[0];
            	}

            	outputList.push(wordList[wordsLength]);

            	wordsLength ++;
            }

            return outputList.join(' ');

        } else {

            length = length || 1;
			if (length > 100 && ! $self.promptContinue())
				return null;

            var outputList = [],
				paragraphsLength = 0;

            while (outputList.length < length) {

            	if (paragraphsLength + 1 > lorem.length)
            		paragraphsLength = 0;

            	outputList.push(lorem[paragraphsLength]);
            	paragraphsLength ++;
            }

            return outputList.join('\n\n');
        }

		return null;
	};

	$self.promptContinue = function() {

		var dialogPrompt, defaultResponse, dialogText, dialogTitle, dialogResponse;

		dialogResponse = ko.dialogs.yesNo(dialogPrompt = $toolkit.l10n('command').GetStringFromName('abbreviation.lipsum.unresponsivePrompt')
													   + '\n'
													   + $toolkit.l10n('command').GetStringFromName('abbreviation.lipsum.unresponsiveQuestion'),
										  defaultResponse = 'Yes',
										  dialogText = null,
										  dialogTitle = $toolkit.l10n('command').GetStringFromName('abbreviation.lipsum.unresponsiveTitle'));

		return (dialogResponse === 'Yes');
	};

	/** @author  http://phpjs.org/functions/wordwrap:581 */
	$self.wordwrap = function(string, lineWidth, breakChars, cutWords) {

		lineWidth = (arguments.length >= 2 ? arguments[1] : 78);
		if (lineWidth < 1)
			return string;

		breakChars = (arguments.length >= 3 ? arguments[2] : '\n');
		cutWords = (arguments.length >= 4 ? arguments[3] : false);

		var i, j, l, s, r;

		for (i = -1, l = (r = string.split(/\r\n|\r|\n/)).length; ++ i < l; r[i] += s)
			for (s = r[i], r[i] = ''; s.length > lineWidth; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? breakChars : ''))
				j = cutWords == 2 || (j = s.slice(0, lineWidth + 1).match(/\S*(\s)?$/))[1] ? lineWidth : j.input.length - j[0].length || cutWords == 1 && lineWidth || j.input.length + (j = s.slice(lineWidth).match(/^\S*/)).input.length;

		r = r.join('\n')
			 .split('\n')
			 .map(function(l) { return l.replace(/^\s+|\s+$/g, ''); })
			 .join('\n');

		return r;
	}
};

$self.registerAll = function() {

	new $self.provider().register();
};
