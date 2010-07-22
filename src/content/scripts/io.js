const Cc = Components.classes;
const Ci = Components.interfaces;

$self.getRelativeURI = function(path, asFile) {

	var extensionId = 'htmltoolkit@psp-webtech.co.uk',
		extensionManager = Cc['@mozilla.org/extensions/manager;1'].getService(Ci.nsIExtensionManager),
		installFile = extensionManager.getInstallLocation(extensionId).getItemFile(extensionId, 'install.rdf'),
		installDirectory = installFile.parent;

	if (path)
		path.split('/').forEach(function(pathEntry) {
			if (pathEntry.length)
				installDirectory.append(pathEntry);
		});

	if (asFile)
		return installDirectory;

	return installDirectory.path;
};

$self.findFilesInURI = function(path, pattern, asFile) {

	var directory = $self.getRelativeURI(path, true),
		directoryEntries = directory.directoryEntries,
		directoryFiles = [],
		filePattern = new RegExp('^' + pattern.replace('.', '\\.', 'g')
											  .replace('*', '.*?', 'g') + '$');

	while (directoryEntries.hasMoreElements()) {

		var entry = directoryEntries.getNext();

		entry.QueryInterface(Ci.nsIFile);
		if (entry.isFile() && filePattern.test(entry.leafName))
			directoryFiles.push(asFile ? entry : entry.path);
	}

	return directoryFiles;
};

$self.ensureFile = function(file) {

	return (file && file.QueryInterface &&
			file.isReadable && file.isReadable());
};

$self.readEntireFile = function(file) {

	if ( ! $self.ensureFile(file))
		return null;

	var fileStream = null,
		streamReader = null;

	try {

		fileStream = Cc['@mozilla.org/network/file-input-stream;1'].createInstance(Ci.nsIFileInputStream);
		fileStream.init(file, 0x01, 0, 0);

		streamReader = Cc['@mozilla.org/scriptableinputstream;1'].createInstance(Ci.nsIScriptableInputStream);
		streamReader.init(fileStream);

		var contents = streamReader.read(file.fileSize);

		return contents;

	} finally {

		if (streamReader !== null)
			streamReader.close();
		if (fileStream !== null)
			fileStream.close();
	}

	return null;
};

$self.readLinesFromFile = function(file) {

	if ( ! $self.ensureFile(file))
		return null;

	var fileStream = null,
		streamReader = null;

	try {

		fileStream = Cc['@mozilla.org/network/file-input-stream;1'].createInstance(Ci.nsIFileInputStream);
		fileStream.init(file, 0x01, 0, 0);

		fileStream.QueryInterface(Ci.nsILineInputStream);

		var lines = [], line = {},
			hasMoreLines;

		do {

			hasMoreLines = fileStream.readLine(line);
			lines.push(line.value);

		} while (hasMoreLines);

		return lines;

	} finally {

		if (streamReader !== null)
			streamReader.close();
		if (fileStream !== null)
			fileStream.close();
	}

	return null;
};
