#!/usr/bin/env node
/* eslint-disable no-sync */
/* global process */

const inq = require('inquirer');
const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const proxyMe = require('./proxyme.js');
const chalk = require('chalk');
const commander = require('commander');


commander
  .option('-i, --init', 'Init proxyme')
  .option('-path, --publicPath', 'set your proxyme public path, where to generate necessary files - default ./')
  .option('-h , --proxyHost', 'your proxy host - default 127.0.0.1')
  .option('-p, --proxyPort', 'your proxy port - default RANDOM')
  .option('-H, --debugHost', 'your debug host - default 127.0.0.1')
  .option('-P, --debugPort', 'your debug port - default RANDOM + 1')
  .option('--pacPort', 'your PAC (Proxy Auto-Config) port - default RANDOM + 2')
  .option('--config', 'your config path')
  .option('--profile', 'your profile contain rules path')
  .version('1.3.5')
  .parse(process.argv);


const argsCLI = minimist(process.argv.slice(2));
delete argsCLI._;

// Set public path, default './'
const publicPath = path.resolve(argsCLI.publicPath ? argsCLI.publicPath : './');

// If not exist create one
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath);
}
const profileDirPath = path.resolve(path.join(publicPath, 'profiles'));
const defaultProfilePath = path.resolve(path.join(profileDirPath, 'default.js'));
const configDirPath = path.resolve(path.join(publicPath, 'config'));
const defaultConfigPath = path.resolve(path.join(configDirPath, 'config.json'));

// eslint-disable-next-line no-shadow
function init({ publicPath, pacPort, proxyHost, proxyPort, debugHost, debugPort }) {

  /*
   * Set default profile path and
   * Check if dir exists
   */

  if (!fs.existsSync(profileDirPath)) {
    fs.mkdirSync(profileDirPath);
  }
  if (!fs.existsSync(defaultProfilePath)) {
    const rules = fs.readFileSync('./profiles/default.js');
    fs.writeFileSync(defaultConfigPath, rules);
  }

  if (!fs.existsSync(configDirPath)) {
    fs.mkdirSync(configDirPath);
  }
  if (!fs.existsSync(defaultConfigPath)) {
    fs.writeFileSync(defaultConfigPath, JSON.stringify({
      pacPort,
      proxyHost,
      proxyPort,
      debugHost,
      debugPort,
      publicPath
    }));
  }
}

console.log(chalk.bgWhite.black('A CLI to create a proxy with PAC script'));

function cli(args) {
  this.pacPort = typeof args.pacPort === 'number' && args.pacPort;
  this.proxyHost = typeof args.proxyHost === 'string' && args.proxyHost;
  this.proxyPort = typeof args.proxyPort === 'number' && args.proxyPort;
  this._configPath = typeof args.configPath === 'string' && args.configPath;
  this._profilePath = typeof args.profilePath === 'string' && args.profilePath;
  this.debugHost = typeof args.debugHost === 'string' && args.debugHost;
  this.debugPort = typeof args.debugPort === 'number' && args.debugPort;
  this.rules = args.rules instanceof Array ? args.rules : [];
}

/**
 * @param {String} _path
 * Get configuration
 * (Static Method)
 */

cli.getConfig = function (_path = '') {
  return JSON.parse(fs.readFileSync(_path ? _path : defaultConfigPath));
}

/**
 *
 * @param {String} _path
 * TODO: Support multiple profiles at a time
 * Get profiles
 * (Static Method)
 */

cli.getProfiles = function (_path = '') {
  return require(_path ? _path : defaultProfilePath);
}

/**
 * @param {String} configPath | Passed from CLI
 * @param {String} profilePath | Passed from CLI
 * (Static Method)
 */

cli.mergeArgs = function (configPath = '', profilePath = '') {
  return Object.assign(this.getConfig(configPath), this.getProfiles(profilePath), argsCLI);
}

const randomPort = Math.floor(4096 + (Math.random() * 16384));
const questions = [];
  questions.push({
    type: 'input',
    name: 'proxyHost',
    message: 'Your proxy host:',
    default: '0.0.0.0'
  });

  questions.push({
    type: 'input',
    name: 'proxyPort',
    message: 'Your proxy port:',
    default: randomPort
  });
  questions.push({
    type: 'input',
    name: 'pacPort',
    message: 'Your PAC server port:',
    default: randomPort + 2
  });
  questions.push({
    type: 'input',
    name: 'debugHost',
    message: 'Your debug server host ?:',
    default: '0.0.0.0'
  });
  questions.push({
    type: 'input',
    name: 'debugPort',
    message: 'Your debug server port ?:',
    default: randomPort + 1
  });

module.exports = (async () => {
  let answers = {};
  if (argsCLI.init) {
    answers = await inq.prompt(questions);
    init(answers);
    console.log('Your settings: ', { ...answers });
    proxyMe(answers);
  } else {
    const finalArgs = argsCLI.configPath ? new cli(cli.mergeArgs(argsCLI.configPath, argsCLI.profilePath)) : cli.mergeArgs(null, argsCLI.profilePath);
    console.log('Your settings', { ...finalArgs });
    proxyMe(finalArgs);
  }
})();
