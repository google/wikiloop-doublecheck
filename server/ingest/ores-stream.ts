import {logger} from "@/server/common";
const EventSource = require('eventsource');

export class OresStream {

  private eventSource:EventSource;
  private wiki:string;
  public constructor(wiki) {
    this.wiki = wiki;
  }
  public filter(data) {
    let matchWiki = data.database === this.wiki;
    let matchNamespace = data.page_namespace == 0;
    let isDamaging = data.scores?.damaging?.prediction == 'true';
    let isBadfaith = data.scores?.goodfaith?.prediction == 'false';
    return matchWiki && matchNamespace && (isDamaging || isBadfaith);
  }

  public subscribe() {
    const url = 'https://stream.wikimedia.org/v2/stream/revision-score';

    logger.debug(`Connecting to EventStreams at ${url}`);

    const eventSource = new EventSource(url);
    eventSource.onopen = (event) => {
      logger.debug(`Stream connected: ${url}`);
    };

    eventSource.onerror = (event) => {
      logger.error(`Stream error: ${url}`, event);
    };

    eventSource.onmessage = async (event) => {
      let json = JSON.parse(event.data);
      if (this.filter(json)) {
        logger.debug(`rev-score`, JSON.stringify(json, null, 2));
        const mongoose = require('mongoose');
        const wiki = json.database;
        const title = json.page_title;
        const pageId = json.page_id;
        const revId = json.rev_id;
        await mongoose.connection.db.collection(`WatchCollection_ORES`).insertOne({
          _id: `${wiki}:${revId}`,
          wiki: wiki,
          revIds: [revId],
          pageId: pageId,
          title: title,
          timestamp: Math.floor(new Date().getTime() / 1000)
        }, {upsert:true});
      }
    };

    this.eventSource = eventSource;
  }
}
