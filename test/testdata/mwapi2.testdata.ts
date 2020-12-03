interface MwApiResponse {
  status: number
  data: any
}

interface MwApiRequest {
  url: string
  params: any
}

interface MwApiPair {
  req: MwApiRequest
  res: MwApiResponse
}

export const PARSE_API_DATA: MwApiPair[] = [
  // https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=links|images|iwlinks&oldid=920429244
  {
    req: {
      url: 'https://en.wikipedia.org/w/api.php',
      params: {
        action: 'parse',
        format: 'json',
        prop: 'links|images|iwlinks',
        oldid: 920429244
      }
    } as MwApiRequest,
    res: {
      status: 200,
      data: {
        parse: {
          title: 'Ishiyama Hongan-ji',
          pageid: 1698014,
          revid: 920429244,
          links: [
            {
              ns: 0,
              exists: '',
              '*': 'Buddhist temples in Japan'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Echizen Province'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Geographic coordinate system'
            },
            {
              ns: 0,
              exists: '',
              '*': 'ISBN (identifier)'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Ikkō-ikki'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Ikkō-shū'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Izumi Province'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Jōdo Shinshū'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Kaga Province'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Kyoto'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Kōsa'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Mōri clan'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Oda Nobunaga'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Osaka'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Osaka Castle'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Osaka castle'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Rennyo'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Sakai, Osaka'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Sengoku period'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Seto Inland Sea'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Settsu Province'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Siege of Ishiyama Hongan-ji'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Takeda Shingen'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Toyotomi Hideyoshi'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Uesugi Kenshin'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Yamashina Mido'
            },
            {
              ns: 0,
              exists: '',
              '*': 'Yodo River'
            }
          ],
          images: ['Osaka_Castle_02bs3200.jpg', 'Commons-logo.svg'],
          iwlinks: [
            {
              prefix: 'commons',
              url:
                'https://commons.wikimedia.org/wiki/Category:Ishiyama_Hongan-ji',
              '*': 'commons:Category:Ishiyama Hongan-ji'
            }
          ]
        }
      }
    } as MwApiResponse
  },
  {
    req: {
      url: 'https://en.wikipedia.org/w/api.php',
      params: {
        action: 'parse',
        format: 'json',
        prop: 'links|images|iwlinks',
        oldid: 123456789012345
      }
    } as MwApiRequest,
    res: {
      status: 200,
      data: {
        error: {
          code: 'nosuchrevid',
          info: 'There is no revision with ID 123456789012345.',
          '*':
            'See https://en.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes.'
        },
        servedby: 'mw1279'
      }
    } as MwApiResponse
  }
]
