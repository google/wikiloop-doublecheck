const root = require('./root');
const { diff, diffWikiRevId } = require('./diff');
const recentChanges = require('./recentChanges');
const { ores, oresWikiRevId } = require('./ores');
const { revision, revisionWikiRevId } = require('./revision');
const { getInteraction, listInteractions, updateInteraction, interaction } = require('./interaction');
const { markedRevsCsv, markedCsv, markedRevs, marked } = require('./marked');
const leaderboard = require('./leaderboard');
const stats = require('./stats');
const avatar = require('./avatar');
const { latest, latestRevs } = require('./latest');
const flags = require('./flags');
const mediawiki = require('./mediawiki');
const version = require('./version');

module.exports = {
    root,
    diff,
    diffWikiRevId,
    recentChanges,
    ores,
    oresWikiRevId,
    revision,
    revisionWikiRevId,
    getInteraction,
    listInteractions,
    updateInteraction,
    interaction,
    markedRevsCsv,
    markedCsv,
    markedRevs,
    marked,
    leaderboard,
    stats,
    avatar,
    latest,
    latestRevs,
    flags,
    mediawiki,
    version,
}