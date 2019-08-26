module.exports = (req, res, next) => {
    var packageson = require('./../../package.json');
    res.send(packageson.version);
    req.visitor
        .event({ ec: "api", ea: "/" })
        .send();
}