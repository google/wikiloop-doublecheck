import { MwActionApiClient2 } from "~/shared/mwapi2";
//import axios from 'axios';

let axios = require("axios");
let MockAdapter = require("axios-mock-adapter");

// This sets the mock adapter on the default instance
let mock = new MockAdapter(axios);

let mwapi2: MwActionApiClient2;

describe('MwActionApiClient2 endpoint', () => {
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

describe('MwActionApiClient2.fetchRevisionInfo with mocked axio', () => {
  beforeEach(() => {
    mwapi2 = new MwActionApiClient2(axios);
  });

  test('should return revision full information when given a valid revId', async () => {
    let wiki="enwiki"; 

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
    mock.onAny(/.*/).reply(500);
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

});
