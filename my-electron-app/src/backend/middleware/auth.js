const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'No authentication token provided' 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                error: 'Invalid authentication token' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ 
                error: 'User not found' 
            });
        }

        if (!user.isActive) {
            return res.status(401).json({ 
                error: 'Account is deactivated' 
            });
        }

        // Attach user and token to request
        req.user = user;
        req.token = token;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid authentication token' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Authentication token has expired' 
            });
        }
        
        res.status(401).json({ 
            error: 'Please authenticate' 
        });
    }
};

module.exports = auth;
