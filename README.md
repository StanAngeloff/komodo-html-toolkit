A growing collection of tools to help you edit & author HTML/XML documents inside Komodo Edit/IDE.

What it does:
=============
- **>** — auto-complete tag; knows all about HTML 4/5 and won't auto-complete invalid tags; recognises empty elements (`<hr />`, `<embed />`, etc.) and completes accordingly
- **Ctrl + >** — convert word under cursor to a tag
- **TAB** — expand abbreviation or convert word under cursor to a tag if no matching snippet is found
- **Shift + Space** — insert `&nbsp;` entity
- **Ctrl + Enter** — insert `<br />` tag and move caret to a new line
- **Shift + Enter** at line-end — create new list item, table row, table column, etc.
- **Ctrl + Alt + W** — wrap selection/current line in a tag
- **TAB/Shift + TAB** — jump before/after closing tag
- **Ctrl & mouse over** — preview `url(..)` images in CSS files
- **Ctrl + Shift + Alt + L** — turn word under cursor/selection into a hyperlink using Google
- **Ctrl + Alt + D** — duplicate line as template
- **Lorem Ipsum generator**: type: `lipsum` followed by either `.chars`, `.words` or `.paras` and `*times` e.g. `lipsum.words*100` will produce a paragraph with 100 Lorem Ipsum words
- **Markdown & Wiki preview panels**

How to Install
==============

- Download the XPI file from [ActiveState Komodo Extensions](http://community.activestate.com/xpi/html-toolkit)
- Fire up Komodo 5
- Select *Tools* -> *Add-ons* -> *Extensions*
- Drag and drop the XPI file onto the *Add-ons* window
- Wait and confirm the installation

You must restart Komodo for changes to take effect.

Running the latest copy
-----------------------

You can also install HTML Toolkit from source. Follow the
[Firefox extension proxy file](https://developer.mozilla.org/en/Setting_up_extension_development_environment#Firefox_extension_proxy_file)
instructions. You can find your XRE/extensions directory path [in the docs](http://docs.activestate.com/komodo/5.0/trouble.html#appdata_dir).

What's in it for Developers
===========================

The new 1.0+ version allows developers to add custom abbreviations providers. The Lorem Ipsum generator is an example of such a provider.<br />
You can develop your own to automate common tasks. There is no documentation at this point, but [the code](http://github.com/StanAngeloff/komodo-html-toolkit/blob/master/src/content/scripts/command/abbreviation/lipsum.js#path) should be easy to follow.

HTML Toolkit is modular. You can add your own commands and take advantage of the tools already available. Browse the source code below and ask any questions you might have!

