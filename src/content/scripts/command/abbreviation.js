$toolkit.include('command.language');
$toolkit.include('library');
$toolkit.include('strings');

const Cc = Components.classes;
const Ci = Components.interfaces;

const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

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
	var command, triggerKeys, supportedLanguages, canChangeTriggerKeys, commandOrdering;

	$toolkit.command.language.controller.apply(this, [command = 'abbreviation',
													  triggerKeys = 'Tab',
													  supportedLanguages = '*',
													  canChangeTriggerKeys = false,
													  commandOrdering = 5100]);

	this._command_register = this.register;
	this.register = function() {

		// Call parent's implementation
		this._command_register.apply(this);

		// Replace Komodo's built-in method with our own
		if ( ! ko.abbrev._expandAbbrev__abbreviation) {

			ko.abbrev._expandAbbrev__abbreviation = ko.abbrev.expandAbbrev;
			ko.abbrev.expandAbbrev = function(abbreviation) {
				if ('true' === $toolkit.pref('abbreviation.replaceExpandEnabled'))
					$self.expand(ko.views.manager.currentView, abbreviation);
				else
					ko.abbrev._expandAbbrev__abbreviation(abbreviation);
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

		var editorPosition = Math.min(scimoz.anchor, scimoz.currentPos),
			positionStyle = scimoz.getStyleAt(editorPosition);

		// Make sure selection is not within an attribute or an operator
		if (scimoz.anchor !== scimoz.currentPos &&
			[scimoz.SCE_UDL_M_ATTRNAME,
			 scimoz.SCE_UDL_M_STRING,
			 scimoz.SCE_UDL_M_OPERATOR].indexOf(positionStyle) >= 0)
			return false;

		var expandResult = $self.expand(view);
		if (expandResult) {

			e.preventDefault();
			e.stopPropagation();
		}

		return expandResult;
	};

	$self.findSnippet = function(view, abbreviation, provider) {

		var snippet = null;

		// If no provider is given, attempt to find a snippet in any of the registered ones
		if (typeof (provider) === 'undefined') {

			$self.manager.forViewProviders(view, function(provider) { if ( ! snippet) {
				snippet = $self.findSnippet(view, abbreviation, provider);
			} });

		} else {

			// Compile allowed characters to a regular expression and check against abbreviation
			var providerAllowedCharacters = provider.getAllowedCharacters(),
				providerAllowedRegExp = new RegExp('^[' + providerAllowedCharacters.join('') + ']+$');

			if (providerAllowedRegExp.test(abbreviation))
				snippet = provider.findSnippet(view, abbreviation);
		}

		return snippet;
	};

	$self.insertSnippet = function(view, abbreviation, snippet) {

		var scimoz = view.scimoz,
			insert = function(snippet) {

				// Call Komodo's built-in functions
				try { ko.projects.snippetInsert(snippet); }
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

			var menuEl;

			menuEl = document.getElementById('htmltoolkit_abbreviations_menu');
			if (menuEl)
				menuEl.parentNode.removeChild(menuEl);

			menuEl = document.createElementNS(XUL_NS, 'menupopup');

			menuEl.setAttribute('id', 'htmltoolkit_abbreviations_menu');

			var defaultIndex = -1;
			for (i = 0; i < availableSnippets.length; i ++) {

				var itemEl = document.createElementNS(XUL_NS, 'menuitem'),
					itemAccessKey;

				if (i < 9)
					itemAccessKey = i + 1;
				else if (i === 9)
					itemAccessKey = 0;
				else
					itemAccessKey = String.fromCharCode('A'.charCodeAt(0) + (i - 9));

				itemEl.setAttribute('class', 'menuitem-iconic');
				itemEl.setAttribute('image', 'chrome://htmltoolkit/skin/images/icon_snippet.png');
				itemEl.setAttribute('label', availableSnippets[i].name);
				itemEl.setAttribute('acceltext', itemAccessKey);
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

			var menuAnchor = Math.min(scimoz.anchor, scimoz.currentPos),
				menuPosition = Math.max(scimoz.anchor, scimoz.currentPos),
				isContextMenu;

			menuEl.openPopupAtScreen(view.boxObject.screenX + scimoz.pointXFromPosition(menuAnchor) - 1,
									 view.boxObject.screenY + scimoz.pointYFromPosition(menuPosition) + scimoz.textHeight(scimoz.lineFromPosition(menuPosition) - 1),
									 isContextMenu = true);

			return true;
		}

		throw $toolkit.l10n('command').GetStringFromName('abbreviation.unsupportedType');
	};

	$self.expand = function(view, abbreviation) {

		var scimoz = view.scimoz,
			snippet = null,
			longestAbbreviation = '',
			expandAtPosition, i;

		if (typeof (abbreviation) === 'undefined' ||
			! abbreviation.length) {

			$self.manager.forViewProviders(view, function(provider) { if ( ! snippet) {

				var providerAllowedCharacters = provider.getAllowedCharacters(),
					// Compile allowed characters to a regular expression used for look-ups
					providerAllowedRegExp = new RegExp('^[' + providerAllowedCharacters.join('') + ']+$');

				// Clear previous matching abbreviation from buffer
				abbreviation = null;

				// If there is no selection within the document, expand back
				if (scimoz.anchor === scimoz.currentPos) {

					var rangeStart = scimoz.anchor - 1,
						rangeEnd = scimoz.currentPos,
						rangeText;

					while (rangeStart >= 0) {

						rangeText = scimoz.getTextRange(rangeStart, rangeEnd);
						if (providerAllowedRegExp.test(rangeText)) {

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

				// If we have a matching abbreviation, attempt to find a snippet
				if (abbreviation && abbreviation.length) {

					if (longestAbbreviation.length < abbreviation.length)
						longestAbbreviation = abbreviation;
					snippet = $self.findSnippet(view, abbreviation, provider);
				}

			} });

		} else {

			longestAbbreviation = abbreviation;
			snippet = $self.findSnippet(view, abbreviation);
		}

		if (snippet) {

			// If auto-complete is visible, close it to prevent auto-complete on selected item
			if (scimoz.autoCActive())
				scimoz.autoCCancel();

			try {

				scimoz.beginUndoAction();
				scimoz.setSel(expandAtPosition, expandAtPosition + longestAbbreviation.length);

				var insertResult = $self.insertSnippet(view, longestAbbreviation, snippet);
				if (insertResult) {

					// Give more detailed information about where the snippet was found
					var snippetName = [], lastName;

					if ('*internal*' === snippet.parent.name)
						snippetName.push($toolkit.l10n('command').GetStringFromName('abbreviation.builtIn'));
					else {

						var snippetParent = snippet.parent;
						while (snippetParent) {

							snippetName.push(snippetParent.name);
							snippetParent = snippetParent.parent;
						}

						lastName = snippetName.pop();
						if ('*internal*' !== lastName) {
							snippetName.push($toolkit.l10n('command').GetStringFromName('abbreviation.toolbox'));
						}
					}

					snippetName = snippetName.reverse().join(' > ');
					ko.statusBar.AddMessage($toolkit.l10n('command').formatStringFromName('abbreviation.snippetFound', [longestAbbreviation, snippetName], 2), 'htmltoolkit', 2500, true);

					return true;
				}

			} finally { scimoz.endUndoAction(); }

		} else if (longestAbbreviation.length)
			ko.statusBar.AddMessage($toolkit.l10n('command').formatStringFromName('abbreviation.snippetNotFound', [longestAbbreviation], 1), 'htmltoolkit', 1500, false);

		return false;
	};

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	$toolkit.registerAll(__namespace__);

	new $self.controller().register();
};
