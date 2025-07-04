import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const restrictToRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      console.log("Restricting access to roles:", allowedRoles);
      const token = req.headers.token;
      console.log("Token received:", token);
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
      const user = await User.findById(decoded.id).select('role _id');
      console.log("User found:", user);
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: `Access denied. Allowed roles: ${allowedRoles.join(', ')}` });
      }
      
      req.userId = user._id;
      req.userRole = user.role;
      
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

export default restrictToRoles;
