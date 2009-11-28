$toolkit.include('command.language');
$toolkit.include('library');

const Cc = Components.classes;
const Ci = Components.interfaces;

const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

/**
 * Compare two Strings using natural (human) sorting.
 *
 * @argument  string  {String}  The String to compare to.
 * @returns  {Integer}  <code>-1</code> if this string is less than the given one, <code>1</code> otherwise and <code>0</code> if Strings are equal.
 */
String.prototype.naturalCompare = function(string, sensitive) {

	var left = this,
		right = ('' + string);

	if ( ! sensitive) {

		right = right.toLowerCase();
		left = left.toLowerCase();
	}

	var chunkify = function (string) {

		return string.replace(/(\d+)/g, '\u0000$1\u0000')
					 .replace(/^\u0000|\u0000$/g, '')
					 .split('\u0000')
					 .map(function(chunk) { return (isNaN(parseInt(chunk)) ? chunk : parseInt(chunk)); });
	};

	var leftChunks = chunkify(left),
		rightChunks = chunkify(right);

	for (var maxLength = Math.max(leftChunks.length, rightChunks.length), i = 0; i < maxLength; i ++) {

		if (i >= leftChunks.length)
			return -1;
		if (i >= rightChunks.length)
			return 1;

		if (leftChunks[i] < rightChunks[i])
			return -1;
		if (leftChunks[i] > rightChunks[i])
			return 1;
	}

	return 0;
};

$self.destroy = function() {

	if ($self.manager)
		$self.manager.unregister();
};

$self.manager = {

	providers: [],

	register: function() {},
	unregister: function() {},

	addProvider: function(obj) {

		var index = $self.manager.indexOfProvider(obj);
		if (index < 0) {

			$self.manager.providers.push(obj);
			$self.manager.sortProviders();

			return $self.manager.providers.length;
		}

		return index;
	},

	removeProvider: function(obj) {

		var index = $self.manager.indexOfProvider(obj);
		if (index >= 0) {

			var provider = $self.manager.providers.splice(index, 1);

			$self.manager.sortProviders();

			return provider;
		}

		return null;
	},

	indexOfProvider: function(obj) {

		for (var index = 0; index < $self.manager.providers.length; index ++)
			if ($self.manager.providers[index] === obj)
				return index;

		return -1;
	},

	sortProviders: function() {

		$self.manager.providers.sort(function(left, right) {
			return (left.ordering < right.ordering ? -1 : (left.ordering > right.ordering ? +1 : 0));
		});
	},

	forViewProviders: function(view, callback) {

		// Invoke callback for all providers that are enabled
		$self.manager.providers.forEach(function(provider) {

			if (provider.canExecute(view))
				callback(provider);
		});
	}
};

$toolkit.trapExceptions($self.manager);

var PROVIDER_ORDERING = 9900;

$self.provider = function(providerName, providerOrdering) {

	this.name = providerName;
	this.ordering = (typeof (providerOrdering) === 'undefined' ? ++ PROVIDER_ORDERING : parseInt(providerOrdering));

	this.register = function() { $self.manager.addProvider(this); };

	this.unregister = function() { $self.manager.removeProvider(this); };

	/** @abstract */
	this.getAllowedCharacters = function() { return []; };

	/** @abstract */
	this.canExecute = function(view) { return true; };

	/** @abstract */
	this.findSnippet = function(view, abbreviation) { return null; };
};

