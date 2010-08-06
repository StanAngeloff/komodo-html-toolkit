Priority 1
==========

* [Column-mode](http://svn.openkomodo.com/openkomodo/view/openkomodo/trunk/src/chrome/komodo/content/bindings/scintilla.p.xml) support

* Allow snippets to support regular expression capturing and JavaScript
  transforming:

        <[[%tabstop1:h1]]>Hello World!</[[%tabstop1:[(^\w+)][$1]]]>

* Use `ko.uriparse.getMappedPath` to determine the location for an image in
  CSS previews as well as all supported preview modules

* Auto-complete quotes when `=` pressed after an attribute name or upon
  pressing ENTER to auto-complete an attribute

* Option to select CSS file in preview modules (or option to leave the
  default)

* Option to assign icons/colours to tabs -- useful when several files have the
  same name, but reside on different paths (controllers, views, etc.)


Priority 2
==========

* Don't assign default key bindings if User has cleared all sequences

* Clearing a key binding does not take effect until Komodo is restarted

* Add compatibility check for default abbreviations folder *Samples x.x.x*


Priority 3
==========

* Run on Save incl. tutorials on how to install and configure Sass, Closure
  Compiler, etc.


If at all…
==========

* CoffeeScript UDL + auto-complete? .tmbundle to UDL

* Document navigation as in IDE: classes, div#ids, etc.

* Change add-on locale to en-GB?
