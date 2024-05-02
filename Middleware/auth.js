const jwt = require('jsonwebtoken');
const config = require('../config/config');

const verifyToken = async (req, res, next) => {

    try {
        const token = req.body.token || req.query.token || req.headers['authorization'];
        if (!token) res.status(400).send({ success: false, msg: "A Token is Requried for Authorization" })
        jwt.verify(token, config.secret_jwt, (err, decoded) => {
            if (err) res.status(400).send({ success: false, msg: "Token is not valid please enter a valid Token" });
            req.user = decoded
        })

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }
    return next()
}

module.exports = {verifyToken}