$self.controller = function() {

	// Call parent's constructor
	var commandName, commandKey, supportedLanguages, allowChange;

	$toolkit.command.language.controller.apply(this, [commandName = 'abbreviation',
													  commandKey = 'Tab',
													  supportedLanguages = '*',
													  allowChange = false]);

	this._command_register = this.register;
	this.register = function() {

		// Call parent's implementation
		this._command_register.apply(this);

		// Replace Komodo's built-in method with our own
		if ( ! ko.abbrev._expandAbbrev__abbreviation) {

			ko.abbrev._expandAbbrev__abbreviation = ko.abbrev.expandAbbrev;
			ko.abbrev.expandAbbrev = function(abbreviation) {
				$self.expand(ko.views.manager.currentView, abbreviation);
			};
		}
	};

	this._command_unregister = this.unregister;
	this.unregister = function() {

		// Restore Komodo's default behaviour
		if (ko.abbrev._expandAbbrev__abbreviation) {

			ko.abbrev.expandAbbrev = ko.abbrev._expandAbbrev__abbreviation;
			delete ko.abbrev['_expandAbbrev__abbreviation'];
		}

		// Call parent's implementation
		this._command_unregister.apply(this);
	};

	this.trigger = function(e) {

		var view = ko.views.manager.currentView,
			scimoz = view.scimoz;

		// Ensure we don't have tabstops remaining within the buffer
		if (view.document.hasTabstopInsertionTable) {

			var tabstopsTable = view.document.getTabstopInsertionTable({});

			// If we have one tabstop remaining, skip it if it's Backref #0
			if (tabstopsTable.length === 1) {

				var lastTabstop = tabstopsTable[0];

				if ( ! lastTabstop.isBackref || lastTabstop.backrefNumber !== 0)
					return false;

			// Don't process if we have more than one tabstop remaining
			} else if (tabstopsTable.length > 1)
				return false;
		}

		var expandResult = $self.expand(view);
		if (expandResult) {

			e.preventDefault();
			e.stopPropagation();
		}

		return expandResult;
	};

	$self.findSnippet = function(view, abbreviation) {

		var snippet = null;

		$self.manager.forViewProviders(view, function(provider) {

			if ( ! snippet) {

				// Compile allowed characters to a regular expression and check against abbreviation
				var providerAllowedCharacters = provider.getAllowedCharacters(),
					providerAllowedRegExp = new RegExp('^[' + providerAllowedCharacters.join('') + ']+$');

				if (providerAllowedRegExp.test(abbreviation))
					snippet = provider.findSnippet(view, abbreviation);
			}
		});

		return snippet;
	};

	$self.insertSnippet = function(view, abbreviation, snippet) {

		var scimoz = view.scimoz,
			insert = function(snippet) {

				// Call Komodo's built-in functions
				try { Snippet_insert(snippet); }
				catch (e) {

					$toolkit.include('debug');

					ko.dialogs.alert($toolkit.l10n('htmltoolkit').GetStringFromName('uncaughtException'),
									 $toolkit.debug.print_r(e));

					throw e;
				}
			};

		if ((snippet instanceof Ci.koIPart_snippet) ||
			(typeof (snippet) === 'object' && 'snippet' === snippet.type)) {

			// Allow Komodo and other extensions to process the key first
			window.setTimeout(function() { insert(snippet); }, 1);

			return true;

		} else if (snippet instanceof Ci.koIPart_folder) {

			var folderSnippets = {},
				folderSnippetsLength = {};

			snippet.getChildrenByType('snippet', true, folderSnippets, folderSnippetsLength);

			if ( ! folderSnippetsLength.value)
				return false;

			var availableSnippets = [],
				hasSubAbbreviation = (abbreviation.indexOf('.') > 0),
				abbreviationSubname = (hasSubAbbreviation ? abbreviation.split('.').pop() : null);

			for (var i = 0; i < folderSnippets.value.length; i ++) {

				var wrappedSnippet = $toolkit.library.createSnippet(folderSnippets.value[i].value,
																	folderSnippets.value[i].name,
																	folderSnippets.value[i].parent.name,
																	folderSnippets.value[i].getStringAttribute('set_selection'),
																	folderSnippets.value[i].getStringAttribute('indent_relative'));

				if (wrappedSnippet.name === abbreviationSubname) {

					insert(wrappedSnippet);
					return true;
				}

				availableSnippets.push(wrappedSnippet);
			}

			// Sort the snippets alphabetically
			availableSnippets.sort(function(left, right) {
				return ('' + left.name).naturalCompare(right.name);
			});

			var menuEl,
				menuAccessKeys = [];

			menuEl = document.getElementById('htmltoolkit_abbreviations_menu');
			if (menuEl)
				menuEl.parentNode.removeChild(menuEl);

			menuEl = document.createElementNS(XUL_NS, 'menupopup');

			menuEl.setAttribute('id', 'htmltoolkit_abbreviations_menu');

			var defaultIndex = -1;
			for (i = 0; i < availableSnippets.length; i ++) {

				var itemEl = document.createElementNS(XUL_NS, 'menuitem'),
					itemAccessKey = (i + 1);

				for (var j = 0; j < availableSnippets[i].name.length; j ++) {

					var currentKey = availableSnippets[i].name.charAt(j);
					if (menuAccessKeys.indexOf(currentKey) < 0) {

						itemAccessKey = currentKey.toUpperCase();
						menuAccessKeys.push(currentKey);
						break;
					}
				}

				itemEl.setAttribute('label', itemAccessKey + '    ' + availableSnippets[i].name);
				itemEl.setAttribute('accesskey', itemAccessKey);

				itemEl.addEventListener('command', (function(view, snippet) {

					return function() {

						view.setFocus();
						insert(snippet);
					};

				})(view, availableSnippets[i]), null);

				menuEl.appendChild(itemEl);
			}

			document.documentElement.appendChild(menuEl);

			menuEl = document.getElementById('htmltoolkit_abbreviations_menu');

			var menuPosition = Math.max(scimoz.anchor, scimoz.currentPos),
				isContextMenu,
				attributesOverride;

			menuEl.openPopup(view.scintilla,
							 'before_start',
							 view.boxObject.x + scimoz.pointXFromPosition(menuPosition),
							 view.boxObject.y + scimoz.pointYFromPosition(menuPosition) + scimoz.textHeight(scimoz.lineFromPosition(menuPosition)),
							 isContextMenu = true,
							 attributesOverride = false);

			menuEl.focus();

			return true;
		}

		throw $toolkit.l10n('command').GetStringFromName('abbreviation.unsupportedType');
	};

	$self.expand = function(view, abbreviation) {

		var scimoz = view.scimoz,
			expandAtPosition, i;

		if (typeof (abbreviation) === 'undefined')
			abbreviation = '';

		// Collect allowed characgters from providers
		var allowedCharacters = [],
			providerAllowedCharacters;

		$self.manager.forViewProviders(view, function(provider) {

			providerAllowedCharacters = provider.getAllowedCharacters();
			for (i = 0; i < providerAllowedCharacters.length; i ++)
				if (allowedCharacters.indexOf(providerAllowedCharacters[i]) < 0)
					allowedCharacters.push(providerAllowedCharacters[i]);
		});

		// Compile allowed characters to a regular expression used for look-ups
		var abbreviationRegExp = new RegExp('^[' + allowedCharacters.join('') + ']+$');

		if ( ! abbreviation.length) {

			// If there is no selection within the document, expand back
			if (scimoz.anchor === scimoz.currentPos) {

				var rangeStart = scimoz.anchor - 1,
					rangeEnd = scimoz.currentPos,
					rangeText;

				while (rangeStart >= 0) {

					rangeText = scimoz.getTextRange(rangeStart, rangeEnd);
					if (abbreviationRegExp.test(rangeText)) {

						abbreviation = rangeText;
						expandAtPosition = rangeStart;

					} else
						break;

					rangeStart --;
				}

			} else {

				abbreviation = scimoz.selText;
				expandAtPosition = Math.min(scimoz.anchor, scimoz.currentPos);
			}
		}

		// If we have a matching abbreviation, insert snippet
		if (abbreviationRegExp.test(abbreviation)) {

			var snippet = $self.findSnippet(view, abbreviation);
			if (snippet) {

				// If auto-complete is visible, close it to prevent auto-complete on selected item
				if (scimoz.autoCActive())
					scimoz.autoCCancel();

				try {

					scimoz.beginUndoAction();
					scimoz.setSel(expandAtPosition, expandAtPosition + abbreviation.length);

					var insertResult = $self.insertSnippet(view, abbreviation, snippet);
					if (insertResult) {

						var snippetName = (snippet.parent ? snippet.parent.name : snippet.name) || 'N/A';

						ko.statusBar.AddMessage($toolkit.l10n('command').formatStringFromName('abbreviation.snippetFound', [abbreviation, snippetName], 2), 'htmltoolkit', 2500, true);

						return true;
					}

				} finally { scimoz.endUndoAction(); }

			} else
				ko.statusBar.AddMessage($toolkit.l10n('command').formatStringFromName('abbreviation.snippetNotFound', [abbreviation], 1), 'htmltoolkit', 1500, true);
		}

		return false;
	};

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	$toolkit.registerAll(__namespace__);

	new $self.controller().register();
};
