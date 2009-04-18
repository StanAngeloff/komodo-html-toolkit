/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is Komodo code.
 *
 * The Initial Developer of the Original Code is ActiveState Software Inc.
 * Portions created by ActiveState Software Inc are Copyright (C) 2000-2007
 * ActiveState Software Inc. All Rights Reserved.
 *
 * Contributor(s):
 *   ActiveState Software Inc
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

$toolkit.include('regexp');

const MAX_WIDTH = 380;
const MAX_HEIGHT = 240;

const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

/**
 * A CSS image preview, custom hyperlink handler.
 *
 * @class
 * @base ko.hyperlinks.RegexHandler
 */
ko.hyperlinks.ImagePreviewHandler = function() {

	var name = 'Image preview',
		regexp = /\burl\(["']?(?!\/|\\)([^'"\)]+)["']?\)/i,
		callback = function() { },
		replacement = null,
		supportedLanguages = ['CSS', 'HTML'],
		markerStyle = Components.interfaces.ISciMoz.INDIC_PLAIN,
		markerColour = RGB(0xD0, 0x40, 0xFF);

	ko.hyperlinks.RegexHandler.apply(this, [name, regexp, callback, replacement, supportedLanguages, markerStyle, markerColour]);

	$toolkit.trapExceptions(this);
}

// The following two lines ensure proper inheritance (see Flanagan, p. 144).
ko.hyperlinks.ImagePreviewHandler.prototype = new ko.hyperlinks.RegexHandler();
ko.hyperlinks.ImagePreviewHandler.prototype.constructor = ko.hyperlinks.ImagePreviewHandler;

/**
 * Try and show a hyperlink at the current position in the view.
 *
 * @param view {Components.interfaces.koIScintillaView}  View to check.
 * @param scimoz {Components.interfaces.ISciMoz}  Scimoz for the view.
 * @param pos {int}  Position in the scimoz editor.
 * @param line {string}  The current line from the editor.
 * @param lineStartPos {int} Scimoz position for the start of the line.
 * @param lineEndPos {int}   Scimoz position for the end of the line.
 * @param reason {string}  What the triggering event reason was, can be one of "keypress" or "mousemove".
 * @returns {ko.hyperlinks.Hyperlink} - The hyperlink instance shown.
 */
