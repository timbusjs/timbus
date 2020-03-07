const fs = require('fs');
const util = require('util');
const command = require('commander');
const timbus = require('../src');

const program = new command.Command();

program
  .version('1.0.0', '-v, --version')
  .option('-c, --config  <file>', 'The path to the configuration file')
  .option('-s, --store   <plugin>', 'The store plugin to use')
  .option('-a, --auth    <plugin>', 'The authentication plugin to use')
  .option('-t, --subtext <text>', 'The text to display in the header below "Assignment Submissions"');

program.parse(process.argv);

(async function(options) {
  let configFromFile = {};
  if (options.config) {
    try {
      configFromFile = JSON.parse(await util.promisify(fs.readFile)(options.config, 'utf8'));
    } catch (err) {
      console.error(`Failed to read configuration file "${options.config}": ${err.message}`);
      process.exit(1);
    }
  }

  const config = {
    port: process.env.TIMBUS_PORT || maybeGet(configFromFile, ['port']) || options.port || 8627,
    plugins: {
      store: process.env.TIMBUS_PLUGIN_STORE || maybeGet(configFromFile, ['plugins', 'store']) || options.store || null,
      auth: process.env.TIMBUS_PLUGIN_AUTH || maybeGet(configFromFile, ['plugins', 'auth']) || options.auth || null
    },
    session: {
      name: process.env.TIMBUS_SESSION_NAME || maybeGet(configFromFile, ['session', 'name']) || 'timbus-session',
      secret: process.env.TIMBUS_SESSION_SECRET
    },
    webRoot: process.env.TIMBUS_UPLOAD_ROOT || maybeGet(configFromFile, ['uploadRoot']) || process.cwd(),
    view: {
      subtext: process.env.TIMBUS_VIEW_SUBTEXT || maybeGet(configFromFile, ['view', 'subtext']) || options.subtext || ''
    }
  };

  try {
    await timbus.run(config);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})(program.opts());

function maybeGet(obj, props) {
  let val = obj;
  for (let p of props) {
    if (val[p]) val = val[p];
    else return undefined;
  }
  return val;
}
