const Avatars = require('@dicebear/avatars').default;
const sprites = require('@dicebear/avatars-male-sprites').default;
const avatars = new Avatars(sprites({}));
const { logger } = require('../common');

module.exports = async (req, res) => {
    logger.debug(`avatar requested with seed`, req.params.seed);
    let svg = avatars.create(req.params.seed);
    res.send(svg);
    req.visitor
        .event({ ec: "api", ea: "/avatar/:seed" })
        .send();
}