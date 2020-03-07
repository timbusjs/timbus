const pino = require('pino');

let level = process.env.TIMBUS_LOG_LEVE;
if (!level) {
  level = 'info';
}
if (process.env.TIMBUS_LOG_DISABLE) {
  level = 'silent';
}

const logger = pino({
  name: 'timbus',
  level
});

module.exports = logger;
