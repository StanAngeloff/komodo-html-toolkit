`const Cc = Components.classes`
`const Ci = Components.interfaces`

`const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'`

# Find the most recent Komodo window and grab a reference to the HTML Toolkit extension
windowManagerService: Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator)
recentKomodoWindow: windowManagerService.getMostRecentWindow('Komodo')
$toolkit: recentKomodoWindow.extensions.htmlToolkit

# Grab the preferences branch for HTML Toolkit
prefsService: Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService)
prefsBranch: prefsService.getBranch('extensions.htmltoolkit.')

eventsBag: {

	onLoad: ->
		prefsService.QueryInterface(Ci.nsIPrefBranch2)

		tagCompleteGroup: document.getElementById('tag-complete-group')
		tagCompleteGroup.addEventListener('keypress', eventsBag.onTagCompleteGroupKeyPress, false)

		window.setTimeout((centerWindow: ->
			window.centerWindowOnScreen()
		), 1)

	onTagCompleteGroupKeyPress: (e) ->
		if e.charCode is 32 and not e.altKey
			tree: document.getElementById('tag-complete-tree')
			selection: tree.view.selection
			selectionLength: selection.getRangeCount()

			return false unless selectionLength

			selectedRows: []
			rangeStart: {}
			rangeEnd: {}

			for i in [0...selectionLength]
				selection.getRangeAt(i, rangeStart, rangeEnd)
				for j in [rangeStart.value..rangeEnd.value]
					selectedRows.push(j) if j >= 0

			groupedState: true
			for i in [0...selectedRows.length]
				groupedState &&= tree.view.getCellValue(selectedRows[i], {}) is 'true'
				break unless groupedState

			tree.view.setCellValue(selectedRows[i], {}, if groupedState then 'false' else 'true') for i in [0...selectedRows.length]

			return false

		return true

	onAccept: ->
		tagCompleteTree: document.getElementById('tag-complete-tree')
		tagCompleteCells: tagCompleteTree.getElementsByTagName('treecell')

		for cell in tagCompleteCells
			prefId = cell.getAttribute('preference')
			if (prefId.length)
				prefEl = document.getElementById(prefId)
				if (prefEl?)
					preferenceName = prefEl.getAttribute('name')
					prefsService.setCharPref(preferenceName, cell.getAttribute('value'))
}

$toolkit.trapExceptions(eventsBag)

window.addEventListener('load', eventsBag.onLoad, false)
window.addEventListener('dialogaccept', eventsBag.onAccept, false)
