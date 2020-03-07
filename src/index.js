const http = require('http');
const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const uuid = require('uuid');
const plugins = require('./plugins');
const routes = require('./routes');
const logger = require('./util/logger');

function run(config) {
  const app = express();

  // Configure handlebars
  const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs'
  });

  // Configure the views
  app.engine('hbs', hbs.engine);
  app.set('view engine', 'hbs');
  app.set('views', path.join(path.basename(__dirname), 'views'));

  // Setup sessions
  if (!config.session.secret) throw new Error('Missing session secret');
  app.use(
    session({
      name: config.session.name,
      secret: config.session.secret,
      genid: function() {
        return uuid();
      },
      resave: true,
      saveUninitialized: false
    })
  );

  // Apply the plugins
  plugins.applyAuth(app, config.plugins.auth);
  plugins.applyStore(app, config.plugins.store);

  // Add our routes
  app.use(routes.home(config));
  app.use(routes.submissions(config));
  app.use('/api', routes.api(config));

  // Add static file serving
  app.use(express.static(path.join(__dirname, 'public')));

  // Add an error handler
  app.use(function(err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
    const context = {
      requestUrl: req.url,
      message: err.message,
      stack: err.stack
    };

    res.render('error', context);
  });

  return new Promise((resolve, reject) => {
    try {
      const server = http.createServer(app);

      server.on('error', err => {
        logger.error(`Unhandled error: ${err.message}`);
        logger.error('Closing Timbus Server');
        server.close();
        reject(err);
      });

      process.on('SIGINT', () => {
        logger.info('Closing Timbus Server');
        server.close();
        resolve();
      });

      server.listen(config.port, () => {
        logger.info('Timbus Server is listening on port ' + config.port);
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  run
};
