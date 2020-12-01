import { MwActionApiClient2 } from "~/shared/mwapi2";

let mwapi2: MwActionApiClient2;

/**
 * The test with real axio sending real HTTP requests. 
 * 
 * **!Note** This test requires a test environment with network connectivity and can be flaky.
 */
describe('MwActionApiClient2.fetchRevisionInfo with real axio', () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    let _axios = require(`axios`);
    mwapi2 = new MwActionApiClient2(_axios);
  });

  test('should return revision full information when given a valid revId', async () => {
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

  test('should return null without error if given a revId never exists', async () => {
    let wiki="enwiki";
    let info = await mwapi2.fetchRevisionInfo(wiki, 1234567890123456);
    expect(info).toBe(null);
  });

  test('should return revision full information if given a revId which is DELETED.', async () => {
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