function applyStore(app, plugin) {
  if (plugin) {
    let store;
    try {
      store = require(plugin);

      app.use(function(req, res, next) {
        req.store = store;
        next();
      });
    } catch (err) {
      throw new Error('Failed to apply store plugin: ' + err.message);
    }
  } else {
    throw new Error('You must supply a store plugin');
  }
}

module.exports = applyStore;
