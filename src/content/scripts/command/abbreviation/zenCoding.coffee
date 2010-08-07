root = $toolkit ? this
root.include 'editor'
root.include 'external'
root.include 'htmlUtils'

SUBLANGUAGE_SUPPORTED_LIST = ['HTML', 'HTML5', 'XML', 'XBL', 'PHP']
SUBLANGUAGE_EXTRA_LIST     = ['CSS', 'Haml']

$self.provider = ->
  root.command.abbreviation.provider.apply @, [
    providerName     = 'zenCoding'
    providerOrdering = 6200
  ]

  @getAllowedCharacters = -> [
    []
    ['a-z', 'A-Z', '0-9', '#', '\\.', '>', '\\+', '\\*', '\\:', '\\$', '\\-', '_', '\\!', '@', '\\[', '\\]', '\\(', '\\)', '\\|']
  ]

  @canExecute = (view) ->
    isEnabled   = root.pref('tagComplete.zenCodingEnabled') is 'true'
    isInstalled = zen_editor? and zen_coding?
    return no unless isEnabled and isInstalled
    isHtmlBuffer          = root.editor.isHtmlBuffer view
    isLanguageSupported   = SUBLANGUAGE_SUPPORTED_LIST.indexOf(view.document.subLanguage) >= 0
    isLanguageSupported or= SUBLANGUAGE_EXTRA_LIST.indexOf(view.document.subLanguage) >= 0
    isLanguageSupported or= isHtmlBuffer
    return no unless isLanguageSupported
    scimoz = view.scimoz
    return yes unless scimoz.anchor is scimoz.currentPos
    lineStartPosition = scimoz.positionFromLine scimoz.lineFromPosition scimoz.currentPos
    rangeStart        = scimoz.anchor - 1
    rangeEnd          = scimoz.currentPos
    rangeText         = ''
    while rangeStart >= 0
      rangeText = scimoz.getTextRange rangeStart, rangeEnd
      if not this.getAllowedRegExp().test(rangeText)
        break
      else if rangeStart is lineStartPosition
        rangeText = " #{rangeText}"
        break
      rangeStart -= 1
    return no unless /^\s+/.test(rangeText)
    htmlTagsOnly = yes
    if isHtmlBuffer
      rangeText.replace /[a-zA-Z0-9\-\:]+/g, (tagName) ->
        htmlTagsOnly and= (tagName.indexOf(':') >= 0 or /^[0-9]+$/.test(tagName) or $toolkit.htmlUtils.isHtmlTag tagName)
    return htmlTagsOnly

  @findSnippet = (view, abbreviation) ->
    length       = abbreviation.length
    abbreviation = abbreviation.substr(1) if '<' is abbreviation.charAt(0)
    snippet      = null
    zen_editor.setContext view
    content = zen_coding.expandAbbreviation abbreviation, zen_editor.getSyntax(), zen_editor.getProfileName()
    if content?.length
      # Stop erroneous completions in CSS documents
      return null if content.indexOf('<') is 0 and SUBLANGUAGE_EXTRA_LIST.indexOf(view.document.subLanguage) >= 0
      tabstop = 0
      content = content.replace zen_coding.getCaretPlaceholder(), ( -> "[[%tabstop#{tabstop += 1}]]"), 'g'
      content = content.replace "[[%tabstop#{tabstop - 1}]]", "[[%tabstop0]]"
      snippet = $toolkit.library.createSnippet content, abbreviation
      snippet.parent =
        name: 'Zen Coding'
        parent:
          name: '*internal*'
    return snippet

  this

$self.registerAll = ->
  root.external.zenCoding = new $self.provider()
  root.external.zenCoding.register()
