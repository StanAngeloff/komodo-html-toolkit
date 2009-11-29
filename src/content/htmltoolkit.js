/* ***** BEGIN LICENSE BLOCK *****
 * The MIT License
 *
 * Copyright (c) 2009 Stan Angeloff
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * ***** END LICENSE BLOCK ***** */

if (typeof (extensions) === 'undefined')
	window.extensions = {};

(function() {

	const Cc = Components.classes;
	const Ci = Components.interfaces;

	var $toolkit = extensions.htmlToolkit || (extensions.htmlToolkit = {});

	$toolkit.include = function(namespace, includeOnce) {

		var loader = Cc['@mozilla.org/moz/jssubscript-loader;1'].getService(Ci.mozIJSSubScriptLoader);

		// Split parent namespace and basename of package
		var namespaceNormalized = namespace.replace('/', '.', 'g'),
			namespaceParts = namespaceNormalized.split('.'),
			scriptName = namespaceParts.pop(),
			parentNamespace = namespaceParts;

		var scriptNamespace;

		// If we have a parent namespace, include it and obtain a reference
		if (parentNamespace.length)
			scriptNamespace = $toolkit.include(parentNamespace.join('.'), includeOnce);
		else
			scriptNamespace = $toolkit;

		var destroyOnUnload = true;

		// Destroy/return a reference to the namespace if already present
		if (scriptName in scriptNamespace) {

			if (typeof (includeOnce) === 'undefined' || includeOnce)
				return scriptNamespace[scriptName];

			if ('destroy' in scriptNamespace[scriptName]) {

				scriptNamespace[scriptName]['destroy']();
				destroyOnUnload = false;
			}

		} else {

			// Set up references back to the toolkit and a circular reference to the namespace itself
			scriptNamespace[scriptName] = { __namespace__: namespaceNormalized };

			scriptNamespace[scriptName]['$toolkit'] = $toolkit;
			scriptNamespace[scriptName]['$log'] = $toolkit.log;

			scriptNamespace[scriptName]['$self'] = scriptNamespace[scriptName];
		}

		loader.loadSubScript('chrome://htmltoolkit/content/scripts/' + (parentNamespace.length ? parentNamespace.join('/') + '/' : '') + scriptName + '.js',
							 scriptNamespace[scriptName]);

		if ('initialize' in scriptNamespace[scriptName])
			scriptNamespace[scriptName]['initialize']();

		if (destroyOnUnload &&
			'destroy' in scriptNamespace[scriptName]) {

			$toolkit.include('events');
			$toolkit.events.onUnload(scriptNamespace[scriptName]['destroy']);
		}

		return scriptNamespace[scriptName];
	};

	var _l10nCache = {};
	$toolkit.l10n = function(bundle) {

		if (bundle in _l10nCache)
			return _l10nCache[bundle];

		_l10nCache[bundle] = Cc['@mozilla.org/intl/stringbundle;1'].getService(Ci.nsIStringBundleService)
																   .createBundle('chrome://htmltoolkit/locale/' + bundle + '.properties');

		return _l10nCache[bundle];
	};

	$toolkit.log = function(message) {

		var consoleService = Cc['@mozilla.org/consoleservice;1'].getService(Ci.nsIConsoleService);

		consoleService.logStringMessage(message);
	};

	$toolkit.trapExceptions = function(obj, bound) {

		if (obj && typeof (obj) === 'object') {

			for (var key in obj) {

				if (typeof (obj[key]) === 'function' && ! obj[key].__trapped__) {

					(function(fn) {

						obj[key] = function() {

							try { return fn.apply(bound || obj, arguments || []); }
							catch (e) {

								$toolkit.include('debug');

								ko.dialogs.alert($toolkit.l10n('htmltoolkit').GetStringFromName('uncaughtException'),
												 $toolkit.debug.print_r(e));

								throw e;
							}

							return null;
						};

					})(obj[key]);

					obj[key].__trapped__ = true;

				} else
					$toolkit.trapExceptions(obj[key], bound || obj);
			}
		}
	};

	$toolkit.checkCompatibility = function() {

		if (window.extensions &&
			window.extensions.tabAbbreviations) {

			var notificationEl = document.getElementById('komodo-notificationbox');

			var notificationText, notificationType, notificationIcon, notificationPriority;
			notificationEl.appendNotification(notificationText = $toolkit.l10n('htmltoolkit').GetStringFromName('compatibility.tabAbbreviations'),
											  notificationType = 'html-toolkit-compatibility',
											  notificationIcon = 'chrome://htmltoolkit/skin/images/icon_exclamation_diamond.png',
											  notificationPriority = notificationEl.PRIORITY_WARNING_LOW);
		}
	};

	$toolkit.registerAll = function(type) {

		$toolkit.include('io');

		var typeNormalized = type.replace('/', '.', 'g'),
			typeFiles = $toolkit.io.findFilesInURI('content/scripts/' + typeNormalized.replace('.', '/', 'g'), '*.js', true);

		if (typeFiles)
			typeFiles.forEach(function(typeEntry) {

				var typeName = typeEntry.leafName.replace(/\.js$/, '');

				$toolkit.include(type + '.' + typeName);

				var typeNamespace = $toolkit,
					typeParts = type.split('.');

				for (var partIndex = 0; partIndex < typeParts.length; partIndex ++)
					typeNamespace = typeNamespace[typeParts[partIndex]];

				if ('registerAll' in typeNamespace[typeName])
					typeNamespace[typeName].registerAll();
			});
	};

	$toolkit.trapExceptions($toolkit);

	$toolkit.registerAll('module');
	$toolkit.registerAll('command');
	$toolkit.registerAll('hyperlink');

	$toolkit.include('events');

	$toolkit.events.onLoad(function() {
		window.setTimeout(function() {
			$toolkit.checkCompatibility();
		}, 750);
	});

})();
