import { MwActionApiClient2 } from "~/shared/mwapi2";
import { PARSE_API_DATA } from '../testdata/mwapi2.testdata';

let axios = require("axios");
let MockAdapter = require("axios-mock-adapter");

let mwapi2: MwActionApiClient2;

describe('MwActionApiClient2.endPoint', () => {
  beforeEach(() => {
    mwapi2 = new MwActionApiClient2(axios);
  });

  test('should generate a valid Wikipedia endpint URL when passed a good wiki.', () => {
    expect(mwapi2.endPoint(`enwiki`)).toBe(`https://en.wikipedia.org/w/api.php`);
    expect(mwapi2.endPoint(`wikidatawiki`)).toBe(`https://wikidata.org/w/api.php`);
  });

  test('should throw an exception complaining about the bad', () => {
    expect(() => mwapi2.endPoint(`badwiki`)).toThrowError(`badwiki`);
  });
});

describe('MOCKED MwActionApiClient2.fetchRevisionInfo', () => {
  beforeEach(() => {
    mwapi2 = new MwActionApiClient2(axios);
  });

  test('should return revision full information when given a valid revId', async () => {
    let wiki="enwiki"; 
    let mock = new MockAdapter(axios);
    let mockedRes = {
      "batchcomplete": "",
      "query": {
        "pages": {
          "58955273": {
            "pageid": 58955273,
            "ns": 0,
            "title": "Multiprocessor system architecture",
            "revisions": [
              {
                "revid": 904396518,
                "parentid": 904395753,
                "user": "Dhtwiki",
                "timestamp": "2019-07-01T21:49:32Z",
                "comment": "/* Multiprocessor system featuring global data multiplication */ putting images at bottom, side by side, to prevent impinging on References section"
              }
            ]
          }
        }
      }
    };
    
    mock.onGet("https://en.wikipedia.org/w/api.php", {params: {   
      "action": "query",
      "format": "json",
      "prop": "revisions",
      "revids": 904396518,
      "origin": "*"
    }}).reply(function (config) {
      // `config` is the axios config and contains things like the url
     
      // return an array in the form of [status, data, headers]
      return [
        200,
        mockedRes,
      ];
    });
    mock.onAny(/.*/).reply(500); // Any other response are going to yield 500
    let info = await mwapi2.fetchRevisionInfo(wiki, 904396518);
    expect(info.wiki).toBe(`enwiki`);
    expect(info.title).toBe(`Multiprocessor system architecture`);
    expect(info.pageId).toBe(58955273);
    expect(info.namespace).toBe(0);
    expect(info.revId).toBe(904396518);
    expect(info.parentRevId).toBe(904395753);
    expect(info.author).toBe("Dhtwiki");
    expect(info.timestampStr).toBe("2019-07-01T21:49:32Z");
    expect(info.comment).toBe("/* Multiprocessor system featuring global data multiplication */ putting images at bottom, side by side, to prevent impinging on References section");
  });
  
  test('should return null when given an invalid revId.', async() => {
    let wiki="enwiki"; 
    let invalidRevId = 123456789012345;
    let mock = new MockAdapter(axios);

    let mockedRes = {
      "batchcomplete": "",
      "query": {
        "badrevids": {
          "1234567890123456": {
            "revid": invalidRevId
          }
        }
      }
    }
    
    mock.onGet("https://en.wikipedia.org/w/api.php", {params: {   
      "action": "query",
      "format": "json",
      "prop": "revisions",
      "revids": invalidRevId,
      "origin": "*"
    }}).reply(function (config) {
      // `config` is the axios config and contains things like the url
     
      // return an array in the form of [status, data, headers]
      return [
        200,
        mockedRes,
      ];
    }).onAny().reply(500); // Any other response are going to yield 500
    let info = await mwapi2.fetchRevisionInfo(wiki, invalidRevId);
    expect(info).toBeNull;
  });
});

/**
 * The test with real axio sending real HTTP requests to fetch revision info
 * 
 * **!Note** This test requires a test environment with network connectivity and can be flaky.
 */
describe('MOCKED MwActionApiClient2.fetchDiff', () => {  
  beforeEach(() => {
    mwapi2 = new MwActionApiClient2(axios);
  });

  test('should throw an exception with "nosuchrevid" when given an invalid revId.', async () => {
    let mock = new MockAdapter(axios);
    let wiki="enwiki";
    let invalidRevId = 123456789012345;

    let mockedRes = {
      "error": {
        "code": "nosuchrevid",
        "info": "There is no revision with ID 11904395753.",
        "*": "See https://en.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."
      },
      "servedby": "mw1359"
    }

    mock
    .onGet(`https://en.wikipedia.org/w/api.php`, { params: {
      "action": "compare",
      "format": "json",
      "origin": "*",
      "torelative": "prev",
      "fromrev": 123456789012345,
    }})
    .reply(function (config) {
      // `config` is the axios config and contains things like the url
      // return an array in the form of [status, data, headers]
      return [
        200,
        mockedRes,
      ];
    })
    .onAny()
    .reply(500);

    await expect(mwapi2.fetchDiff(wiki, invalidRevId)).rejects.toThrow(/nosuchrevid/);
  });
});

describe('MOCKED MwActionApiClient2.fetchParsedInfo', () => {
  beforeEach(() => {
    mwapi2 = new MwActionApiClient2(axios)
    let mock = new MockAdapter(axios)
    PARSE_API_DATA.forEach(data => {
      mock
        .onGet(data.req.url, { params: data.req.params })
        .reply(function(_) {
          return [
            data.res.status, 
            data.res.data
          ]
        })
    })
    mock.onAny().reply(503)
  })

  test('should fetch parsed info when given a valid revision', async () => {
    let wiki = 'enwiki'
    let revId = 920429244

    let parsedInfo = await mwapi2.fetchParsedInfo(wiki, revId)
    expect(parsedInfo.links[0]['*']).toBe('Buddhist temples in Japan')
    expect(parsedInfo.images[0]).toBe('Osaka_Castle_02bs3200.jpg')
    expect(parsedInfo.iwlinks[0]['*']).toBe(
      'commons:Category:Ishiyama Hongan-ji'
    )
  })

  test('should fetch parsed info when given a valid revision', async () => {
    let wiki = 'enwiki'
    let revId = 123456789012345
    await expect(mwapi2.fetchParsedInfo(wiki, revId)).rejects.toThrow(/123456789012345/);
  })
})
