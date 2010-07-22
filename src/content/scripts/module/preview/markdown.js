$toolkit.include('module.preview');
$toolkit.include('external.showdown');

var MARKDOWN_CONVERTER = new $toolkit.external.showdown.Showdown.converter();

$self.controller = function() {

	// Call parent's constructor
	$toolkit.module.preview.controller.apply(this, ['Markdown', false, false, MARKDOWN_CONVERTER.makeHtml]);
};

$self.registerAll = function() {

	new $self.controller().register();
};
