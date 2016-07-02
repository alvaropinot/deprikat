'use strict';

const program = require('commander');
const fs = require('fs');
const analyze = require('../lib/analyze');
const config = require('../package.json');

/**
 * Client
 */
function cli () {
  program
    .version(config.version)
    .usage('[options] <dir>')
    .option('-s, --scan <file>', 'Directory or file', scanCommand);

  // start
  program.parse(process.argv);

  /**
   * scanCommand callback
   * @param  {string} dir directory to read in
   */
  function scanCommand (dir) {
    scan(dir); // default to current folder
  }

  /**
   * Analyze and process a file
   * @param  {string} file path to file
   */
  function scanFile (file) {
    let deprecateds = analyze(file, {}).deprecatedFunctionsNames;
    stdOut(deprecateds);
  }

  /**
   * Print result to stdout
   * @param  {object} out Array return from analyzer()
   * @return {object} console.log output
   */
  function stdOut (out) {
    return out.forEach((x, index) => console.log((index + 1) + '- ' + x));
  }

  /**
   * Scan a file or folder
   * @param  {string} path The full path to a file or folder
   */
  function scan (path) {
    let stats = fs.statSync(path);

    if (stats.isFile()) {
      console.log('Analyzing file: ' + path.replace('//', '/'));
      scanFile(path);
    } else {
      console.log('=== ' + path + ' >>>');
      let files = fs.readdirSync(path);

      files.forEach(file => {
        let filename = path + '/' + file;
        scan(filename);
      });
      console.log('<<< ' + path + ' ===');
    }
  }
}

module.exports = cli;
