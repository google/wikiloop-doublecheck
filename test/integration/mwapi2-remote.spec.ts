import { MwActionApiClient2 } from "~/shared/mwapi2";

let mwapi2: MwActionApiClient2;

/**
 * The test with real axio sending real HTTP requests to fetch revision info
 * 
 * **!Note** This test requires a test environment with network connectivity and can be flaky.
 */
describe('REMOTE MwActionApiClient2.fetchRevisionInfo', () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    let _axios = require(`axios`);
    mwapi2 = new MwActionApiClient2(_axios);
  });

  test('should return revision full information when given a valid revId. REMOTE', async () => {
    let wiki="enwiki";
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

  test('should return null without error if given a revId never exists. REMOTE', async () => {
    let wiki="enwiki";
    let info = await mwapi2.fetchRevisionInfo(wiki, 1234567890123456);
    expect(info).toBe(null);
  });

  test('should return revision full information if given a revId which is DELETED. REMOTE', async () => {
    let wiki="enwiki";
    let info = await mwapi2.fetchRevisionInfo(wiki, 907978564);
    expect(info.wiki).toBe(`enwiki`);
    expect(info.title).toBe(`User:Alexa Thornton`);
    expect(info.pageId).toBe(61367898);
    expect(info.namespace).toBe(2); //  This page is a User: namespace page.
    expect(info.revId).toBe(907978564);
    expect(info.parentRevId).toBe(0); // This revision creates a page
    expect(info.author).toBe("Alexa Thornton");
    expect(info.timestampStr).toBe("2019-07-26T15:26:27Z");
    expect(info.comment).toBe("[[WP:AES|←]]Created page with 'Preen By Thornton Bregazzi was founded in 1996 by Justin Thornton and Thea Bregazzi, built on an aesthetic of darkly romantic and effortlessly modern, juxtaposin...'");
  });

  test('should handle a page creation', async () => {
    let wiki="enwiki";
    let revId = 797951879; // a page creation for page "Wei Dai": https://en.wikipedia.org/w/index.php?title=Wei_Dai&oldid=718234275
    let info = await mwapi2.fetchRevisionInfo(wiki, revId);
    expect(info.wiki).toBe(`enwiki`);
    expect(info.title).toBe(`User:Xinbenlv`);
    expect(info.pageId).toBe(55081517);
    expect(info.namespace).toBe(2);
    expect(info.revId).toBe(revId);
    expect(info.parentRevId).toBe(0);
    expect(info.author).toBe("Xinbenlv");
    expect(info.timestampStr).toBe("2017-08-30T04:01:09Z");
    expect(info.comment).toBe("[[WP:AES|←]]Created page with 'Xinbenlv is passionated about Wikipedia and its mission. Xinbenlv's edit focus on [[Computer Science]] and [[History]]'");
  });

  test('should handle a page protection', async () => {
    let wiki="enwiki";
    let revId = 991836653; // a PageProtection revision
    let info = await mwapi2.fetchRevisionInfo(wiki, revId);
    expect(info.wiki).toBe(`enwiki`);
    expect(info.title).toBe(`Greg Steube`);
    expect(info.pageId).toBe(36321070);
    expect(info.namespace).toBe(0);
    expect(info.revId).toBe(991836653);
    expect(info.parentRevId).toBe(991823878);
    expect(info.author).toBe("LuK3");
    expect(info.timestampStr).toBe("2020-12-02T01:59:04Z");
    expect(info.comment).toBe("Protected \"[[Greg Steube]]\": Violations of the [[WP:BLP|biographies of living persons policy]] ([Edit=Require autoconfirmed or confirmed access] (expires 01:59, 5 December 2020 (UTC)))");
  });

  test('should handle a revId which is a PageMoveTo', async () => {
    let wiki="enwiki";
    let revId = 991839618; // a PageMoveTo revision
    let info = await mwapi2.fetchRevisionInfo(wiki, revId);
    expect(info.wiki).toBe(`enwiki`);
    expect(info.title).toBe(`Rivolta Femminile`);
    expect(info.pageId).toBe(65643135);
    expect(info.namespace).toBe(0);
    expect(info.revId).toBe(991839618);
    expect(info.parentRevId).toBe(991839291);
    expect(info.author).toBe("Em.mill");
    expect(info.timestampStr).toBe("2020-12-02T02:21:15Z");
    expect(info.comment).toBe("Em.mill moved page [[User:Em.mill/sandbox]] to [[Rivolta Femminile (\"Women's Revolt\")]]: ready for mainspace ");
  });

  test('should handle a revId which is a PageMoveFrom', async () => {
    let wiki="enwiki";
    let revId = 991839619; // a PageMoveFrom revision 
    let info = await mwapi2.fetchRevisionInfo(wiki, revId);
    expect(info.wiki).toBe(`enwiki`);
    expect(info.title).toBe(`User:Em.mill/sandbox`);
    expect(info.pageId).toBe(65991054);
    expect(info.namespace).toBe(2);
    expect(info.revId).toBe(revId);
    expect(info.parentRevId).toBe(0);
    expect(info.author).toBe("Em.mill");
    expect(info.timestampStr).toBe("2020-12-02T02:21:15Z");
    expect(info.comment).toBe("Em.mill moved page [[User:Em.mill/sandbox]] to [[Rivolta Femminile (\"Women's Revolt\")]]: ready for mainspace ");
  });
});

