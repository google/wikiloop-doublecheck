const root = (req, res, next) => {
    res.send('API root');
    req.visitor
        .event({ ec: "api", ea: "/" })
        .send();
};
module.exports = {
    root
};