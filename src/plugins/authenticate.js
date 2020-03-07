function applyStore(app, plugin) {
  if (plugin) {
    let auth;
    try {
      auth = require(plugin);

      app.use(async function(req, res, next) {
        if (req.session.isAuthenticated) {
          return next();
        }

        try {
          const info = await auth.authenticate(req, res);
          req.session = {
            uid: info.uid,
            role: info.role,
            name: info.name,
            isAuthenticated: true
          };
          next();
        } catch (err) {
          next(err);
        }
      });
    } catch (err) {
      throw new Error('Failed to apply authentication plugin: ' + err.message);
    }
  }
}

module.exports = applyStore;