/**
 * The test with real axio sending real HTTP requests to fetch revision info
 * 
 * **!Note** This test requires a test environment with network connectivity and can be flaky.
 */
describe('REMOTE MwActionApiClient2.fetchDiff', () => {  
  expect.extend({
    toMatchHtml(received, expected) {
      let HtmlDiffer = require('html-differ').HtmlDiffer;
      let options = {
          ignoreWhitespaces: true,
          ignoreComments: true,
          ignoreEndTags: true,
          ignoreDuplicateAttributes: false
      };
      let htmlDiffer = new HtmlDiffer(options);

      let diff = htmlDiffer.diffHtml(received, expected);
      const pass = htmlDiffer.isEqual(received, expected);
      if (pass) {
        return {
          message: () =>
            `HTML matches`,
          pass: true,
        };
      } else {
        return {
          message: () =>
            `HTML doesn't match, the difference are ${JSON.stringify(diff.filter(i => i.added || i.removed), null, 2)}.`,
          pass: false,
        };
      }
    },
  });

  let testData = {
    "diff_from_904396518_to_904395753": `<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 93:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 93:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== Multiprocessor system featuring global data multiplication ==</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== Multiprocessor system featuring global data multiplication ==</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-left\" title=\"Paragraph was moved. Click to jump to new location.\" href=\"#movedpara_5_1_rhs\">&#x26AB;</a></td>\n  <td class=\"diff-deletedline\"><div><a name=\"movedpara_1_0_lhs\"></a>[[File:Multiprocessor System Featuring Global Data Multiplication.svg|thumb|<del class=\"diffchange diffchange-inline\">right</del>|upright=2|Multiprocessor System Featuring Global Data Multiplication]]</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>An intermediate approach of the two previous architectures is having common resources and local resources such as local memories (LM) in each processor. </div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>An intermediate approach of the two previous architectures is having common resources and local resources such as local memories (LM) in each processor. </div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 100:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 98:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>This system (patented F. Zulian &lt;ref&gt;{{cite web|url=https://patents.google.com/patent/US4928224A/en|title=Multiprocessor system featuring global data multiplation|publisher=}}&lt;/ref&gt;) used on the DPX/2 300 Unix based system (Bull Hn Information Systems Italia (ex Honeywell)) &lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/unix_and_bull.htm|title=UNIX and Bull|website=www.feb-patrimoine.com}}&lt;/ref&gt;&lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/bull_dpx2.htm|title=Bull DPX|website=www.feb-patrimoine.com}}&lt;/ref&gt;, is a mix of tightly coupled and loose coupled systems and takes all the advancements of these two architectures.</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>This system (patented F. Zulian &lt;ref&gt;{{cite web|url=https://patents.google.com/patent/US4928224A/en|title=Multiprocessor system featuring global data multiplation|publisher=}}&lt;/ref&gt;) used on the DPX/2 300 Unix based system (Bull Hn Information Systems Italia (ex Honeywell)) &lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/unix_and_bull.htm|title=UNIX and Bull|website=www.feb-patrimoine.com}}&lt;/ref&gt;&lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/bull_dpx2.htm|title=Bull DPX|website=www.feb-patrimoine.com}}&lt;/ref&gt;, is a mix of tightly coupled and loose coupled systems and takes all the advancements of these two architectures.</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-left\" title=\"Paragraph was moved. Click to jump to new location.\" href=\"#movedpara_5_2_rhs\">&#x26AB;</a></td>\n  <td class=\"diff-deletedline\"><div><a name=\"movedpara_3_1_lhs\"></a>[[File:Multiprocessor System - Global Data Write-Broadcasting.svg|thumb|right|upright=1.8|Multiprocessor System Featuring Global Data Multiplation - Global Data Write-Broadcasting]]</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>The Local memory is divided into two sectors, global data (GD) and local data (LD).</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>The Local memory is divided into two sectors, global data (GD) and local data (LD).</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 110:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 106:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>Local data can be exchanged like in loosely coupled system via [[message-passing]]</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>Local data can be exchanged like in loosely coupled system via [[message-passing]]</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-right\" title=\"Paragraph was moved. Click to jump to old location.\" href=\"#movedpara_1_0_lhs\">&#x26AB;</a></td>\n  <td class=\"diff-addedline\"><div><a name=\"movedpara_5_1_rhs\"></a>[[File:Multiprocessor System Featuring Global Data Multiplication.svg|thumb|<ins class=\"diffchange diffchange-inline\">left</ins>|upright=2|Multiprocessor System Featuring Global Data Multiplication]]</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-right\" title=\"Paragraph was moved. Click to jump to old location.\" href=\"#movedpara_3_1_lhs\">&#x26AB;</a></td>\n  <td class=\"diff-addedline\"><div><a name=\"movedpara_5_2_rhs\"></a>[[File:Multiprocessor System - Global Data Write-Broadcasting.svg|thumb|right|upright=1.8|Multiprocessor System Featuring Global Data Multiplation - Global Data Write-Broadcasting]]</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>{{clear}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== References ==</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== References ==</div></td>\n</tr>\n\n<!-- diff cache key enwiki:diff:wikidiff2:1.12:old-904395753:rev-904396518:1.10.0 -->\n`,
    "diff_from_0_to_797951879":`<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 1:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 1:</td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>Xinbenlv is passionated about Wikipedia and its mission. Xinbenlv's edit focus on [[Computer Science]] and [[History]]</div></td>\n</tr>\n`
  };

  beforeEach(() => {
    jest.setTimeout(60000);
    let _axios = require(`axios`);
    mwapi2 = new MwActionApiClient2(_axios);
  });

  test('should take a given revId without prevRevId and return diff content in HTML in the exact same output we got.', async () => {
    // This test will fail when MediaWiki change how diff is generating.
    let expectedHtml = testData["diff_from_904396518_to_904395753"]; 
    
    let wiki="enwiki";
    let fetchedHtml = await mwapi2.fetchDiff(wiki, 904396518);
   
    expect(fetchedHtml).toMatchHtml(expectedHtml);
  });

  test('should take a given revId with prevRevId and return diff content in HTML in the exact same output we got.', async () => {
    // This test will fail when MediaWiki change how diff is generating.
    let expectedHtml = testData["diff_from_904396518_to_904395753"]; 

    let wiki="enwiki";
    let fetchedHtml = await mwapi2.fetchDiff(wiki, 904396518, 904395753);

    expect(fetchedHtml).toMatchHtml(expectedHtml);
  });

  test('should handle a page creation', async () => {
    // This test will fail when MediaWiki change how diff is generating.
    let expectedHtml = testData["diff_from_0_to_797951879"]; 

    let wiki="enwiki";
    let revId = 797951879; // page creation;
    let fetchedHtml = await mwapi2.fetchDiff(wiki, revId);

    expect(fetchedHtml).toMatchHtml(expectedHtml);
  });

  test('should handle invalid revId', async () => {
    let wiki="enwiki";

    // {
    //   "error": {
    //     "code": "nosuchrevid",
    //     "info": "There is no revision with ID 11904395753.",
    //     "*": "See https://en.wikipedia.org/w/api.php for API usage. Subscribe to the mediawiki-api-announce mailing list at &lt;https://lists.wikimedia.org/mailman/listinfo/mediawiki-api-announce&gt; for notice of API deprecations and breaking changes."
    //   },
    //   "servedby": "mw1359"
    // }
    let invalidRevId = 123456789012345;
    await expect(mwapi2.fetchDiff(wiki, invalidRevId)).rejects.toThrow(/nosuchrevid/);
  });
});

