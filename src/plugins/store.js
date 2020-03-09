const path = require('path');
const logger = require('../util/logger');

async function applyStore(app, config) {
  if (config.plugins.store) {
    let store;
    try {
      if (typeof config.plugin.store === 'object') {
        store = await require(config.plugins.store.name)(
          logger,
          path.join(config.webRoot, 'data'),
          config.plugins.store
        );
      } else {
        store = await require(config.plugins.store)(logger, path.join(config.webRoot, 'data'), null);
      }

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
