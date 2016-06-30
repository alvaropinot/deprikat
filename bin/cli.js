'use strict';

const program = require('commander');
const fs = require('fs');
const analyze = require('../lib/analyze');

function cli () {

program
  .version('0.0.1')
  .usage('[options] <dir>')
  .option('-s, --scan <file>', 'Directory or file', scanCommand);


  //start
  program.parse(process.argv);

function scanCommand (dir) {
  scan(dir.length ? dir[0] : './'); //default to current folder
}

  //
  /**
   * Analyze and process a file
   * @param  {string}    filename
   * @return {void}      stdout
   */
  function scanFile (file) {
    let deprecateds = analyze(file, {});
  	stdOut(deprecateds);
  }

  /**
   * Print result to stdout
   * @param  {object} out The return from analyzer()
   * @return {void}     print out results
   */
  function stdOut (out) {
    console.log(out);
  }

  /**
   * Scan a file or folder
   * @param  {string} path The full path to a file or folder
   * @return {void}      stdout
   */
  function scan (path){
  	let stats = fs.statSync(path);

  	if (stats.isFile()) {
  		console.log('Analyzing file: ' + path.replace('//', '/'));
  		scanFile(path);
  	}
  	else if (stats.isDirectory()){
  		console.log('=== ' + path + ' >>>');
  	 	let files = fs.readdirSync(path);

  		if (files.length) {
  			files.forEach(function (file){
  				let filename = path + '/' + file;
  				scan(filename);
  			});
  			console.log('<<< ' + path + ' ===');
  		}
  	}
  }
}

module.exports = cli;
