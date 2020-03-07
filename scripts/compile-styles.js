const stylis = require('stylis');
const fs = require('fs');

const [bin, script, ...args] = process.argv;

if (args.length !== 2) {
  console.log('usage: npm run style <input> <output>');
  process.exit(0);
}

fs.readFile(args[0], 'utf8', function(err, text) {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  const output = stylis('', text);
  fs.writeFile(args[1], output, 'utf8', function(err) {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
  });
});
