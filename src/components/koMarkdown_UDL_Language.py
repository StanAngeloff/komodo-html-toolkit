# Komodo Markdown language service.

import logging
from koUDLLanguageBase import KoUDLLanguage

log = logging.getLogger("koMarkdownLanguage")

def registerLanguage(registry):
    log.debug("Registering language Markdown")
    registry.registerLanguage(KoMarkdownLanguage())


class KoMarkdownLanguage(KoUDLLanguage):
    name = "Markdown"
    lexresLangName = "Markdown"
    _reg_desc_ = "%s Language" % name
    _reg_contractid_ = "@activestate.com/koLanguage?language=%s;1" % name
    _reg_clsid_ = "02810f41-8807-449c-b355-00b8cca680be"
    defaultExtension = '.md'
    lang_from_udl_family = {}
