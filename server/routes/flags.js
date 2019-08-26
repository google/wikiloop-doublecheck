const { useOauth, isEmpty } = require('../common');

const useStiki = !isEmpty(process.env.STIKI_MYSQL);

module.exports = (req, res, next) => {
    res.send({
        useStiki: useStiki,
        useOauth: useOauth
    });
    req.visitor
        .event({ ec: "api", ea: "/" })
        .send();
};