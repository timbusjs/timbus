const nfs = require('fs');
const path = require('path');
const util = require('util');
const logger = require('../util/logger');

const fs = {
  readFile: util.promisify(nfs.readFile)
};

async function applyAuth(app, config) {
  if (config.plugins.auth) {
    let auth;
    try {
      if (typeof config.plugins.auth === 'object') {
        auth = await require(config.plugins.auth.name)(logger, config.plugins.auth);
      } else {
        auth = await require(config.plugins.auth)(logger, null);
      }

      app.use(async function(req, res, next) {
        if (req.session.isAuthenticated) {
          return next();
        }

        try {
          const result = await auth.authenticate(req);
          switch (result.type) {
            case 'success':
              const userPath = path.join(config.webRoot, 'data', 'users.json');
              const users = JSON.parse(await fs.readFile(userPath));
              const user = users.filter(u => u.uid === result.uid);
              if (user.length === 0) {
                return res.render('401', { hideHeader: true });
              }
              const { uid, role, name } = user[0];
              req.session = {
                uid,
                role,
                name,
                isAuthenticated: true
              };
              return req.session.save(err => {
                if (err) return next(err);
                res.redirect('/');
              });

            case 'redirect':
              return res.redirect(result.url);

            case 'unauthorized':
              return res.render('401', { hideHeader: true });

            default:
              return next(new Error(`Invalid type returned from authentication: "${result.type}"`));
          }
        } catch (err) {
          next(err);
        }
      });
    } catch (err) {
      throw new Error('Failed to apply authentication plugin: ' + err.message);
    }
  } else {
    throw new Error('You must supply an authentication plugin');
  }
}

module.exports = applyAuth;
