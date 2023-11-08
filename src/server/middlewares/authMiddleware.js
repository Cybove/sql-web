const jwt = require('jsonwebtoken');
const jwtSecret = 'secret';
const cookieParser = require('cookie-parser');

const authenticate = (req, res, next) => {
    cookieParser()(req, res, () => {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'Authentication failed.' });
        }

        jwt.verify(token, jwtSecret, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Authentication failed.' });
            }
            req.userId = decoded.id;
            next();
        });
    });
};

module.exports = { authenticate };
