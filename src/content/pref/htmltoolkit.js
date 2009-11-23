const Cc = Components.classes;
const Ci = Components.interfaces;

const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

var top = window;
while (top.opener)
	top = top.opener;

var $toolkit = top.extensions.htmlToolkit,
	prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService)
				.getBranch('extensions.htmltoolkit.');

var eventsBag = {};

eventsBag.onLoad = function() {

	prefs.QueryInterface(Ci.nsIPrefBranch2);

	var allCommands = $toolkit.command.dispatcher.commands,
		commandName, commandId, commandKey, commandLabel,
		preferencesEl = document.getElementById('components-preferences'),
		treeEl = document.getElementById('components-group'),
		bodyEl = document.getElementById('components-group-body'),
		itemEl, rowEl, cellsEl, preferenceEl;

	for (var i = 0; i < allCommands.length; i ++) {

		commandName = allCommands[i].command;
		commandId = 'pref_cmd_' + commandName.replace('.', '_', 'g');
		commandKey = 'command.' + commandName + '.enabled';

		// Check if the command can be turned on/off by looking for a label
		try { commandLabel = $toolkit.l10n('command').GetStringFromName(commandName); }
		catch (e) { continue; }

		preferenceEl = document.createElementNS(XUL_NS, 'preference');

		preferenceEl.setAttribute('id', commandId)
		preferenceEl.setAttribute('type', 'bool');
		preferenceEl.setAttribute('name', prefs.root + commandKey);

		preferencesEl.appendChild(preferenceEl);

		itemEl = document.createElementNS(XUL_NS, 'treeitem');
		rowEl = document.createElementNS(XUL_NS, 'treerow');

		cellsEl = [];
		cellsEl[0] = document.createElementNS(XUL_NS, 'treecell');
		cellsEl[1] = document.createElementNS(XUL_NS, 'treecell');
		cellsEl[2] = document.createElementNS(XUL_NS, 'treecell');

		cellsEl[0].setAttribute('preference-editable', true);
		cellsEl[0].setAttribute('preference', commandId);

		try { cellsEl[0].setAttribute('value', prefs.getBoolPref(prefs.root + commandKey)); }
		catch (e) { cellsEl[0].setAttribute('value', true); }

		cellsEl[1].setAttribute('label', commandLabel);
		cellsEl[1].setAttribute('editable', false);

		cellsEl[2].setAttribute('label', $toolkit.l10n('command').GetStringFromName('command.type'));
		cellsEl[2].setAttribute('editable', false);

		rowEl.appendChild(cellsEl[0]);
		rowEl.appendChild(cellsEl[1]);
		rowEl.appendChild(cellsEl[2]);
		itemEl.appendChild(rowEl);
		bodyEl.appendChild(itemEl);
	}

	treeEl.addEventListener('keypress', eventsBag.onComponentsKeyPress, false);

	window.setTimeout(function() {
		window.centerWindowOnScreen();
		bodyEl.focus();
	}, 1)
};

eventsBag.onAccept = function() {

	var bodyEl = document.getElementById('components-group-body'),
		cellEls = bodyEl.getElementsByTagName('treecell'),
		commandKey, commandName,
		preferenceEl;

	for (var i = 0; i < cellEls.length; i ++) {

		commandId = cellEls[i].getAttribute('preference');
		if (commandId !== null && commandId.length) {

			preferenceEl = document.getElementById(commandId);
			if (preferenceEl) {

				commandName = preferenceEl.getAttribute('name');
				prefs.setBoolPref(commandName, ('true' === cellEls[i].getAttribute('value') ? true : false));
			}
		}
	}
};

eventsBag.onComponentsKeyPress = function(e) {

	if (e.charCode === 32 && ! e.altKey) {

		var treeEl = document.getElementById('components-tree'),
			selection = treeEl.view.selection,
			selectionLength = selection.getRangeCount();

		if (selectionLength < 1)
			return false;

		var selectedRows = [],
			rangeStart = {}, rangeEnd = {};

		for (var i = 0; i < selectionLength; i ++) {
			selection.getRangeAt(i, rangeStart, rangeEnd);
			for (var j = rangeStart.value; j <= rangeEnd.value; j ++) {
				if (j >= 0) {
					selectedRows.push(j);
				}
			}
		}

		var groupedState = true;
		for (i = 0; groupedState && i < selectedRows.length; i ++)
			groupedState &= ('true' === treeEl.view.getCellValue(selectedRows[i], {}) ? true : false);

		for (var i = 0; i < selectedRows.length; i ++)
			treeEl.view.setCellValue(selectedRows[i], {}, (groupedState ? 'false' : 'true'));

		return false;
	}

    return true;
};

$toolkit.trapExceptions(eventsBag);

window.addEventListener('load', eventsBag.onLoad, false);
window.addEventListener('dialogaccept', eventsBag.onAccept, false);