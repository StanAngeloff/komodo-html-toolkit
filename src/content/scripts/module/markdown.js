$toolkit.include('events');
$toolkit.include('external.showdown');
$toolkit.include('htmlUtils');
$toolkit.include('io');

const Cc = Components.classes;
const Ci = Components.interfaces;

const MARKDOWN_LANGUAGE = 'Markdown';
const MARKDOWN_UPDATE_INTERVAL = 1000;
const MARKDOWN_ELEMENT_ID = 'markdownview-frame';

var MARKDOWN_TEMPLATES = {};

$self.preview = function() {

	this.hasLoaded = false;
	this.lastView = null;
	this.converter = new $toolkit.external.showdown.Showdown.converter();
	this.intervalId = null;

	var $instance = this;

	this.register = function() {

		// Listen for buffer changes
		window.addEventListener('current_view_changed', $instance.onViewChanged, true);
		window.addEventListener('current_view_language_changed', $instance.onViewChanged, true);
		window.addEventListener('view_opened', $instance.onViewOpened, true);
		window.addEventListener('view_closed', $instance.onViewClosed, true);
	};

	this.unregister = function() {

		// Unload all events on Komodo shutdown
		window.removeEventListener('current_view_changed', $instance.onViewChanged, true);
		window.removeEventListener('current_view_language_changed', $instance.onViewChanged, true);
		window.removeEventListener('view_opened', $instance.onViewOpened, true);
		window.removeEventListener('view_closed', $instance.onViewClosed, true);
	};

	this.onViewChanged = function(e) {

		var view = e.originalTarget;
		if (view && view.getAttribute('type') === 'editor') {

			$instance.lastView = e.originalTarget;
			// If we have loaded, we can display a preview, otherwise queue
			if ($instance.hasLoaded)
				$instance.update($instance.lastView);

		} else {

			$instance.lastView = null;

			$instance.stopPeriodicalPreview();
			$instance.clearPreview();
		}
	};

	this.onViewOpened = function(e) {

		// This is to force Komodo to open *.md documents as Markdown
		var view = e.originalTarget;
		if (view && view.getAttribute('type') === 'editor') {

			if ('Text' === view.document.language &&
				'.md' === view.document.baseName.substring(view.document.baseName.length - 3).toLowerCase()) {

				view.document.language = 'Markdown';
			}
		}
	};

	this.onViewClosed = function() {

		// Let Komodo close the view first
		window.setTimeout(function() {

			if (ko.views.manager._viewCount < 1) {

				$instance.lastView = null;

				$instance.stopPeriodicalPreview();
				$instance.clearPreview();
			}

		}, 1);
	};

	$toolkit.events.onLoad(function() {

		$instance.hasLoaded = true;
		// If we have a view queued, display preview
		if ($instance.lastView)
			$instance.update($instance.lastView);
		else
			$instance.clearPreview();
	});

	this.update = function(view) {

		// If the last buffer is a Markdown buffer, display preview
		if (MARKDOWN_LANGUAGE === view.document.language) {

			// Preview immediately
			this.displayPreview(this.lastView);

			this.startPeriodicalPreview();

		// Not a Markdown, notify User preview unavailable
		} else {

			this.stopPeriodicalPreview();

			this.displayNotice(this.lastView);
		}
	};

	this.startPeriodicalPreview = function() {

		// Preview every XX milliseconds
		if ( ! this.intervalId) {

			var $instance = this;
			this.intervalId = window.setInterval(function() { $instance.displayPreview($instance.lastView); }, MARKDOWN_UPDATE_INTERVAL);
		}
	};

	this.stopPeriodicalPreview = function() {

		if (this.intervalId) {

			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}
	};

	this.displayPreview = function(view) {

		try {

			var htmlCode = this.converter.makeHtml(view.scimoz.text);

			this.renderTemplate('preview', { html: htmlCode });

		} catch (e) {

			this.renderTemplate('exception', { exception: e });
		}
	};

	this.clearPreview = function() {

		this.renderTemplate('buffersEmpty', { markdownLanguage: MARKDOWN_LANGUAGE });
	};

	this.displayNotice = function(view) {

		this.renderTemplate('unsupportedLanguage', { bufferLanguage: view.document.language,
													 markdownLanguage: MARKDOWN_LANGUAGE });
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

	this.renderTemplate = function(name, args) {

		var template = this.getCachedTemplate(name);

		if (args)
			for (var key in args)
				if (args.hasOwnProperty(key)) {

					template = template.replace('${' + key + ':safe}', args[key], 'g')
									   .replace('${' + key + '}', $toolkit.htmlUtils.escape(args[key]), 'g');
				}

		var previewDocument = document.getElementById(MARKDOWN_ELEMENT_ID).contentDocument;

		previewDocument.open();
		previewDocument.write(template);
		previewDocument.close();
	};

	$toolkit.events.onUnload(this.unregister);

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.preview().register();
};
