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
