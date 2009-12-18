- Handle column-mode
  http://svn.openkomodo.com/openkomodo/view/openkomodo/trunk/src/chrome/komodo/content/bindings/scintilla.p.xml

- Allow snippets to support regular expression capturing and JavaScript
  transforming:
  <[[%tabstop1:h1]]>Hello World!</[[%tabstop1:[(^\w+)][$1]]]>

- Add menu items for commands; add HTML encode, decode; add URL encode,
  decode;

- Use ko.uriparse.getMappedPath to determine the location for an image in CSS
  previews as well as all supported preview modules

- Auto-complete quotes when '=' pressed after an attribute name or upon
  pressing ENTER to auto-complete an attribute

---

- Don't assign default key bindings if User has cleared all sequences

- Clearing a key binding does not take effect until Komodo is restarted

- Add compatibility check for default Abbreviations folder (Samples x.x.x)
