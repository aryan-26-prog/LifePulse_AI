const User = require("../models/User");

const allowRoles = (...roles) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        message: "Access Denied: Insufficient Permissions"
      });
    }

    next();
  };
};

module.exports = allowRoles;