ko.hyperlinks.ImagePreviewHandler.prototype.show = function(view, scimoz, position, line, lineStartPos, lineEndPos, reason) {

	var hyperlinkMatch = ko.hyperlinks.RegexHandler.prototype.show.apply(this, arguments);
	if ( ! hyperlinkMatch)
		return null;

	var entireMatch = scimoz.getTextRange(hyperlinkMatch.startPos, hyperlinkMatch.endPos),
		imagePath = entireMatch.match(this.findRegex).pop();

	// Check if format is supported by Gecko
	if ( ! $toolkit.regexp.matchGeckoImageFormats(imagePath, '', '$', 'i')) {

		ko.statusBar.AddMessage($toolkit.l10n('hyperlink').formatStringFromName('cssimagepreview.unsupported', [imagePath.split(/\/|\\/).pop()], 1), 'htmltoolkit', 1500, false);

		return hyperlinkMatch;
	}

	var imageURI = null;

	// If we match a protocol, take path as is
	if ($toolkit.regexp.matchProtocol(imagePath, '^'))
		imageURI = imagePath;
	else {

		// Skip unsaved buffers as they don't have an URI attached
		if ( ! view.document.file) {

			ko.statusBar.AddMessage($toolkit.l10n('hyperlink').formatStringFromName('cssimagepreview.unsaved', [view.document.displayPath], 1), 'htmltoolkit', 1500, false);

			return hyperlinkMatch;
		}

		// Base path for resources
		imageURI = view.document.file.URI.substring(0, view.document.file.URI.length - view.document.file.baseName.length)
				 + imagePath;
	}

	var lastMouseX, lastMouseY;
	[lastMouseX, lastMouseY] = view._last_mousemove_xy;

	// Show an image preview element (as well as the hyperlink).
	var popupEl = document.getElementById('imagepreview_popup'),
		imageEl = null,
		sizeEl = null;

	if (popupEl === null) {

		// Creating a "panel" element on Linux makes the main Komodo window to
		// lose focus completely, and now popup is shown. "tooltip" works.
		// Duplicating code from:
		// http://svn.openkomodo.com/openkomodo/view/openkomodo/trunk/src/chrome/komodo/content/hyperlinks/csscolorpicker.js
		var osPrefix = window.navigator.platform.substring(0, 3).toLowerCase();
		if (osPrefix == 'mac') {
			popupEl = document.createElementNS(XUL_NS, 'panel');
			popupEl.setAttribute('noautofocus', 'true');
		} else {
			popupEl = document.createElementNS(XUL_NS, 'tooltip');
		}

		popupEl.setAttribute('id', 'imagepreview_popup');

		popupEl.setAttribute('noautofocus', 'true');
		popupEl.setAttribute('noautohide', 'true');
		popupEl.setAttribute('norestorefocus', 'true');

		imageEl = document.createElementNS(XUL_NS, 'image');
		// This will force re-loading of the image
		imageEl.setAttribute('validate', 'always');

		imageEl.onload = function() {

			var imageComputedStyle = document.defaultView.getComputedStyle(imageEl, ''),
				imageWidth = parseInt(imageComputedStyle.width),
				imageHeight = parseInt(imageComputedStyle.height);

			sizeEl.setAttribute('value', imageWidth + ' x ' + imageHeight);
			sizeEl.style.visibility = 'visible';

			if (imageWidth > MAX_WIDTH) {

				var aspectRatio = imageHeight / imageWidth;
				imageWidth = MAX_WIDTH;
				imageHeight = Math.round(imageWidth * aspectRatio);
			}

			if (imageHeight > MAX_HEIGHT) {

				var aspectRatio = imageWidth / imageHeight;
				imageHeight = MAX_HEIGHT;
				imageWidth = Math.round(imageHeight * aspectRatio);
			}

			imageEl.setAttribute('width', imageWidth);
			imageEl.setAttribute('height', imageHeight);

			// TODO: Ensure not off-screen
		};

		sizeEl = document.createElementNS(XUL_NS, 'label');

		popupEl.appendChild(imageEl);
		popupEl.appendChild(sizeEl);
		document.documentElement.appendChild(popupEl);

	} else {

		imageEl = popupEl.childNodes[0];
		sizeEl = popupEl.childNodes[1];
	}

	if (this.lastURI !== imageURI) {

		imageEl.setAttribute('src', imageURI);

		imageEl.removeAttribute('width');
		imageEl.removeAttribute('height');

		sizeEl.style.visibility = 'collapse';

		this.lastURI = imageURI;
	}

	popupEl.openPopup(view, 'after_pointer', lastMouseX, lastMouseY, false, false);

	return hyperlinkMatch;
}

/**
 * Remove this hyperlink instance.
 *
 * @param view {Components.interfaces.koIScintillaView}  The view instance.
 * @param hyperlink {ko.hyperlinks.Hyperlink} The hyperlink instance.
 * @param reason {string}  What the triggering event reason was, can be one of "keyup", "mousemove", "mouseup" or "blur".
 */
ko.hyperlinks.ImagePreviewHandler.prototype.remove = function(view, hyperlink, reason) {

	ko.hyperlinks.RegexHandler.prototype.remove.apply(this, arguments);

	var popupEl = document.getElementById('imagepreview_popup');
	if (popupEl)
		popupEl.hidePopup();
}

$self.registerAll = function() {

	ko.hyperlinks.addHandler(new ko.hyperlinks.ImagePreviewHandler());
};
