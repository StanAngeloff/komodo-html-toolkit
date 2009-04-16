// Code copied from http://www.openjs.com/scripts/others/dump_function_php_print_r.php
//   Thanks A Sohn!

const MAX_DEPTH = 10;

$self.str_repeat = function(str, repeat) {

	var output = '';
	for (var i = 0; i < repeat; i ++)
		output += str;

	return output;
};

$self.print_r = function(obj, indent, depth) {

	var ws = '    ',
		output = '';

	indent = indent || 0;
	depth = depth || 0;

	if (depth > MAX_DEPTH)
		return $self.str_repeat(ws, indent) + '*Maximum depth reached*\n';

	if (typeof (obj) === 'object') {

		output += (indent == 0) ? typeof (obj) + '\n(\n' : '';
		indent++;

		var child = '';
		for (var key in obj) {

			try { child = obj[key]; }
			catch (e) { child = '*Unable to evaluate*'; }

			output += $self.str_repeat(ws, indent) + '[' + key + '] => ';

			if (typeof (child) === 'object') {

				indent ++;

				output += typeof (child) + '\n';
				output += $self.str_repeat(ws, indent) + '(\n';
				output += $self.print_r(child, indent, depth+1);
				output += $self.str_repeat(ws, indent) + ')\n';

				indent --;

			} else
				output += child + '\n';

		}

		indent --;

		output += (indent == 0) ? ')\n' : '';

		return output;

	} else
		return $self.str_repeat(ws, indent) + obj + '\n';
};

$self.alert_r = function(obj, indent, depth) {

	ko.dialogs.alert('Debug:', $self.print_r(obj, indent, depth));
};
