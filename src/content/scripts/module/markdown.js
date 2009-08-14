$toolkit.include('events');
$toolkit.include('external.showdown');
$toolkit.include('htmlUtils');
$toolkit.include('io');

const Cc = Components.classes;
const Ci = Components.interfaces;

const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

const MARKDOWN_LANGUAGE = 'Markdown';
const MARKDOWN_UPDATE_INTERVAL = 500;
const MARKDOWN_ALLOWED_LENGTH = 640 /* lines */ * 80 /* chars per column */;

var MARKDOWN_TEMPLATES = {};

$self.preview = function() {

	this.hasLoaded = false;
	this.queueView = null;

	this.converter = new $toolkit.external.showdown.Showdown.converter();

	// Cache these as used every 0.5 seconds
	this.osService = Cc['@activestate.com/koOs;1'].getService(Ci.koIOs);
	this.pathService = Cc['@activestate.com/koOsPath;1'].getService(Ci.koIOsPath);

	var $instance = this;

	this.register = function() {

		// Listen for buffer changes
		window.addEventListener('current_view_changed', $instance.onViewChanged, true);
		window.addEventListener('current_view_language_changed', $instance.onViewChanged, true);
		window.addEventListener('view_closed', $instance.onViewClosed, true);
	};

	this.unregister = function() {

		$instance.uninstallAll();

		// Unload all events on Komodo shutdown
		window.removeEventListener('current_view_changed', $instance.onViewChanged, true);
		window.removeEventListener('current_view_language_changed', $instance.onViewChanged, true);
		window.removeEventListener('view_closed', $instance.onViewClosed, true);
	};

	this.onViewChanged = function(e) {

		var view = e.originalTarget;
		if (view &&
			view.getAttribute('type') === 'editor' &&
			view.document &&
			view.scimoz) {

			if ($instance.hasLoaded)
				$instance.checkAndInstall(view);
			else
				$instance.queueView = view;

		} else {

			$instance.uninstallAll();
		}
	};

	this.onViewClosed = function(e) {

		// Remove all custom XUL and timers before Komodo destroys the view
		var view = e.originalTarget;
		if (view && view.getAttribute('type') === 'editor')
			$instance.uninstall(view);
	};

	this.checkAndInstall = function(view) {

		if (MARKDOWN_LANGUAGE === view.document.language)
			$instance.install(view);
		else
			$instance.uninstall(view);
	};

	this.install = function(view) {

		if ( ! view.__markdown_installed) {

			var splitterEl = document.createElementNS(XUL_NS, 'splitter'),
				grippyEl = document.createElementNS(XUL_NS, 'grippy'),
				boxEl = document.createElementNS(XUL_NS, 'vbox'),
				frameEl = document.createElementNS(XUL_NS, 'iframe');

			splitterEl.setAttribute('state', 'open');
			splitterEl.setAttribute('collapse', 'after');
			splitterEl.setAttribute('collapse', 'after');

			boxEl.setAttribute('flex', 1);

			frameEl.setAttribute('flex', 1);
			frameEl.setAttribute('src', 'about:blank');

			splitterEl.appendChild(grippyEl);
			boxEl.appendChild(frameEl);
			view.parentNode.appendChild(splitterEl);
			view.parentNode.appendChild(boxEl);

			boxEl.__markdown_frame = frameEl;
			view.__markdown_box = boxEl;
			view.__markdown_splitter = splitterEl;
			view.__markdown_text = null;
			view.__markdown_installed = true;

			this.beginPeriodicalPreview(view);
		}
	};

	this.uninstall = function(view) {

		if (view.__markdown_installed) {

			this.endPeriodicalPreview(view);

			view.__markdown_box.parentNode.removeChild(view.__markdown_splitter);
			view.__markdown_box.parentNode.removeChild(view.__markdown_box);

			delete view['__markdown_splitter'];
			delete view['__markdown_box'];
			delete view['__markdown_text'];
			delete view['__markdown_installed'];
		}
	};

	this.uninstallAll = function(view) {

		var editorViews = ko.views.manager.topView.getViewsByType(true, 'editor');
		for (var i = 0; i < editorViews.length; i ++)
			$instance.uninstall(editorViews[i]);
	};

	this.beginPeriodicalPreview = function(view) {

		// Preview every 0.5 seconds
		if ( ! view.__markdown_intervalId) {

			var $instance = this;
			view.__markdown_intervalId = window.setInterval(function() {

				if (view.scimoz.focus)
					$instance.displayPreview(view);

			}, MARKDOWN_UPDATE_INTERVAL);
		}
	};

	this.endPeriodicalPreview = function(view) {

		if (view.__markdown_intervalId) {

			window.clearInterval(view.__markdown_intervalId);
			delete view['__markdown_intervalId'];
		}
	};

	this.displayPreview = function(view) {

		if (view.__markdown_text === view.scimoz.text)
		 	return false;

		if (view.scimoz.text.length > MARKDOWN_ALLOWED_LENGTH) {

			this.renderTemplate(view, 'exception', { exception: $toolkit.l10n('module').formatStringFromName('markdown.overAllowedLength', [MARKDOWN_ALLOWED_LENGTH], 1) });

			view.__markdown_text = view.scimoz.text

			return false;
		}

		try {

			var viewPath = '';

			if (this.pathService.isfile(view.document.displayPath))
				viewPath = 'file://' + this.pathService.dirname(view.document.displayPath) + this.osService.sep;
			else
				viewPath = 'file://' + this.osService.getcwd() + this.osService.sep;

			var htmlCode = this.converter.makeHtml(view.scimoz.text);

			this.renderTemplate(view, 'preview', { html: htmlCode, base: viewPath });

			view.__markdown_text = view.scimoz.text

			return true;

		} catch (e) {

			this.renderTemplate(view, 'exception', { exception: e });
		}

		return false;
	};

	this.getCachedTemplate = function(name) {

		var templateKey = '$tpl:' + name;

		if (templateKey in MARKDOWN_TEMPLATES)
			return MARKDOWN_TEMPLATES[templateKey];

		// Allow templates to be localised
		var localeService = Cc['@mozilla.org/intl/nslocaleservice;1'].getService(Ci.nsILocaleService),
			applicationLocale = localeService.getApplicationLocale().getCategory('NSILOCALE_CTYPE'),
			templateLocales = [applicationLocale, 'en-US'];

		templateLocales.forEach(function(locale) {

			if (MARKDOWN_TEMPLATES[templateKey])
				return false;

			try {

				var templatePath = 'content/library/templates/' + locale + '/markdown/' + name + '.html',
					templateFile = $toolkit.io.getRelativeURI(templatePath, true);

				MARKDOWN_TEMPLATES[templateKey] = $toolkit.io.readEntireFile(templateFile);

			} catch (e) {}

			return true;
		});

		return MARKDOWN_TEMPLATES[templateKey];
	};

	this.renderTemplate = function(view, name, args) {

		var template = this.getCachedTemplate(name);

		if (args)
			for (var key in args)
				if (args.hasOwnProperty(key)) {

					template = template.replace('${' + key + ':safe}', args[key], 'g')
									   .replace('${' + key + '}', $toolkit.htmlUtils.escape(args[key]), 'g');
				}

		var previewElement = view.__markdown_box.__markdown_frame;

		var updateHTML = function(e) {

			previewElement.contentDocument.documentElement.innerHTML = template;

			// If an Event object was passed in, unregister event handler
			if (e)
				previewElement.removeEventListener('load', updateHTML, true);
		};

		// If the User has navigated away, restore original location to prevent security errors
		if (previewElement.contentWindow.location.href === 'about:blank')
			updateHTML();
		else {

			previewElement.addEventListener('load', updateHTML, true);
			previewElement.contentWindow.location.replace('about:blank');
		}
	};

	$toolkit.events.onLoad(function() {

		$instance.hasLoaded = true;

		// If we have a view queued, install after Komodo has initialized
		if ($instance.queueView) {

			$instance.checkAndInstall($instance.queueView);
			$instance.queueView = null;
		}
	});

	$toolkit.events.onUnload(this.unregister);

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.preview().register();
};
