$toolkit.include('module.preview');
$toolkit.include('external.tiddlywiki');

const HTML_NS = 'http://www.w3.org/1999/xhtml';

$self.controller = function() {

	this.convert = function(text) {

		var formatter = new $toolkit.external.tiddlywiki.Formatter($toolkit.external.tiddlywiki.config.formatters),
			wikifier = new $toolkit.external.tiddlywiki.Wikifier(text, formatter),
			outputEl = document.createElementNS(HTML_NS, 'pre');

		wikifier.subWikifyUnterm(outputEl);

		var html = outputEl.innerHTML;
		delete outputEl, wikifier, formatter;
		return html;
	};

	// Call parent's constructor
	$toolkit.module.preview.controller.apply(this, ['Wiki', false, false, this.convert]);
};

$self.registerAll = function() {

	new $self.controller().register();
};
