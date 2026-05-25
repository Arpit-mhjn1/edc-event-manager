const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized. Invalid or expired token.' });
        }

        req.user = decoded; // { id, role, email }
        next();
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Authentication error' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ status: 'error', message: 'Forbidden. You do not have permission.' });
        }
        next();
    };
};

module.exports = {
    authenticate,
    authorize
};
