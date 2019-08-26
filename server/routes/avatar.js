const Avatars = require('@dicebear/avatars').default;
const sprites = require('@dicebear/avatars-male-sprites').default;
let avatars = new Avatars(sprites({}));

module.exports = async (req, res) => {
    logger.debug(`avatar requested with seed`, req.params.seed);
    let svg = avatars.create(req.params.seed);
    res.send(svg);
    req.visitor
        .event({ ec: "api", ea: "/avatar/:seed" })
        .send();
}