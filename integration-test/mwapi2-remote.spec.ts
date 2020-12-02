import { MwActionApiClient2 } from "~/shared/mwapi2";

let mwapi2: MwActionApiClient2;

/**
 * The test with real axio sending real HTTP requests to fetch revision info
 * 
 * **!Note** This test requires a test environment with network connectivity and can be flaky.
 */
describe('MwActionApiClient2.fetchRevisionInfo with real axio', () => {
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
});

/**
 * The test with real axio sending real HTTP requests to fetch revision info
 * 
 * **!Note** This test requires a test environment with network connectivity and can be flaky.
 */
describe('MwActionApiClient2.fetchDiff with real axio', () => {
  let HtmlDiffer = require('html-differ').HtmlDiffer;
  let options = {
      ignoreWhitespaces: true,
      ignoreComments: true,
      ignoreEndTags: true,
      ignoreDuplicateAttributes: false
  };

  let htmlDiffer = new HtmlDiffer(options);

  beforeEach(() => {
    jest.setTimeout(60000);
    let _axios = require(`axios`);
    mwapi2 = new MwActionApiClient2(_axios);
  });

  test('should take a given revId without prevRevId and return diff content in HTML in the exact same output we got.', async () => {

    // This test will fail when MediaWiki change how diff is generating.
    let expectedHtml = `<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 93:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 93:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== Multiprocessor system featuring global data multiplication ==</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== Multiprocessor system featuring global data multiplication ==</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-left\" title=\"Paragraph was moved. Click to jump to new location.\" href=\"#movedpara_5_1_rhs\">&#x26AB;</a></td>\n  <td class=\"diff-deletedline\"><div><a name=\"movedpara_1_0_lhs\"></a>[[File:Multiprocessor System Featuring Global Data Multiplication.svg|thumb|<del class=\"diffchange diffchange-inline\">right</del>|upright=2|Multiprocessor System Featuring Global Data Multiplication]]</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>An intermediate approach of the two previous architectures is having common resources and local resources such as local memories (LM) in each processor. </div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>An intermediate approach of the two previous architectures is having common resources and local resources such as local memories (LM) in each processor. </div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 100:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 98:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>This system (patented F. Zulian &lt;ref&gt;{{cite web|url=https://patents.google.com/patent/US4928224A/en|title=Multiprocessor system featuring global data multiplation|publisher=}}&lt;/ref&gt;) used on the DPX/2 300 Unix based system (Bull Hn Information Systems Italia (ex Honeywell)) &lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/unix_and_bull.htm|title=UNIX and Bull|website=www.feb-patrimoine.com}}&lt;/ref&gt;&lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/bull_dpx2.htm|title=Bull DPX|website=www.feb-patrimoine.com}}&lt;/ref&gt;, is a mix of tightly coupled and loose coupled systems and takes all the advancements of these two architectures.</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>This system (patented F. Zulian &lt;ref&gt;{{cite web|url=https://patents.google.com/patent/US4928224A/en|title=Multiprocessor system featuring global data multiplation|publisher=}}&lt;/ref&gt;) used on the DPX/2 300 Unix based system (Bull Hn Information Systems Italia (ex Honeywell)) &lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/unix_and_bull.htm|title=UNIX and Bull|website=www.feb-patrimoine.com}}&lt;/ref&gt;&lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/bull_dpx2.htm|title=Bull DPX|website=www.feb-patrimoine.com}}&lt;/ref&gt;, is a mix of tightly coupled and loose coupled systems and takes all the advancements of these two architectures.</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-left\" title=\"Paragraph was moved. Click to jump to new location.\" href=\"#movedpara_5_2_rhs\">&#x26AB;</a></td>\n  <td class=\"diff-deletedline\"><div><a name=\"movedpara_3_1_lhs\"></a>[[File:Multiprocessor System - Global Data Write-Broadcasting.svg|thumb|right|upright=1.8|Multiprocessor System Featuring Global Data Multiplation - Global Data Write-Broadcasting]]</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>The Local memory is divided into two sectors, global data (GD) and local data (LD).</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>The Local memory is divided into two sectors, global data (GD) and local data (LD).</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 110:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 106:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>Local data can be exchanged like in loosely coupled system via [[message-passing]]</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>Local data can be exchanged like in loosely coupled system via [[message-passing]]</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-right\" title=\"Paragraph was moved. Click to jump to old location.\" href=\"#movedpara_1_0_lhs\">&#x26AB;</a></td>\n  <td class=\"diff-addedline\"><div><a name=\"movedpara_5_1_rhs\"></a>[[File:Multiprocessor System Featuring Global Data Multiplication.svg|thumb|<ins class=\"diffchange diffchange-inline\">left</ins>|upright=2|Multiprocessor System Featuring Global Data Multiplication]]</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-right\" title=\"Paragraph was moved. Click to jump to old location.\" href=\"#movedpara_3_1_lhs\">&#x26AB;</a></td>\n  <td class=\"diff-addedline\"><div><a name=\"movedpara_5_2_rhs\"></a>[[File:Multiprocessor System - Global Data Write-Broadcasting.svg|thumb|right|upright=1.8|Multiprocessor System Featuring Global Data Multiplation - Global Data Write-Broadcasting]]</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>{{clear}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== References ==</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== References ==</div></td>\n</tr>\n\n<!-- diff cache key enwiki:diff:wikidiff2:1.12:old-904395753:rev-904396518:1.10.0 -->\n`; 
    
    let wiki="enwiki";
    let fetchedHtml = await mwapi2.fetchDiff(wiki, 904396518);
   
    let expectedVsFetched = htmlDiffer.diffHtml(fetchedHtml, expectedHtml);
    let isEqual = htmlDiffer.isEqual(fetchedHtml, expectedHtml);

    try {
      expect(isEqual).toBe(true);
    } catch(err) {
      throw new Error(`Diff doesn't match, the diff is${JSON.stringify(expectedVsFetched, null, 2)}`);
    }
  });

  test('should take a given revId with prevRevId and return diff content in HTML in the exact same output we got.', async () => {
    // This test will fail when MediaWiki change how diff is generating.
    let expectedHtml = `<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 93:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 93:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== Multiprocessor system featuring global data multiplication ==</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== Multiprocessor system featuring global data multiplication ==</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-left\" title=\"Paragraph was moved. Click to jump to new location.\" href=\"#movedpara_5_1_rhs\">&#x26AB;</a></td>\n  <td class=\"diff-deletedline\"><div><a name=\"movedpara_1_0_lhs\"></a>[[File:Multiprocessor System Featuring Global Data Multiplication.svg|thumb|<del class=\"diffchange diffchange-inline\">right</del>|upright=2|Multiprocessor System Featuring Global Data Multiplication]]</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>An intermediate approach of the two previous architectures is having common resources and local resources such as local memories (LM) in each processor. </div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>An intermediate approach of the two previous architectures is having common resources and local resources such as local memories (LM) in each processor. </div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 100:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 98:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>This system (patented F. Zulian &lt;ref&gt;{{cite web|url=https://patents.google.com/patent/US4928224A/en|title=Multiprocessor system featuring global data multiplation|publisher=}}&lt;/ref&gt;) used on the DPX/2 300 Unix based system (Bull Hn Information Systems Italia (ex Honeywell)) &lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/unix_and_bull.htm|title=UNIX and Bull|website=www.feb-patrimoine.com}}&lt;/ref&gt;&lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/bull_dpx2.htm|title=Bull DPX|website=www.feb-patrimoine.com}}&lt;/ref&gt;, is a mix of tightly coupled and loose coupled systems and takes all the advancements of these two architectures.</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>This system (patented F. Zulian &lt;ref&gt;{{cite web|url=https://patents.google.com/patent/US4928224A/en|title=Multiprocessor system featuring global data multiplation|publisher=}}&lt;/ref&gt;) used on the DPX/2 300 Unix based system (Bull Hn Information Systems Italia (ex Honeywell)) &lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/unix_and_bull.htm|title=UNIX and Bull|website=www.feb-patrimoine.com}}&lt;/ref&gt;&lt;ref&gt;{{cite web|url=http://www.feb-patrimoine.com/english/bull_dpx2.htm|title=Bull DPX|website=www.feb-patrimoine.com}}&lt;/ref&gt;, is a mix of tightly coupled and loose coupled systems and takes all the advancements of these two architectures.</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">−</td>\n  <td class=\"diff-deletedline\"></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-left\" title=\"Paragraph was moved. Click to jump to new location.\" href=\"#movedpara_5_2_rhs\">&#x26AB;</a></td>\n  <td class=\"diff-deletedline\"><div><a name=\"movedpara_3_1_lhs\"></a>[[File:Multiprocessor System - Global Data Write-Broadcasting.svg|thumb|right|upright=1.8|Multiprocessor System Featuring Global Data Multiplation - Global Data Write-Broadcasting]]</div></td>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>The Local memory is divided into two sectors, global data (GD) and local data (LD).</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>The Local memory is divided into two sectors, global data (GD) and local data (LD).</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 110:</td>\n  <td colspan=\"2\" class=\"diff-lineno\">Line 106:</td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>Local data can be exchanged like in loosely coupled system via [[message-passing]]</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>Local data can be exchanged like in loosely coupled system via [[message-passing]]</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-right\" title=\"Paragraph was moved. Click to jump to old location.\" href=\"#movedpara_1_0_lhs\">&#x26AB;</a></td>\n  <td class=\"diff-addedline\"><div><a name=\"movedpara_5_1_rhs\"></a>[[File:Multiprocessor System Featuring Global Data Multiplication.svg|thumb|<ins class=\"diffchange diffchange-inline\">left</ins>|upright=2|Multiprocessor System Featuring Global Data Multiplication]]</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\"><a class=\"mw-diff-movedpara-right\" title=\"Paragraph was moved. Click to jump to old location.\" href=\"#movedpara_3_1_lhs\">&#x26AB;</a></td>\n  <td class=\"diff-addedline\"><div><a name=\"movedpara_5_2_rhs\"></a>[[File:Multiprocessor System - Global Data Write-Broadcasting.svg|thumb|right|upright=1.8|Multiprocessor System Featuring Global Data Multiplation - Global Data Write-Broadcasting]]</div></td>\n</tr>\n<tr>\n  <td colspan=\"2\" class=\"diff-empty\">&#160;</td>\n  <td class=\"diff-marker\">+</td>\n  <td class=\"diff-addedline\"><div>{{clear}}</div></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"></td>\n</tr>\n<tr>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== References ==</div></td>\n  <td class=\"diff-marker\">&#160;</td>\n  <td class=\"diff-context\"><div>== References ==</div></td>\n</tr>\n\n<!-- diff cache key enwiki:diff:wikidiff2:1.12:old-904395753:rev-904396518:1.10.0 -->\n`; 

    let wiki="enwiki";
    let fetchedHtml = await mwapi2.fetchDiff(wiki, 904396518, 904395753);

    let expectedVsFetched = htmlDiffer.diffHtml(fetchedHtml, expectedHtml);
    let isEqual = htmlDiffer.isEqual(fetchedHtml, expectedHtml);

    try {
      expect(isEqual).toBe(true);
    } catch(err) {
      throw new Error(`Diff doesn't match, the diff is${JSON.stringify(expectedVsFetched, null, 2)}`);
    }
  });
});

