root: $toolkit ? this
root.include 'editor'

SUBLANGUAGE_SUPPORTED_LIST: ['HTML', 'XML', 'XBL', 'PHP']
SUBLANGUAGE_EXTRA_LIST:     ['CSS', 'Haml']

$self.provider: ->
  root.command.abbreviation.provider.apply @, [providerName: 'zenCoding'
                                               providerOrdering: 6200]

  @getAllowedCharacters: -> ['a-z', 'A-Z', '0-9', '#', '\\.', '>', '\\+', '\\*', '\\:', '\\$', '\\-', '_', '\\!', '@', '\\[', '\\]', '\\(', '\\)', '\\|']

  @canExecute: (view) ->
    root.pref('tagComplete.zenCodingEnabled') is 'true' \
    and zen_editor? and zen_coding? \
    and ((SUBLANGUAGE_SUPPORTED_LIST.indexOf(view.document.subLanguage) >= 0 and root.editor.isHtmlBuffer(view)) or \
          SUBLANGUAGE_EXTRA_LIST.indexOf(view.document.subLanguage) >= 0)

  @findSnippet: (view, abbreviation) ->
    length:       abbreviation.length
    abbreviation: abbreviation.substr(1) if '<' is abbreviation.charAt(0)
    snippet:      null
    zen_editor.setContext view
    content: zen_coding.expandAbbreviation abbreviation, zen_editor.getSyntax(), zen_editor.getProfileName()
    if content?.length
      tabstop: 0
      content: content.replace zen_coding.getCaretPlaceholder(), ( -> "[[%tabstop${tabstop: + 1}]]"), 'g'
      content: content.replace "[[%tabstop${tabstop - 1}]]", "[[%tabstop0]]"
      snippet: $toolkit.library.createSnippet content, abbreviation
      snippet.parent: {
        name: 'Zen Coding'
        parent: {
          name: '*internal*'
        }
      }
    snippet

  this

$self.registerAll: ->
  new $self.provider().register()
