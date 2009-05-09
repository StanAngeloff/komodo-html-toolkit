$toolkit.include('events');
$toolkit.include('external.showdown');

const MARKDOWN_LANGUAGE = 'Markdown';
const MARKDOWN_UPDATE_INTERVAL = 500;
const MARKDOWN_ELEMENT_ID = 'markdownview-frame';

$self.preview = function() {

	this.hasLoaded = false;
	this.lastView = null;
	this.converter = new $toolkit.external.showdown.Showdown.converter();
	this.intervalId = null;

	var $instance = this;

	this.register = function() {

		// Listen for buffer changes
		window.addEventListener('current_view_changed', function(e) { $instance.viewChanged(e.originalTarget); }, true);
		window.addEventListener('current_view_language_changed', function(e) { $instance.viewChanged(e.originalTarget); }, true);

		// TODO: all views closed?
	};

	this.viewChanged = function(view) {

		this.lastView = view;
		// If we have loaded, we can display a preview, otherwise queue
		if (this.hasLoaded)
			this.update(this.lastView);
	};

	$toolkit.events.onLoad(function() {

		$instance.hasLoaded = true;
		// If we have a view queued, display preview
		if ($instance.lastView)
			$instance.update($instance.lastView);
	});

	this.update = function(view) {

		// If the last buffer is a Markdown buffer, display preview
		if (MARKDOWN_LANGUAGE === view.document.language) {

			// Preview immediately
			this.displayPreview(this.lastView);

			// Preview every XX milliseconds
			if ( ! this.intervalId) {

				var $instance = this;
				this.intervalId = window.setInterval(function() { $instance.displayPreview($instance.lastView); }, MARKDOWN_UPDATE_INTERVAL);
			}

		// Not a Markdown, notify User preview unavailable
		} else {

			this.displayNotice(this.lastView);

			if (this.intervalId) {

				window.clearInterval(this.intervalId);
				this.intervalId = null;
			}
		}
	};

	this.displayPreview = function(view) {

		var previewDocument = document.getElementById(MARKDOWN_ELEMENT_ID).contentDocument;

		previewDocument.open();
		previewDocument.write('HELLO!');
		previewDocument.close();
	};

	this.displayNotice = function(view) {

		var previewDocument = document.getElementById(MARKDOWN_ELEMENT_ID).contentDocument;

		previewDocument.open();
		previewDocument.write(view.document.language);
		previewDocument.close();
	};

	// TODO: converter.makeHtml(

	$toolkit.trapExceptions(this);
};

$self.registerAll = function() {

	new $self.preview().register();
};
