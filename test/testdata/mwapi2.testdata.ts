export interface MwApiResponse {
  status: number
  data: any
}

export interface MwApiRequest {
  url: string
  params: any
}

export interface MwApiPair {
  req: MwApiRequest
  res: MwApiResponse
}

export const PARSE_API_DATA: MwApiPair[] = [
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "revids": 123456789012345,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "batchcomplete": "",
        "query": {
          "badrevids": {
            "123456789012345": {
              "revid": 123456789012345
            }
          }
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "compare",
        "format": "json",
        "origin": "*",
        "fromrev": 123456789012345,
        "torelative": "prev"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "error": {
          "code": "nosuchrevid",
          "info": "There is no revision with ID 123456789012345.",
          "*": "See https://en.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."
        },
        "servedby": "mw1412"
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "parse",
        "format": "json",
        "prop": "links|images|iwlinks",
        "oldid": 123456789012345,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "error": {
          "code": "nosuchrevid",
          "info": "There is no revision with ID 123456789012345.",
          "*": "See https://en.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."
        },
        "servedby": "mw1359"
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "parse",
        "format": "json",
        "prop": "links|images|iwlinks",
        "oldid": 920429244,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "parse": {
          "title": "Ishiyama Hongan-ji",
          "pageid": 1698014,
          "revid": 920429244,
          "links": [
            {
              "ns": 0,
              "exists": "",
              "*": "Buddhist temples in Japan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Echizen Province"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Geographic coordinate system"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "ISBN (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ikkō-ikki"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ikkō-shū"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Izumi Province"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jōdo Shinshū"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kaga Province"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kyoto"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kōsa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mōri clan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Oda Nobunaga"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Osaka"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Osaka Castle"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Osaka castle"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rennyo"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sakai, Osaka"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sengoku period"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Seto Inland Sea"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Settsu Province"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Siege of Ishiyama Hongan-ji"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Takeda Shingen"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Toyotomi Hideyoshi"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Uesugi Kenshin"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Yamashina Mido"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Yodo River"
            }
          ],
          "images": [
            "Osaka_Castle_02bs3200.jpg",
            "Commons-logo.svg"
          ],
          "iwlinks": [
            {
              "prefix": "commons",
              "url": "https://commons.wikimedia.org/wiki/Category:Ishiyama_Hongan-ji",
              "*": "commons:Category:Ishiyama Hongan-ji"
            }
          ]
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "revids": 920429244,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "batchcomplete": "",
        "query": {
          "pages": {
            "1698014": {
              "pageid": 1698014,
              "ns": 0,
              "title": "Ishiyama Hongan-ji",
              "revisions": [
                {
                  "revid": 920429244,
                  "parentid": 913912176,
                  "minor": "",
                  "user": "Invokingvajras",
                  "timestamp": "2019-10-09T18:54:57Z",
                  "comment": "+cat [[Category:1490s establishments in Japan]]; -cat [[Category:15th-century establishments in Japan]]"
                }
              ]
            }
          }
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "compare",
        "format": "json",
        "origin": "*",
        "fromrev": 920429244,
        "torelative": "prev"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "compare": {
          "fromid": 1698014,
          "fromrevid": 913912176,
          "fromns": 0,
          "fromtitle": "Ishiyama Hongan-ji",
          "toid": 1698014,
          "torevid": 920429244,
          "tons": 0,
          "totitle": "Ishiyama Hongan-ji",
          "*": "<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 52:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 52:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>[[Category:Forts in Japan]]</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>[[Category:Forts in Japan]]</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>[[Category:Osaka Castle]]</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>[[Category:Osaka Castle]]</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>[[Category:<del class=\"diffchange diffchange-inline\">15th-century</del> establishments in Japan]]</div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>[[Category:<ins class=\"diffchange diffchange-inline\">1490s</ins> establishments in Japan]]</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>[[Category:15th-century fortifications]]</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>[[Category:15th-century fortifications]]</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>[[Category:Rennyo]]</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>[[Category:Rennyo]]</div></td>\n</tr>\n\n<!-- diff cache key enwiki:diff:wikidiff2:1.12:old-913912176:rev-920429244:1.10.0 -->\n"
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "revids": 920429245,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "batchcomplete": "",
        "query": {
          "pages": {
            "62013220": {
              "pageid": 62013220,
              "ns": 3,
              "title": "User talk:Bob847102",
              "revisions": [
                {
                  "revid": 920429245,
                  "parentid": 920344213,
                  "user": "LiberatorG",
                  "timestamp": "2019-10-09T18:54:57Z",
                  "comment": "Notification: speedy deletion nomination of [[:Draft:Calysta Licks a Horse]]. ([[WP:TW|TW]])"
                }
              ]
            }
          }
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "compare",
        "format": "json",
        "origin": "*",
        "fromrev": 920429245,
        "torelative": "prev"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "compare": {
          "fromid": 62013220,
          "fromrevid": 920344213,
          "fromns": 3,
          "fromtitle": "User talk:Bob847102",
          "toid": 62013220,
          "torevid": 920429245,
          "tons": 3,
          "totitle": "User talk:Bob847102",
          "*": "<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 1:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 1:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== October 2019 ==</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== October 2019 ==</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>[[File:Information orange.svg|25px|alt=Information icon]] Please do not add or change content, as you did at [[:Verizon Communications]], without citing a [[Wikipedia:Reliable sources|reliable source]]. Please review the guidelines at [[Wikipedia:Citing sources]] and take this opportunity to add references to the article. Thank you.&lt;!-- Template:uw-unsourced2 --&gt; [[User:LiberatorG|LiberatorG]] ([[User talk:LiberatorG|talk]]) 04:58, 9 October 2019 (UTC)</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>[[File:Information orange.svg|25px|alt=Information icon]] Please do not add or change content, as you did at [[:Verizon Communications]], without citing a [[Wikipedia:Reliable sources|reliable source]]. Please review the guidelines at [[Wikipedia:Citing sources]] and take this opportunity to add references to the article. Thank you.&lt;!-- Template:uw-unsourced2 --&gt; [[User:LiberatorG|LiberatorG]] ([[User talk:LiberatorG|talk]]) 04:58, 9 October 2019 (UTC)</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>==[[Wikipedia:Criteria for speedy deletion|Speedy deletion]] nomination of [[:Draft:Calysta Licks a Horse]]==</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>[[File:Ambox warning pn.svg|48px|left|alt=|link=]]</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>Please do not introduce inappropriate pages, such as [[:Draft:Calysta Licks a Horse]], to Wikipedia. Doing so is considered to be [[Wikipedia:Vandalism|vandalism]] and is prohibited. If you would like to experiment, please use the [[Wikipedia:Sandbox|sandbox]]. Under [[Wikipedia:CSD#G3|section G3 of the criteria for speedy deletion]], the page has been nominated for deletion. Repeated vandalism may result in the '''[[Wikipedia:Blocking policy|loss of editing privileges]]'''. </div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>If you think this page should not be deleted for this reason, you may '''contest the nomination''' by [[:Draft:Calysta Licks a Horse|visiting the page]] and clicking the button labelled \"Contest this speedy deletion\". This will give you the opportunity to explain why you believe the page should not be deleted. However, be aware that once a page is tagged for speedy deletion, it may be deleted without delay. Please do not remove the speedy deletion tag from the page yourself, but do not hesitate to add information in line with [[Wikipedia:List of policies|Wikipedia's policies and guidelines]]. &lt;!-- Template:Db-vandalism-notice --&gt;&lt;!-- Template:Db-csd-notice-custom --&gt; [[User:LiberatorG|LiberatorG]] ([[User talk:LiberatorG|talk]]) 18:54, 9 October 2019 (UTC)</div></td>\n</tr>\n\n<!-- diff cache key enwiki:diff:wikidiff2:1.12:old-920344213:rev-920429245:1.10.0 -->\n"
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "parse",
        "format": "json",
        "prop": "links|images|iwlinks",
        "oldid": 920429245,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "parse": {
          "title": "User talk:Bob847102",
          "pageid": 62013220,
          "revid": 920429245,
          "links": [
            {
              "ns": 2,
              "exists": "",
              "*": "User:LiberatorG"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Verizon Communications"
            },
            {
              "ns": 3,
              "exists": "",
              "*": "User talk:LiberatorG"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Blocking policy"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:CSD"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Citing sources"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Criteria for speedy deletion"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:List of policies"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Reliable sources"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Sandbox"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Vandalism"
            },
            {
              "ns": 118,
              "*": "Draft:Calysta Licks a Horse"
            }
          ],
          "images": [
            "Information_orange.svg",
            "Ambox_warning_pn.svg"
          ],
          "iwlinks": []
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "revids": 920429246,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "batchcomplete": "",
        "query": {
          "pages": {
            "27611": {
              "pageid": 27611,
              "ns": 0,
              "title": "Sarah Michelle Gellar",
              "revisions": [
                {
                  "revid": 920429246,
                  "parentid": 920346006,
                  "user": "66.188.164.31",
                  "anon": "",
                  "timestamp": "2019-10-09T18:54:55Z",
                  "comment": ""
                }
              ]
            }
          }
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "compare",
        "format": "json",
        "origin": "*",
        "fromrev": 920429246,
        "torelative": "prev"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "compare": {
          "fromid": 27611,
          "fromrevid": 920346006,
          "fromns": 0,
          "fromtitle": "Sarah Michelle Gellar",
          "toid": 27611,
          "torevid": 920429246,
          "tons": 0,
          "totitle": "Sarah Michelle Gellar",
          "*": "<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 3:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 3:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>{{Use American English|date=January 2017}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>{{Use American English|date=January 2017}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>{{Infobox person</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>{{Infobox person</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| name               = Sarah Michelle Gellar</div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>| name               = Sarah Michelle Gellar<ins class=\"diffchange diffchange-inline\"> Prinze</ins></div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| image              = Sarah Michelle Gellar by David Shankbone.jpg</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| image              = Sarah Michelle Gellar by David Shankbone.jpg</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| caption            = Gellar at the 2007 [[Tribeca Film Festival]]</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| caption            = Gellar at the 2007 [[Tribeca Film Festival]]</div></td>\n</tr>\n\n<!-- diff cache key enwiki:diff:wikidiff2:1.12:old-920346006:rev-920429246:1.10.0 -->\n"
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "parse",
        "format": "json",
        "prop": "links|images|iwlinks",
        "oldid": 920429246,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "parse": {
          "title": "Sarah Michelle Gellar",
          "pageid": 27611,
          "revid": 920429246,
          "links": [
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Use mdy dates from March 2019"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Use American English from January 2017"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Articles with unsourced statements from April 2016"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Articles with dead external links from August 2019"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles needing page number citations from September 2010"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Articles with dead external links from January 2018"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with BNE identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with BNF identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with CANTIC identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with GND identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with ISNI identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with LCCN identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with MusicBrainz identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with NKC identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with NTA identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with SUDOC identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with VIAF identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Wikipedia articles with WORLDCATID identifiers"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:CS1 maint: archived copy as title"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Daytime Emmy Award Outstanding Younger Actress"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:MTV Movie Award for Best Kiss"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:MTV Movie Award for Best Actor in a Movie"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:People's Choice Award for Favorite Actress in a New TV Series"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Satellite Award for Best Cast – Television Series"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Saturn Award for Best Actress on Television"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Teen Choice Award Choice Movie Villain"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Teen Choice Award Choice TV Actress Drama"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "14th Youth in Film Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "15th Youth in Film Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "16th Youth in Film Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1999 Kids' Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1999 Teen Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2000 Kids' Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2000 Teen Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2001 Cannes Film Festival"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2001 Kids' Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2001 Teen Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2002 Kids' Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2002 MTV Movie Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2002 Teen Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2003 Kids' Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2003 Teen Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2005 Teen Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "2012 Teen Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "20th Youth in Film Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "22nd Daytime Emmy Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "25th Saturn Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "26th Saturn Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "27th Saturn Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "28th Saturn Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "29th Saturn Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "30th Saturn Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "40th People's Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "AIDS"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "A Woman Named Jackie"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Access Hollywood"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Adam DeVine"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Adam Driver"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Adam Sandler"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Adam Shankman"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Adrienne Frantz"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Adult film star"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Alec Baldwin"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Alexander Ludwig"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Alicia Silverstone"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "All My Children"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Allure (magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "AmIAnnoying.com"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Amanda Bynes"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Amber Tamblyn"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "American Broadcasting Company"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "American Crime (TV series)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "American Crime Story"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "American Dad!"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "American Pie 2"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Amy Smart"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "And They Call It Bobby Love"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Angel (1999 TV series)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Anna Chlumsky"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Anna Torv"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Anne Billson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Anne Heche"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ansel Elgort"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Anthony Guidera"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "April O'Neil"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Arnold Schwarzenegger"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ashley Benson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ashton Sanders"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "BNE (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "BNF (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bella Thorne"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Beverly Hills Family Robinson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bill Nighy"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Black belt (martial arts)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Blake Lively"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Blockbuster Entertainment Award"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Blockbuster Entertainment Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bobcat Goldthwait"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bra"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Brad Pitt"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bradley Cooper"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Breast cancer"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Brendan Fraser"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Briana Evigan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Brittany Allen"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Brokeback Mountain"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "BuddyTV"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Buffy Summers"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Buffy the Vampire Slayer"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Buffy the Vampire Slayer (BFI TV Classics S.)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Burger King"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "CANTIC (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "CARE (relief)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "CBS"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cady McClain"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Caitriona Balfe"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Call of Duty: Black Ops"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cam Gigandet"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cameo appearance"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cameron Diaz"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Camryn Grimes"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Carmen Electra"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Carol Kane"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cast album"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Chadwick Boseman"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Channel 4"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Charlize Theron"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Chicago Tribune"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Chloe Lanier"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Christel Khalil"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Christian Slater"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cinderella (Disney character)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Claire Danes"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Claudia Black"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Colin Farrell"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Columbia Grammar & Preparatory School"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Comin' Up From Behind"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cookbook"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cordelia Chase"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cosmopolitan (magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Crossbow (TV series)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Crossroads (1986 film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cruel Intentions"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cruel Intentions (pilot)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "DVD Talk"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Daphne Blake"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Dark Horizons"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "David Boreanaz"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Daytime Emmy Award"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Daytime Emmy Award for Outstanding Younger Actress in a Drama Series"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Daytime Emmy Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Deadline Hollywood"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Demi Moore"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Denzel Washington"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Digital Spy"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Donald Sutherland"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Drew Barrymore"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Dubai International Film Festival"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Dumb and Dumber"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Dwayne Johnson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "E! Online"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "E-commerce"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "EBay"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Eden Riegel"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Elle (magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ellen DeGeneres"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ellen Wheeler"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Elliot Page"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Emilia Clarke"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Eminem"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Emma Roberts"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Emma Watson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Emmy Award"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Entertainment Weekly"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Eric Stoltz"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Erica Kane"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Esquire (magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "FHM"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "FHM's 100 Sexiest Women (UK)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Figure skater"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Fiorello H. LaGuardia High School of Music & Art and Performing Arts"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Foodstirs"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Forest Whitaker"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Fox Broadcasting Company"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Freddie Prinze, Jr."
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Freddie Prinze Jr."
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Funny Farm (film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "GND (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Gillian Anderson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Gina Vendetti"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Glamour (magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Glamour Magazine"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "God, the Devil and Bob"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Golden Globe Award"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Golden Globe Award for Best Actress – Television Series Drama"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Golden Globe Award for Best Performance by an Actress in a Television Series - Drama"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Got Milk?"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Gotham (magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Grey's Anatomy"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Grosse Pointe (TV series)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Gwyneth Paltrow"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Habitat for Humanity"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Happily N'Ever After"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Harvard Man"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hayden Panettiere"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hayley Erin"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Heath Ledger"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Heather Tom"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Herve Leger"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "High Stakes (1989 film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hilary Duff"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Horror movie"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hunter King"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "IGN"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "IMDb"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "ISBN (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "ISNI (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "I Know What You Did Last Summer"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "I Will Remember You (Angel)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Indecent Proposal"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Independence Day (1996 film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "It girl"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jack Black"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jacqueline Bouvier"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jake Gyllenhaal"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "James Toback"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Janet Jackson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jason Biggs"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jeff Daniels"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jennifer Aniston"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jennifer Finnigan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jennifer Garner"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jennifer Landon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jennifer Lawrence"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jennifer Love Hewitt"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jessica Alba"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jewish"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jharrel Jerome"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jim Carrey"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "John Leguizamo"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Johnny Depp"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Joseph Fiennes"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Josh Brolin"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Josh Hutcherson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Joss Whedon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Julia Roberts"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Julia Stiles"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Julianne Moore"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Julie Berman"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Justin Timberlake"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Karen Davis (The Grudge)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kate Mulgrew"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kathryn Merteuil"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Keanu Reeves"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Keiynan Lonsdale"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kendall Hart"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kevin Bacon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kids' Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kimberly McCullough"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "King of the Hill"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kirsten Dunst"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kristen Alderson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kristen Bell"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kristen Stewart"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "LCCN (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lady Gaga"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lana Condor"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Late Show with David Letterman"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lauren Holly"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lawsuit"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lee Pace"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Leighton Meester"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Leonardo DiCaprio"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Les Liaisons dangereuses"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lexi Ainsworth"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lili Reinhart"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Linda Cardellini"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Linda Hamilton"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lindsay Lohan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of Sex and the City episodes"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Live action"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Long Island"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Long Island, New York"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Love, Simon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lucy Hale"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Luke Evans"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lynda Carter"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "MBA (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "MTV Movie Award"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "MTV Movie Award for Best Actor in a Movie"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "MTV Movie Award for Best Breakthrough Performance"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "MTV Movie Award for Best Frightened Performance"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "MTV Movie Award for Best Kiss"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "MTV Movie Award for Best Performance"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "MTV Movie Award for Best Villain"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "MTV Movie Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Macaulay Culkin"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mad Men"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Madame Tussauds"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Make-A-Wish Foundation"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Marcy Playground"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Margaret Colin"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Maria Santos (All My Children)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Marie Claire"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Marisa Tomei"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Martha Byrne"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mary McDonnell"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Matthew Broderick"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Matthew Lillard"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Maxim (magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Maybelline"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "McDonald's"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Melissa Benoist"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Melissa Hayden (actress)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Michael B. Jordan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Michael Landes"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mike Myers"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Moonlight (2016 film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Moonshine River"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "My Girl (film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "NBC"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "NKC (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "NTA (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Natasha Henstridge"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Neve Campbell"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "New York City"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "New York Post"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Nick Robinson (American actor)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Nicole Kidman"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Noah Centineo"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Nylon (magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "OK!"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Olay"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Once More, with Feeling (Buffy episode)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Orange Is the New Black"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Outlander (TV series)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Over the Brooklyn Bridge"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Owen Wilson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "People's Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Pitch Perfect 2"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Poldark (2015 TV series)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Possession (2009 film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Primetime Emmy Award for Outstanding Limited Series"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Princess Rap Battle"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Priyanka Chopra"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Professional Children's School"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Project Angel Food"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rachel Bilson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rachel McAdams"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rachelle Lefevre"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Raja Gosnell"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Reality television"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rebel Wilson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rescue Me (American TV series)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Richard Kelly (director)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ringer (TV series)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Robert Hoffman (actor)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Robert Pattinson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Robin Williams"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Robot Chicken"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Roger Ebert"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Roger Kumble"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rolling Stone"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Roma Downey"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ryan Gosling"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ryan Phillippe"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "SFX Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "SUDOC (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sacha Baron Cohen"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "San Diego Comic-Con"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "San Francisco Chronicle"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sanctuary (Angel episode)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sandra Bullock"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sarah Joy Brown"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Satellite Award for Best Actress - Television Series Drama"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Satellite Award for Best Cast – Television Series"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Satellite Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Saturday Night Live"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Saturn Award"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Saturn Award for Best Actress on Television"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Saturn Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Save the Last Dance"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "SciFi.com"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Scooby-Doo (film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Scooby-Doo 2: Monsters Unleashed"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Scream 2"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sean Patrick Thomas"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Seann William Scott"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Selma Blair"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Seventeen (American magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Seventh Sister Inquisitor"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sex and the City"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Shailene Woodley"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Shakespeare in Love"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Shannen Doherty"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sharon Stone"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "She's All That"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Silver Linings Playbook"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Simply Irresistible (film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sleeper hit"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Small Soldiers"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Soapcentral"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sonequa Martin-Green"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sorority"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sour Girl"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Southland Tales"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Species (film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Spenser: For Hire"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Spider-Man (2002 film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "St. Martin's Press"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Star Wars Rebels"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Starbucks"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Starsky & Hutch (film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Step Up 2: The Streets"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Stone Temple Pilots"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Suburban Girl"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Succession (TV series)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Susan Lucci"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Swans Crossing"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "TMNT (film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "TV Guide"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "TV Line"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Taekwondo"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Talladega Nights: The Ballad of Ricky Bobby"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Teen Choice Award"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Teen Choice Award for Choice Movie Actress – Comedy"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Teen Choice Award for Choice Movie Villain"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Teen Choice Award for Choice TV Actress Drama"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Teen Choice Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Television Critics Association Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Television film"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Television in the United States"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Television show"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Air I Breathe"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Assassination of Gianni Versace: American Crime Story"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Big Bang Theory"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Crazy Ones"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Fault in Our Stars (film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Grudge"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Grudge 2"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Hollywood Reporter"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Independent"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Knick"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The New York Times"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Notebook"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Return (2006 film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Simpsons"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Simpsons (season 24)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Twilight Saga: Breaking Dawn – Part 1"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Twilight Saga: Eclipse"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Twilight Saga: New Moon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The WB"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Walking Dead (TV series)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Wandering Juvie"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Wedding Singer"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The West Wing"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Those Who Can't"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Time Inc."
            },
            {
              "ns": 0,
              "exists": "",
              "*": "To All the Boys I've Loved Before (film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tobey Maguire"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tokyo, Japan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tom Cruise"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tom Felton"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tom Hanks"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tracey E. Bregman"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tribeca Film Festival"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tricia Cast"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Troian Bellisario"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "True Blood"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "True O'Brien"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Twilight (2008 film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Uma Thurman"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Untamed Heart"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Upper East Side"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Upper Manhattan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "VIAF (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Valerie Harper"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Vaseline"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Vera Farmiga"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Veronika Decides to Die (film)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Village Voice"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Viola Davis"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Virgin Media"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Virtual In-Stanity"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Vivica A. Fox"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Vogue (magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Warner Bros. Television"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Washington Post"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Wayback Machine"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "We're the Millers"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Wilhelmina Models"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Will Ferrell"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Will Poulter"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Will Smith"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Woody Harrelson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "WorldCat Identities (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Yancy Butler"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Yari Film Group"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "YouTube"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Young Artist Award"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Young Artist Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Young Hollywood Awards"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Zac Efron"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Citation needed"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Citing sources"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Link rot"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:Daytime Emmy Award Outstanding Younger Actress"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:MTV Movie Award for Best Actor in a Movie"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:MTV Movie Award for Best Kiss"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:People's Choice Award for Favorite Actress in a New TV Series"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:Satellite Award for Best Cast – Television Series"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:Saturn Award for Best Actress on Television"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:Teen Choice Award Choice Movie Villain"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:Teen Choice Award Choice TV Actress Drama"
            },
            {
              "ns": 12,
              "exists": "",
              "*": "Help:Authority control"
            }
          ],
          "images": [
            "Sarah_Michelle_Gellar_by_David_Shankbone.jpg",
            "Sarah_Michelle_Gellar.jpg",
            "Sarah_Michelle_Gellar_Comic-Con_5,_2011.jpg",
            "Sarah_Michelle_Gellar's_Wax_Statue.jpg",
            "Freddie_Prinze_Jr_and_Sarah_Michelle_Gellar_by_David_Shankbone.jpg",
            "Commons-logo.svg",
            "Wikiquote-logo.svg",
            "OOjs_UI_icon_edit-ltr-progressive.svg"
          ],
          "iwlinks": [
            {
              "prefix": "commons",
              "url": "https://commons.wikimedia.org/wiki/Category:Sarah_Michelle_Gellar",
              "*": "commons:Category:Sarah Michelle Gellar"
            },
            {
              "prefix": "wikiquote",
              "url": "https://en.wikiquote.org/wiki/Special:Search/Sarah_Michelle_Gellar",
              "*": "wikiquote:Special:Search/Sarah Michelle Gellar"
            }
          ]
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "revids": 920429247,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "batchcomplete": "",
        "query": {
          "pages": {
            "27364078": {
              "pageid": 27364078,
              "ns": 0,
              "title": "The Immortals of Meluha",
              "revisions": [
                {
                  "revid": 920429247,
                  "parentid": 918396649,
                  "user": "Dgreatgs",
                  "timestamp": "2019-10-09T18:54:57Z",
                  "comment": "/* Translations */Added a language"
                }
              ]
            }
          }
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "compare",
        "format": "json",
        "origin": "*",
        "fromrev": 920429247,
        "torelative": "prev"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "compare": {
          "fromid": 27364078,
          "fromrevid": 918396649,
          "fromns": 0,
          "fromtitle": "The Immortals of Meluha",
          "toid": 27364078,
          "torevid": 920429247,
          "tons": 0,
          "totitle": "The Immortals of Meluha",
          "*": "<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 95:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 95:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>==Translations==</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>==Translations==</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>The books have been translated into a number of languages like English (South Asia), Hindi, Marathi,  Bengali, Gujarati, Assamese, Malayalam, Telugu, Kannada, Bahasa Indonesian, Tamil, English (UK), Estonian and Spanish,&lt;ref&gt;{{cite web |url=http://www.thisweekbangalore.com/released-in-several-regional-languages-amishs-shiva-trilogy-is-the-fastest-selling-book-series-in-indian-publishing-history/ |title=Language editions |date=9 December 2013 |publisher=This Week Bangalore |accessdate=19 December 2013 |url-status=live |archiveurl=https://web.archive.org/web/20131230020435/http://www.thisweekbangalore.com/released-in-several-regional-languages-amishs-shiva-trilogy-is-the-fastest-selling-book-series-in-indian-publishing-history/ |archivedate=30 December 2013 |df=dmy-all }}&lt;/ref&gt; with the author believing that publishing as a whole is gradually being embedded in the Indian business sensibilities.&lt;ref name=\"zee\"&gt;{{cite news|url=http://zeenews.india.com/entertainment/bookworm/english-mass-market-books-tap-hindi-speakers_2456.htm|title=English mass-market books tap Hindi speakers|date=11 August 2012|accessdate=31 August 2012|publisher=Zee News|url-status=live|archiveurl=https://web.archive.org/web/20131029202120/http://zeenews.india.com/entertainment/bookworm/english-mass-market-books-tap-hindi-speakers_2456.htm|archivedate=29 October 2013|df=dmy-all}}&lt;/ref&gt; Further explaining his thoughts, Tripathi said \"I genuinely believe those five years from today, we will have a situation when other languages will account for higher sales of books than in English. That is the big change happening in publishing—it is taking pride in its own culture than knowing other cultures like in television, where regional language channels have more [[Target rating point|TRP]]s.\"&lt;ref name=\"zee\"/&gt; The local language versions were also commercial successes. The Telugu version was translated by Rama Sundari and published by BCS Publishers and Distributors; the book sold more than 5,000&amp;nbsp;copies in a month and went for a second print order of 10,000&amp;nbsp;copies.&lt;ref name=\"dontwakeme\"&gt;{{cite news|url=http://www.thehindu.com/arts/books/its-a-dream-dont-wake-me/article4126820.ece|title=It’s a dream; don’t wake me’|last=Dundoo|first=Sangeeta Devi|date=23 November 2012|accessdate=27 December 2012|work=The Hindu|publisher=The Hindu Group|url-status=live|archiveurl=https://web.archive.org/web/20121228233105/http://www.thehindu.com/arts/books/its-a-dream-dont-wake-me/article4126820.ece|archivedate=28 December 2012|df=dmy-all}}&lt;/ref&gt; Other than the local versions, the books have also been released as an [[Amazon Kindle]] version, available only in India.&lt;ref&gt;{{Cite web|url=https://www.amazon.com/Immortals-of-Meluha-ebook/dp/B008593O8S/ref=pd_sim_kstore_1?ie=UTF8&amp;m=AH9CGK6QR37LL|title=Immortals of Meluha &lt;nowiki&gt;[Kindle Edition]&lt;/nowiki&gt;|date=22 May 2012|accessdate=31 August 2012|publisher=Amazon Kindle}}&lt;/ref&gt;</div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>The books have been translated into a number of languages like English (South Asia), Hindi, Marathi,  Bengali, Gujarati, Assamese, Malayalam, Telugu, Kannada, Bahasa Indonesian, Tamil, English (UK), Estonian<ins class=\"diffchange diffchange-inline\">, Czech</ins> and Spanish,&lt;ref&gt;{{cite web |url=http://www.thisweekbangalore.com/released-in-several-regional-languages-amishs-shiva-trilogy-is-the-fastest-selling-book-series-in-indian-publishing-history/ |title=Language editions |date=9 December 2013 |publisher=This Week Bangalore |accessdate=19 December 2013 |url-status=live |archiveurl=https://web.archive.org/web/20131230020435/http://www.thisweekbangalore.com/released-in-several-regional-languages-amishs-shiva-trilogy-is-the-fastest-selling-book-series-in-indian-publishing-history/ |archivedate=30 December 2013 |df=dmy-all }}&lt;/ref&gt; with the author believing that publishing as a whole is gradually being embedded in the Indian business sensibilities.&lt;ref name=\"zee\"&gt;{{cite news|url=http://zeenews.india.com/entertainment/bookworm/english-mass-market-books-tap-hindi-speakers_2456.htm|title=English mass-market books tap Hindi speakers|date=11 August 2012|accessdate=31 August 2012|publisher=Zee News|url-status=live|archiveurl=https://web.archive.org/web/20131029202120/http://zeenews.india.com/entertainment/bookworm/english-mass-market-books-tap-hindi-speakers_2456.htm|archivedate=29 October 2013|df=dmy-all}}&lt;/ref&gt; Further explaining his thoughts, Tripathi said \"I genuinely believe those five years from today, we will have a situation when other languages will account for higher sales of books than in English. That is the big change happening in publishing—it is taking pride in its own culture than knowing other cultures like in television, where regional language channels have more [[Target rating point|TRP]]s.\"&lt;ref name=\"zee\"/&gt; The local language versions were also commercial successes. The Telugu version was translated by Rama Sundari and published by BCS Publishers and Distributors; the book sold more than 5,000&amp;nbsp;copies in a month and went for a second print order of 10,000&amp;nbsp;copies.&lt;ref name=\"dontwakeme\"&gt;{{cite news|url=http://www.thehindu.com/arts/books/its-a-dream-dont-wake-me/article4126820.ece|title=It’s a dream; don’t wake me’|last=Dundoo|first=Sangeeta Devi|date=23 November 2012|accessdate=27 December 2012|work=The Hindu|publisher=The Hindu Group|url-status=live|archiveurl=https://web.archive.org/web/20121228233105/http://www.thehindu.com/arts/books/its-a-dream-dont-wake-me/article4126820.ece|archivedate=28 December 2012|df=dmy-all}}&lt;/ref&gt; Other than the local versions, the books have also been released as an [[Amazon Kindle]] version, available only in India.&lt;ref&gt;{{Cite web|url=https://www.amazon.com/Immortals-of-Meluha-ebook/dp/B008593O8S/ref=pd_sim_kstore_1?ie=UTF8&amp;m=AH9CGK6QR37LL|title=Immortals of Meluha &lt;nowiki&gt;[Kindle Edition]&lt;/nowiki&gt;|date=22 May 2012|accessdate=31 August 2012|publisher=Amazon Kindle}}&lt;/ref&gt;</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>==Film adaptation==</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>==Film adaptation==</div></td>\n</tr>\n\n<!-- diff cache key enwiki:diff:wikidiff2:1.12:old-918396649:rev-920429247:1.10.0 -->\n"
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "parse",
        "format": "json",
        "prop": "links|images|iwlinks",
        "oldid": 920429247,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "parse": {
          "title": "The Immortals of Meluha",
          "pageid": 27364078,
          "revid": 920429247,
          "links": [
            {
              "ns": 14,
              "exists": "",
              "*": "Category:EngvarB from January 2014"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Use dmy dates from January 2014"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Good articles"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Amish Tripathi"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Amar Chitra Katha"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Amazon Kindle"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Amish Tripathi"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Andhra Pradesh"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Anil Dharker"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Assam"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Asuras"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Audiobook"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ayodhya"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bennett, Coleman & Co. Ltd."
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bickram Ghosh"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bihar"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bṛhaspati"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Chhattisgarh"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Chillum (pipe)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Daeva"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Daily Bhaskar"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Daily News & Analysis"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Daily News (New York)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Daily News and Analysis"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Daksha"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Dakshayani"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Damaru"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Dandaka"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Delhi"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Devdutt Pattanaik"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Dharma"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Dharma Productions"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "E-book"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Facebook"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Fantasy"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ganesh"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Graham Hancock"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Gregory Possehl"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Gujarat"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "HT Media Ltd"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hardbound"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Haryana"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Himachal Pradesh"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hindu deities"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hindu mythology"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hindu texts"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hindustan Times"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hollywood"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "ISBN (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "ISSN (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Indian Institute of Management Calcutta"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Indus Valley Civilisation"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jaipur"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jharkhand"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Karan Johar"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Karan Malhotra"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Karma in Hinduism"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Karnataka"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kashmir"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lake Manasarovar"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lunar Dynasty"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Madhya Pradesh"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Maharashtra"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mayank Austen Soofi"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Meghalaya"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Microsoft Excel"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mint (newspaper)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mount Kailash"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mount Mandara"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mumbai Mirror"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Myth"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Nandi (bull)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Nielsen BookScan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Nilkanth"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "OCLC (identifier)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "OPEN (Indian magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Orissa, India"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Outlook (Indian magazine)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Palash Sen"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Pashupati"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Prahlad Kakkar"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Priest"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Punjab, India"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Raavan: Enemy of Aryavarta"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rajasthan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rama"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rolling Stone"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sanjay Leela Bhansali"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sarasvati River"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sati (goddess)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Satya"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Scion of Ikshvaku"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Shashi Tharoor"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Shiva"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Shiva trilogy"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sikkim"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sita: Warrior of Mithila"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Soma (drink)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sonu Nigam"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Spiritual awakening"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Steven Erikson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Subhash K. Jha"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Suryavansha"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Target rating point"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Taufiq Qureshi"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Economic Times"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Hindu"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The New Indian Express"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Oath of the Vayuputras"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Secret of the Nagas"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Statesman (India)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Times Group"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Times of India"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Tribune (Chandigarh)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Thriller (genre)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Twitter"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Uttar Pradesh"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Uttarakhand"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Vedas"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Virabhadra"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "West Bengal"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "YouTube"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:Amish Tripathi"
            },
            {
              "ns": 12,
              "exists": "",
              "*": "Help:CS1 errors"
            }
          ],
          "images": [
            "Symbol_support_vote.svg",
            "The_Immortals_Of_Meluha.jpg",
            "Secretofthenagasrelease2.jpg"
          ],
          "iwlinks": []
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "revids": 920429248,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "batchcomplete": "",
        "query": {
          "badrevids": {
            "920429248": {
              "revid": 920429248
            }
          }
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "parse",
        "format": "json",
        "prop": "links|images|iwlinks",
        "oldid": 920429248,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "error": {
          "code": "nosuchrevid",
          "info": "There is no revision with ID 920429248.",
          "*": "See https://en.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."
        },
        "servedby": "mw1286"
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "compare",
        "format": "json",
        "origin": "*",
        "fromrev": 920429248,
        "torelative": "prev"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "error": {
          "code": "nosuchrevid",
          "info": "There is no revision with ID 920429248.",
          "*": "See https://en.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."
        },
        "servedby": "mw1380"
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "revids": 920429249,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "batchcomplete": "",
        "query": {
          "pages": {
            "30841038": {
              "pageid": 30841038,
              "ns": 0,
              "title": "SBG",
              "revisions": [
                {
                  "revid": 920429249,
                  "parentid": 920429128,
                  "user": "Shhhnotsoloud",
                  "timestamp": "2019-10-09T18:54:59Z",
                  "comment": "typo"
                }
              ]
            }
          }
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "compare",
        "format": "json",
        "origin": "*",
        "fromrev": 920429249,
        "torelative": "prev"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "compare": {
          "fromid": 30841038,
          "fromrevid": 920429128,
          "fromns": 0,
          "fromtitle": "SBG",
          "toid": 30841038,
          "torevid": 920429249,
          "tons": 0,
          "totitle": "SBG",
          "*": "<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 7:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 7:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>* Savage Bingham and Garfield Railroad, a [[List of common carrier freight railroads in the United States|a common carrier freight railroad in the U.S.]]</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>* Savage Bingham and Garfield Railroad, a [[List of common carrier freight railroads in the United States|a common carrier freight railroad in the U.S.]]</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>* [[Scottish Bus Group]], a state-owned group of bus operators</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>* [[Scottish Bus Group]], a state-owned group of bus operators</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>Sinclair Broadcast Group <del class=\"diffchange diffchange-inline\">(SBG) is a publicly traded</del> American telecommunications conglomerate </div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div><ins class=\"diffchange diffchange-inline\">* [[</ins>Sinclair Broadcast Group<ins class=\"diffchange diffchange-inline\">]],</ins> <ins class=\"diffchange diffchange-inline\">an</ins> American telecommunications conglomerate </div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>* Skye Bank Guinée, a [[List of banks in Guinea|bank in Guinea]]</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>* Skye Bank Guinée, a [[List of banks in Guinea|bank in Guinea]]</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>* [[Union Bank of Switzerland]], (German: ''Schweizerische Bankgesellschaft'')</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>* [[Union Bank of Switzerland]], (German: ''Schweizerische Bankgesellschaft'')</div></td>\n</tr>\n"
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "parse",
        "format": "json",
        "prop": "links|images|iwlinks",
        "oldid": 920429249,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "parse": {
          "title": "SBG",
          "pageid": 30841038,
          "revid": 920429249,
          "links": [
            {
              "ns": 1,
              "exists": "",
              "*": "Talk:SBG"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Chaha language"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of banks in Guinea"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of common carrier freight railroads in the United States"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Maimun Saleh Airport"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "SBGS"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sabre Holdings"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Saudi Binladin Group"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Scottish Bus Group"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sebring station"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Seget language"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Server-based gaming"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Siba Giba"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sinclair Broadcast Group"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Small Box Girder"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Star for Bravery in Gold"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Union Bank of Switzerland"
            },
            {
              "ns": 0,
              "*": "Second Battle Group"
            },
            {
              "ns": 12,
              "exists": "",
              "*": "Help:Disambiguation"
            }
          ],
          "images": [
            "Disambig_gray.svg"
          ],
          "iwlinks": []
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "revids": 920429250,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "batchcomplete": "",
        "query": {
          "pages": {
            "57011561": {
              "pageid": 57011561,
              "ns": 1,
              "title": "Talk:2019 in American television",
              "revisions": [
                {
                  "revid": 920429250,
                  "parentid": 920428954,
                  "user": "ShadowCyclone",
                  "timestamp": "2019-10-09T18:54:58Z",
                  "comment": "/* Abuse of policy */"
                }
              ]
            }
          }
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "compare",
        "format": "json",
        "origin": "*",
        "fromrev": 920429250,
        "torelative": "prev"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "compare": {
          "fromid": 57011561,
          "fromrevid": 920428954,
          "fromns": 1,
          "fromtitle": "Talk:2019 in American television",
          "toid": 57011561,
          "torevid": 920429250,
          "tons": 1,
          "totitle": "Talk:2019 in American television",
          "*": "<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 22:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 22:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>There is no violation in the sourcing of Rise of the Teenage Mutant Ninja Turtles move sourcing. The show posted about ''its own move''. You can’t keep screaming “VIOLATION! VIOLATION!” without properly explaining how, considering my edits have been justified every time--[[User:Simmerdon3448|Simmerdon3448]] ([[User talk:Simmerdon3448|talk]]) 15:04, 9 October 2019 (UTC)</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>There is no violation in the sourcing of Rise of the Teenage Mutant Ninja Turtles move sourcing. The show posted about ''its own move''. You can’t keep screaming “VIOLATION! VIOLATION!” without properly explaining how, considering my edits have been justified every time--[[User:Simmerdon3448|Simmerdon3448]] ([[User talk:Simmerdon3448|talk]]) 15:04, 9 October 2019 (UTC)</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>::Read [[WP:SOCIALMEDIA]]. We can't use social media sources that don't talk about the person who's posted the source. Your edits were in good faith, but they're still a violation. We keep telling you to read WP:SM every time, but you never do, so please read it before you reply. [[User:HurricaneGeek2002|HurricaneGeek2002 ]] ([[User talk:HurricaneGeek2002|talk]]) 18:52, 9 October 2019 (UTC)</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>::Read [[WP:SOCIALMEDIA]]. We can't use social media sources that don't talk about the person who's posted the source. Your edits were in good faith, but they're still a violation. We keep telling you to read WP:SM every time, but you never do, so please read it before you reply. [[User:HurricaneGeek2002|HurricaneGeek2002 ]] ([[User talk:HurricaneGeek2002|talk]]) 18:52, 9 October 2019 (UTC)</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>:::Quote the first sentence in that for example, \"Self-published and questionable sources may be used as sources of information about themselves.\". Social media posts have to be about themselves, or we can't use it. Sorry, but that's how it is. [[User:HurricaneGeek2002|HurricaneGeek2002 ]] ([[User talk:HurricaneGeek2002|talk]]) 18:54, 9 October 2019 (UTC)</div></td>\n</tr>\n"
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "parse",
        "format": "json",
        "prop": "links|images|iwlinks",
        "oldid": 920429250,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "parse": {
          "title": "Talk:2019 in American television",
          "pageid": 57011561,
          "revid": 920429250,
          "links": [
            {
              "ns": 0,
              "exists": "",
              "*": "2019 in American television"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Years"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Television program"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "United States"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:WikiProject Television/class"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:WikiProject United States/class"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:WikiProject Lists/class"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:WikiProject Television"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:WikiProject United States"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:WikiProject Years"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:WikiProject Lists"
            },
            {
              "ns": 100,
              "exists": "",
              "*": "Portal:Television"
            },
            {
              "ns": 100,
              "exists": "",
              "*": "Portal:United States"
            },
            {
              "ns": 1,
              "*": "Talk:2019 in American television/to do"
            },
            {
              "ns": 1,
              "*": "Talk:2019 in American television/Archive index"
            },
            {
              "ns": 1,
              "*": "Talk:2019 in American television/archivelist"
            },
            {
              "ns": 1,
              "exists": "",
              "*": "Talk:2019 in American television/Archive 1"
            },
            {
              "ns": 1,
              "*": "Talk:2019 in American television/Archive 1001"
            },
            {
              "ns": 1,
              "*": "Talk:2019 in American television/Archive 201"
            },
            {
              "ns": 1,
              "*": "Talk:2019 in American television/Archive 51"
            },
            {
              "ns": 1,
              "*": "Talk:2019 in American television/Archive 11"
            },
            {
              "ns": 1,
              "*": "Talk:2019 in American television/Archive 2"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject Council"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Manual of Style/Television"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:SOCIALMEDIA"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Stand-alone lists"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject List/Assessment"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject Lists"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject Television"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject Television/American television task force"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject Television/Assessment"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject United States"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject United States/Article alerts"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject United States/Assessment"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject United States/Members"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject United States/Requested Articles"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject United States/US related unreferenced BLPs"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject Years"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:WikiProject Years/Assessment"
            },
            {
              "ns": 2,
              "exists": "",
              "*": "User:HurricaneGeek2002"
            },
            {
              "ns": 2,
              "exists": "",
              "*": "User:Lowercase sigmabot III"
            },
            {
              "ns": 2,
              "exists": "",
              "*": "User:Simmerdon3448"
            },
            {
              "ns": 3,
              "exists": "",
              "*": "User talk:HurricaneGeek2002"
            },
            {
              "ns": 3,
              "exists": "",
              "*": "User talk:Simmerdon3448"
            },
            {
              "ns": 5,
              "exists": "",
              "*": "Wikipedia talk:WikiProject Lists"
            },
            {
              "ns": 5,
              "exists": "",
              "*": "Wikipedia talk:WikiProject Television"
            },
            {
              "ns": 5,
              "exists": "",
              "*": "Wikipedia talk:WikiProject United States"
            },
            {
              "ns": 5,
              "exists": "",
              "*": "Wikipedia talk:WikiProject Years"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:WikiProject Lists"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:WikiProject Television"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:WikiProject United States"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:WikiProject Years"
            },
            {
              "ns": 12,
              "exists": "",
              "*": "Help:Archiving a talk page"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:List-Class List articles"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:List-Class United States articles"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:List-Class Years articles"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:List-Class television articles"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Top-importance American television articles"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Top-importance List articles"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Top-importance United States articles"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Top-importance Years articles"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Top-importance television articles"
            }
          ],
          "images": [
            "WikiProject_Council_with_transparent_background.svg",
            "TV-icon-2.svg",
            "Blank_television_set.svg",
            "Symbol_list_class.svg",
            "WikiProject_United_States_logo.svg",
            "Flag_of_the_United_States.svg",
            "USA_flag_on_television.svg",
            "U.S._flag_on_television.svg",
            "Hourglass.svg",
            "Text-x-generic.svg",
            "Information_icon4.svg",
            "Replacement_filing_cabinet.svg"
          ],
          "iwlinks": []
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "revids": 920429251,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "batchcomplete": "",
        "query": {
          "pages": {
            "56371160": {
              "pageid": 56371160,
              "ns": 0,
              "title": "1987 Classic (snooker)",
              "revisions": [
                {
                  "revid": 920429251,
                  "parentid": 920428938,
                  "minor": "",
                  "user": "Mrloop",
                  "timestamp": "2019-10-09T18:54:59Z",
                  "comment": "/* Main draw */"
                }
              ]
            }
          }
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "compare",
        "format": "json",
        "origin": "*",
        "fromrev": 920429251,
        "torelative": "prev"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "compare": {
          "fromid": 56371160,
          "fromrevid": 920428938,
          "fromns": 0,
          "fromtitle": "1987 Classic (snooker)",
          "toid": 56371160,
          "torevid": 920429251,
          "tons": 0,
          "totitle": "1987 Classic (snooker)",
          "*": "<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 52:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 52:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score02=4</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score02=4</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed03={{flagicon|ENG}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed03={{flagicon|ENG}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| RD1-team03='''<del class=\"diffchange diffchange-inline\">[[</del>Malcolm Bradley<del class=\"diffchange diffchange-inline\">]]</del>'''</div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>| RD1-team03='''Malcolm Bradley'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score03='''5'''</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score03='''5'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed04={{flagicon|ENG}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed04={{flagicon|ENG}}</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 100:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 100:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score18=2</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score18=2</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed19={{flagicon|IRL}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed19={{flagicon|IRL}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| RD1-team19='''<del class=\"diffchange diffchange-inline\">[[</del>Tony Kearney<del class=\"diffchange diffchange-inline\"> (snooker player)|Tony Kearney]]</del>'''</div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>| RD1-team19='''Tony Kearney'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score19='''5'''</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score19='''5'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed20={{flagicon|SCO}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed20={{flagicon|SCO}}</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 115:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 115:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score23='''5'''</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score23='''5'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed24={{flagicon|ENG}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed24={{flagicon|ENG}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| RD1-team24=<del class=\"diffchange diffchange-inline\">[[</del>Ian Williamson<del class=\"diffchange diffchange-inline\"> (snooker player)|Ian Williamson]]</del></div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>| RD1-team24=Ian Williamson</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score24=4</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score24=4</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed25={{flagicon|CAN}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed25={{flagicon|CAN}}</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 145:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 145:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score33='''5'''</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score33='''5'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed34={{flagicon|AUS}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed34={{flagicon|AUS}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| RD1-team34=<del class=\"diffchange diffchange-inline\">[[</del>Graham Jenkins<del class=\"diffchange diffchange-inline\">]]</del></div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>| RD1-team34=Graham Jenkins</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score34=0</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score34=0</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed35={{flagicon|ENG}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed35={{flagicon|ENG}}</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 199:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 199:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score51='''5'''</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score51='''5'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed52={{flagicon|CAN}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed52={{flagicon|CAN}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| RD1-team52=<del class=\"diffchange diffchange-inline\">[[</del>Bernie Mikkelsen<del class=\"diffchange diffchange-inline\">]]</del></div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>| RD1-team52=Bernie Mikkelsen</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score52=3</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score52=3</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed53={{flagicon|SCO}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed53={{flagicon|SCO}}</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 220:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 220:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score58=4</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score58=4</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed59={{flagicon|ENG}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed59={{flagicon|ENG}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| RD1-team59='''<del class=\"diffchange diffchange-inline\">[[</del>Bob Harris<del class=\"diffchange diffchange-inline\"> (snooker player)|Bob Harris]]</del>'''</div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>| RD1-team59='''Bob Harris'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score59='''5'''</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-score59='''5'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed60={{flagicon|CAN}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD1-seed60={{flagicon|CAN}}</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 243:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 243:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score01='''5'''</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score01='''5'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed02={{flagicon|ENG}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed02={{flagicon|ENG}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| RD2-team02=<del class=\"diffchange diffchange-inline\">[[</del>Malcolm Bradley<del class=\"diffchange diffchange-inline\">]]</del></div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>| RD2-team02=Malcolm Bradley</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score02=0</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score02=0</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed03={{flagicon|ENG}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed03={{flagicon|ENG}}</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 267:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 267:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score09='''5'''</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score09='''5'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed10={{flagicon|IRE}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed10={{flagicon|IRE}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| RD2-team10=<del class=\"diffchange diffchange-inline\">[[</del>Tony Kearney<del class=\"diffchange diffchange-inline\"> (snooker player)|Tony Kearney]]</del></div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>| RD2-team10=Tony Kearney</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score10=1</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score10=1</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed11={{flagicon|ENG}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed11={{flagicon|ENG}}</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 327:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 327:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score29='''5'''</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score29='''5'''</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed30={{flagicon|ENG}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed30={{flagicon|ENG}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| RD2-team30=<del class=\"diffchange diffchange-inline\">[[</del>Bob Harris<del class=\"diffchange diffchange-inline\"> (snooker player)|Bob Harris]]</del></div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>| RD2-team30=Bob Harris</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score30=3</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-score30=3</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed31={{flagicon|ENG}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| RD2-seed31={{flagicon|ENG}}</div></td>\n</tr>\n"
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "parse",
        "format": "json",
        "prop": "links|images|iwlinks",
        "oldid": 920429251,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "parse": {
          "title": "1987 Classic (snooker)",
          "pageid": 56371160,
          "revid": 920429251,
          "links": [
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Country data CAN"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Country data ENG"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Country data WAL"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Country data NIR"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Country data AUS"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Country data IRL"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Country data SCO"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Country data RSA"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Country data IRE"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Country data South Africa"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Classic"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:1986–87 snooker season"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Canada"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "England"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Wales"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Northern Ireland"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Australia"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Republic of Ireland"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Scotland"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1980 Classic (1979/1980)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1980 Classic (1980/1981)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1982 Classic (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1983 Classic (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1984 Classic (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1985 Classic (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 Australian Professional Championship"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 Canadian Masters"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 Canadian Professional Championship"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 Carlsberg Challenge"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 China Masters"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 Classic (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 Grand Prix (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 Hong Kong Masters"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 International Open"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 Malaysian Masters"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 Matchroom Professional Championship"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 Scottish Masters"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 South African Professional Championship"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 Thailand Masters"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 UK Championship"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986 World Doubles Championship"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1986–87 snooker season"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 British Open"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 English Professional Championship"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 Irish Masters"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 Irish Professional Championship"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 Kent Cup"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 Masters (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 Matchroom League"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 Pontins Professional"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 Scottish Professional Championship"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 Welsh Professional Championship"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 World Cup (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1987 World Snooker Championship"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1988 Classic (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1989 Classic (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1990 Classic (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1991 Classic (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "1992 Classic (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Alex Higgins"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Barry West"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bill Werbeniuk"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Blackpool"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bob Chaperon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Classic (snooker)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cliff Thorburn"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cliff Wilson"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Colin Roscoe"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Danny Fowler"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Dave Martin (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "David Taylor (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Dean Reynolds"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Dennis Taylor"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Doug Mountjoy"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Eddie Charlton"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Eddie Sinclair"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Eugene Hughes (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Frank Jonik"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Geoff Foulds"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Graham Cripsey"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jack McLaughlin"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jim Wych"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jimmy White"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jimmy van Rensberg"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Joe Johnson (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Joe O'Boye"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "John Campbell (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "John Parrott"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "John Rea (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "John Spencer (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "John Virgo"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Jon Wright (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kirk Stevens"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Lancashire"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Les Dodd"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Marcel Gauvreau"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mario Morra (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mark Bennett (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mick Fisher"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mike Hallett"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Murdo MacLeod (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Neal Foulds"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Norbreck Castle Hotel"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Paddy Browne"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Peter Francisco (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ray Reardon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rex Williams"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Silvino Francisco"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Snooker"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Snooker world rankings"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Stephen Hendry"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Steve Davis"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Steve Duggan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Steve Longworth"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Steve Newbury"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Terry Griffiths"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Terry Murphy (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tommy Murphy (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tony Jones (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tony Knowles (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tony Meo"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Warren King (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Wayne Jones (snooker player)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Willie Thorne"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "World Professional Billiards and Snooker Association"
            },
            {
              "ns": 0,
              "*": "1986 Australian Masters"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:1986–87 snooker season"
            },
            {
              "ns": 11,
              "*": "Template talk:Classic"
            }
          ],
          "images": [
            "Flag_of_Canada_(Pantone).svg",
            "Flag_of_England.svg",
            "Flag_of_Wales_(1959–present).svg",
            "Ulster_Banner.svg",
            "Flag_of_Australia_(converted).svg",
            "Flag_of_Ireland.svg",
            "Flag_of_Scotland.svg",
            "Flag_of_South_Africa_(1928–1994).svg"
          ],
          "iwlinks": []
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "revids": 920429252,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "batchcomplete": "",
        "query": {
          "pages": {
            "10205348": {
              "pageid": 10205348,
              "ns": 0,
              "title": "Anonymous call rejection",
              "revisions": [
                {
                  "revid": 920429252,
                  "parentid": 907469372,
                  "user": "Ira Leviton",
                  "timestamp": "2019-10-09T18:55:00Z",
                  "comment": "Replaced html coding found with [[Wikipedia:Typo Team/moss]] and replaced or deleted jargon abbreviations."
                }
              ]
            }
          }
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "compare",
        "format": "json",
        "origin": "*",
        "fromrev": 920429252,
        "torelative": "prev"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "compare": {
          "fromid": 10205348,
          "fromrevid": 907469372,
          "fromns": 0,
          "fromtitle": "Anonymous call rejection",
          "toid": 10205348,
          "torevid": 920429252,
          "tons": 0,
          "totitle": "Anonymous call rejection",
          "*": "<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 1:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 1:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>{{More citations needed|date=March 2013}}</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>{{More citations needed|date=March 2013}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>In North American [[NANP]] telephone system, '''anonymous call rejection'''<del class=\"diffchange diffchange-inline\"> ('''ACR''')</del> is a [[landline]] [[calling feature]] that screens out calls from callers who have blocked their [[caller ID]] information. It is often free and included with caller ID on landlines, but it may be available separately from the local telephone company.</div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>In North American [[NANP]] telephone system, '''anonymous call rejection''' is a [[landline]] [[calling feature]] that screens out calls from callers who have blocked their [[caller ID]] information. It is often free and included with caller ID on landlines, but it may be available separately from the local telephone company.</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>This feature is not available from most [[cellphone]] services with caller ID, such as [[Sprint Nextel|Sprint]], [[T-Mobile USA]] or [[AT&amp;T Mobility|AT&amp;T]]. [[Verizon Wireless]] <del class=\"diffchange diffchange-inline\">does provide</del> this service, but <del class=\"diffchange diffchange-inline\">ACR</del> prevents dialing a feature code or successfully calling customer service. [[Verizon Wireless]] does not currently provide blocked or anonymous call rejection.</div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>This feature is not available from most [[cellphone]] services with caller ID, such as [[Sprint Nextel|Sprint]], [[T-Mobile USA]] or [[AT&amp;T Mobility|AT&amp;T]]. [[Verizon Wireless]] <ins class=\"diffchange diffchange-inline\">provides</ins> this service, but <ins class=\"diffchange diffchange-inline\">it</ins> prevents dialing a feature code or successfully calling customer service. [[Verizon Wireless]] does not currently provide blocked or anonymous call rejection.</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>In [[North America]], the feature is enabled with the [[vertical service code]] <del class=\"diffchange diffchange-inline\">&lt;tt&gt;</del>*77<del class=\"diffchange diffchange-inline\">&lt;/tt&gt;</del>, and disabled with <del class=\"diffchange diffchange-inline\">&lt;tt&gt;</del>*87<del class=\"diffchange diffchange-inline\">&lt;/tt&gt;</del>.&lt;ref&gt;{{cite web|title=Anonymous Call Rejection|url=http://ora.ca.gov/consumer/alerts/telecom/cons_consancallreject.htm|archiveurl=https://web.archive.org/web/20060213185524/http://ora.ca.gov/consumer/alerts/telecom/cons_consancallreject.htm|website=ORA.CA.gov|publisher=[[Office of Ratepayer Advocates]]|date=2004-12-08|archivedate=2006-02-13|accessdate=2018-04-17}}&lt;/ref&gt;</div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>In [[North America]], the feature is enabled with the [[vertical service code]] <ins class=\"diffchange diffchange-inline\">{{code|</ins>*77<ins class=\"diffchange diffchange-inline\">}}</ins>, and disabled with <ins class=\"diffchange diffchange-inline\">{{code|</ins>*87<ins class=\"diffchange diffchange-inline\">}}</ins>.&lt;ref&gt;{{cite web|title=Anonymous Call Rejection|url=http://ora.ca.gov/consumer/alerts/telecom/cons_consancallreject.htm|archiveurl=https://web.archive.org/web/20060213185524/http://ora.ca.gov/consumer/alerts/telecom/cons_consancallreject.htm|website=ORA.CA.gov|publisher=[[Office of Ratepayer Advocates]]|date=2004-12-08|archivedate=2006-02-13|accessdate=2018-04-17}}&lt;/ref&gt;</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== Service usage messages ==</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== Service usage messages ==</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 13:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 13:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== See also ==</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== See also ==</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>* [[Automatic number identification]]<del class=\"diffchange diffchange-inline\"> (ANI)</del></div></td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>* [[Automatic number identification]]</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>* [[Pat Fleet]], the voice behind some rejection messages</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>* [[Pat Fleet]], the voice behind some rejection messages</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n"
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "parse",
        "format": "json",
        "prop": "links|images|iwlinks",
        "oldid": 920429252,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "parse": {
          "title": "Anonymous call rejection",
          "pageid": 10205348,
          "revid": 920429252,
          "links": [
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Articles needing additional references from March 2013"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "AT&T Mobility"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Automatic number identification"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Caller ID"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Calling feature"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cellphone"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Landline"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "NANP"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "North America"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Office of Ratepayer Advocates"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Pat Fleet"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sprint Nextel"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "T-Mobile USA"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Verizon Wireless"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Vertical service code"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Verifiability"
            },
            {
              "ns": 12,
              "exists": "",
              "*": "Help:Maintenance template removal"
            },
            {
              "ns": 12,
              "exists": "",
              "*": "Help:Referencing for beginners"
            }
          ],
          "images": [
            "Question_book-new.svg"
          ],
          "iwlinks": []
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "revids": 920429253,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "batchcomplete": "",
        "query": {
          "pages": {
            "322806": {
              "pageid": 322806,
              "ns": 0,
              "title": "List of universities in South Africa",
              "revisions": [
                {
                  "revid": 920429253,
                  "parentid": 920428961,
                  "user": "Xoloxolo",
                  "timestamp": "2019-10-09T18:55:00Z",
                  "comment": "/* Removed Centurion Akademie/Academy - not a degree-granting institution*/"
                }
              ]
            }
          }
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "compare",
        "format": "json",
        "origin": "*",
        "fromrev": 920429253,
        "torelative": "prev"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "compare": {
          "fromid": 322806,
          "fromrevid": 920428961,
          "fromns": 0,
          "fromtitle": "List of universities in South Africa",
          "toid": 322806,
          "torevid": 920429253,
          "tons": 0,
          "totitle": "List of universities in South Africa",
          "*": "<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 403:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 403:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| [[Cape Town]] (Learning Communities: [[Johannesburg]], [[Hatfield, Pretoria|Hatfield]], [[Mbombela]], [[Witbank]], [[Eastern Cape]], [[Hermanus]], [[Helderberg]], [[Plettenberg Bay]], [[George, Western Cape|George]])</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| [[Cape Town]] (Learning Communities: [[Johannesburg]], [[Hatfield, Pretoria|Hatfield]], [[Mbombela]], [[Witbank]], [[Eastern Cape]], [[Hermanus]], [[Helderberg]], [[Plettenberg Bay]], [[George, Western Cape|George]])</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| Eng</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| Eng</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>|-</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| Centurion Akademie / Academy</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| </div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| 2000</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>|</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| [[University|Private Higher Education]]</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| Centurion, Klerksdorp, Bellville, Witbank, Rustenburg  </div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"><div>| Afr Eng</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>|-</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>|-</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| [[Damelin]]</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>| [[Damelin]]</div></td>\n</tr>\n"
        }
      }
    }
  },
  {
    "req": {
      "url": "https://en.wikipedia.org/w/api.php",
      "params": {
        "action": "parse",
        "format": "json",
        "prop": "links|images|iwlinks",
        "oldid": 920429253,
        "origin": "*"
      }
    },
    "res": {
      "status": 200,
      "data": {
        "parse": {
          "title": "List of universities in South Africa",
          "pageid": 322806,
          "revid": 920429253,
          "links": [
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Use dmy dates from March 2013"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Articles with dead external links from August 2018"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:CS1 maint: archived copy as title"
            },
            {
              "ns": 14,
              "exists": "",
              "*": "Category:Universities in South Africa"
            },
            {
              "ns": 0,
              "*": "List of universities in Western Sahara"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "AFDA, The South African School of Motion Picture Medium and Live Performance"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Academic boycotts of South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Alice, South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Auckland Park Theological Seminary"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Baptist Theological College of Southern Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bellville, Western Cape"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bhisho"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bloemfontein"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Boksburg"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Bond South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Butterworth, Eastern Cape"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "CIDA City Campus"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "CTI Education Group"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Campus"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cape Higher Education Consortium"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cape Peninsula University of Technology"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cape Technikon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cape Town"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Cape town"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Central University of Technology"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Centurion, Gauteng"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "College of the Transfiguration"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Damelin"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Department of Higher Education and Training"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Durban"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Durban North"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Durban University of Technology"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "East London"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "East London, Eastern Cape"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Eastern Cape"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Eastern Cape Technikon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Empangeni"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Foundation of Tertiary Institutions of the Northern Metropolis"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Ga-Rankuwa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "George, Western Cape"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "George Whitefield College"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Germiston"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Giyani"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Gordon Institute of Business Science"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Grahamstown"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hatfield, Pretoria"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Helderberg"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Henley Business School South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Hermanus"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Higher Education South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "IMM Graduate School of Marketing"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Illovo, Gauteng"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Inscape Design College"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Johannesburg"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kempton Park, Gauteng"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Kimberley, Northern Cape"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Klerksdorp"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Krugersdorp"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "League tables of South African universities"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of Chancellors and Vice-Chancellors of South African universities"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of South African universities by endowment"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of South African university chancellors and vice-chancellors"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of architecture schools in South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of business schools in South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of colleges and universities by country"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of law schools in South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of medical schools in South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of post secondary institutions in South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Algeria"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Angola"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Benin"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Botswana"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Burkina Faso"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Burundi"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Cameroon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Cape Verde"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Chad"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Djibouti"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Egypt"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Equatorial Guinea"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Eritrea"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Eswatini"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Ethiopia"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Gabon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Ghana"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Guinea"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Guinea-Bissau"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Ivory Coast"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Kenya"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Lesotho"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Liberia"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Libya"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Madagascar"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Malawi"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Mali"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Mauritania"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Mauritius"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Morocco"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Mozambique"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Namibia"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Niger"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Nigeria"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Rwanda"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Senegal"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Seychelles"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Sierra Leone"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Somalia"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Somaliland"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in South Sudan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Sudan"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in São Tomé and Príncipe"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Tanzania"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Togo"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Tunisia"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Uganda"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Zambia"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in Zimbabwe"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in the Central African Republic"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in the Comoros"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in the Democratic Republic of the Congo"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in the Gambia"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "List of universities in the Republic of the Congo"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mafikeng"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Management College of Southern Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mangosuthu University of Technology"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mankwe"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mbombela"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Medical University of South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Midrand"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Midrand Graduate Institute"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Milpark Business School"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Monash South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Mthatha"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Nelson Mandela Metropolitan University Business School"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Nelson Mandela University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Newcastle, South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "North-West University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Open access in South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Pietermaritzburg"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Pinetown"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Plettenberg Bay"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Polokwane"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Port Alfred"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Port Elizabeth"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Potchefstroom"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Potchefstroom University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Pretoria"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Qualitas Career Academy"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Queenstown, Eastern Cape"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "QwaQwa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rand Afrikaans University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rankings of business schools in South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rankings of universities in South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Regenesys Business School"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Regent Business School"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Regent University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rhodes Investec Business School"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Rhodes University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Saldanha Bay"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sandton"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Secunda, Mpumalanga"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sefako Makgatho Health Sciences University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sefako Makgatho University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Sol Plaatje University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Somerset West"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Soshanguve"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "South African Business Schools Association"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "South African Institute for Heritage Science and Conservation"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "South African Qualifications Authority"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "South African Technology Network"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "South African Theological Seminary"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Southern Education and Research Alliance"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Soweto"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "St Augustine College of South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Stellenbosch"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Stellenbosch University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Stenden South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Stenden University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "TENET (network)"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Table View"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Technikon"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Technikon Natal"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Technikon Witwatersrand"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "The Open Window School of Visual Communication"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Theological seminary"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Thohoyandou"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Transkei"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Transvaal University College"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tshwane University of Technology"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Tshwane University of Technology Business School"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Turfloop"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Umlazi"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Bophuthatswana"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Cape Town"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Cape Town Graduate School of Business"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Durban-Westville"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Fort Hare"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Johannesburg"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of KwaZulu-Natal"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Limpopo"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Mpumalanga"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Natal"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of North-West"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Port Elizabeth"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Pretoria"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of South Africa"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Stellenbosch"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Stellenbosch Business School"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Technology"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Transkei"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Venda"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of Zululand"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of the Cape of Good Hope"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of the Free State"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of the Free State Business School"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of the North"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of the Western Cape"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "University of the Witwatersrand"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Upington"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Vaal University of Technology"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Vanderbijlpark"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Vista University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Vocational"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Walter Sisulu University"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Walter Sisulu University for Technology and Science"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Wayback Machine"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Welkom"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Westville, KwaZulu-Natal"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Windhoek"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Witbank"
            },
            {
              "ns": 0,
              "exists": "",
              "*": "Wits Business School"
            },
            {
              "ns": 0,
              "*": "New World Mission Dunamis International University"
            },
            {
              "ns": 0,
              "*": "Red & Yellow School"
            },
            {
              "ns": 0,
              "*": "South African College of Applied Psychology"
            },
            {
              "ns": 0,
              "*": "The Design School Southern Africa"
            },
            {
              "ns": 0,
              "*": "UniCollege West Rand"
            },
            {
              "ns": 0,
              "*": "Cape Town Baptist Seminary"
            },
            {
              "ns": 0,
              "*": "University of Gazankulu"
            },
            {
              "ns": 0,
              "*": "List of colleges and universities in south Africa before 1976"
            },
            {
              "ns": 0,
              "*": "List of universities in the Sahrawi Arab Democratic Republic"
            },
            {
              "ns": 0,
              "*": "List of universities in the Canary Islands"
            },
            {
              "ns": 0,
              "*": "List of universities in Ceuta"
            },
            {
              "ns": 0,
              "*": "List of universities in Melilla"
            },
            {
              "ns": 0,
              "*": "List of universities in Madeira"
            },
            {
              "ns": 0,
              "*": "List of universities in Mayotte"
            },
            {
              "ns": 0,
              "*": "List of universities in Réunion"
            },
            {
              "ns": 0,
              "*": "List of universities in Saint Helena"
            },
            {
              "ns": 0,
              "*": "List of universities in Ascension Island"
            },
            {
              "ns": 0,
              "*": "List of universities in Tristan da Cunha"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Universities in South Africa"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:Africa topic"
            },
            {
              "ns": 10,
              "exists": "",
              "*": "Template:South African Business Schools"
            },
            {
              "ns": 4,
              "exists": "",
              "*": "Wikipedia:Link rot"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:Africa topic"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:South African Business Schools"
            },
            {
              "ns": 11,
              "exists": "",
              "*": "Template talk:Universities in South Africa"
            }
          ],
          "images": [
            "UCT_Upper_Campus_landscape_view.jpg",
            "Fort_hare,_old_building_-_rsa.jpg",
            "Main_building_FSU_2.jpg",
            "UKZNPclocktower.jpg",
            "Building_Potchefstroom_University.jpg",
            "Old_Arts_Faculty_Building,_University_of_Pretoria.jpg",
            "Rhodes_oldcampus.jpg",
            "Stellenbosch_Ou_Hoofgebou.jpg",
            "University_of_the_Western_Cape_-_Central_Campus_entry.jpg",
            "The_Wits_University_Great_Hall.jpg",
            "University_of_Johannesburg.jpg",
            "University_of_South_Africa_taken_with_cellphone_camera.jpg",
            "UniversityOfVenda.JPG",
            "CPUT_Cape_Town_Campus.jpg",
            "Tshwane_University_of_Technology.jpg",
            "South_Africa_(orthographic_projection).svg",
            "Folder_Hexagonal_Icon.svg",
            "Symbol_list_class.svg"
          ],
          "iwlinks": []
        }
      }
    }
  }
]
