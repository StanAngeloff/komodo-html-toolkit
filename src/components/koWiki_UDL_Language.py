# Komodo Wiki language service.

import logging
from koUDLLanguageBase import KoUDLLanguage

log = logging.getLogger("koWikiLanguage")

def registerLanguage(registry):
    log.debug("Registering language Wiki")
    registry.registerLanguage(KoWikiLanguage())


class KoWikiLanguage(KoUDLLanguage):
    name = "Wiki"
    lexresLangName = "Wiki"
    _reg_desc_ = "%s Language" % name
    _reg_contractid_ = "@activestate.com/koLanguage?language=%s;1" % name
    _reg_clsid_ = "4931bf1b-c7e2-44ab-83c6-20df3eca509f"
    defaultExtension = '.wiki'
    lang_from_udl_family = {}
