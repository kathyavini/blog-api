// Middleware to run after passport jwt authentication on admin-only routes
const checkIsAdmin = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

const checkIsAuthor = (req, res, next) => {
  if (!req.user.author) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

module.exports = { checkIsAdmin, checkIsAuthor };
