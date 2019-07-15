const inq = require('inquirer');
const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const isEmpty = require('lodash/isEmpty');
const proxyMe = require('./proxyme.js');

let publicPath = './';

const profilePath =  publicPath + 'profiles';
const defaultProfilePath = path.normalize(path.join(__dirname, profilePath, 'default.json'));

const configPath = publicPath + 'config';
const defaultConfigPath = path.normalize(path.join(__dirname, configPath, 'config.json'));

console.log(defaultConfigPath);
console.log(defaultProfilePath);


const argsCLI = minimist(process.argv.slice(2));
delete argsCLI._;

console.log('A CLI to create a proxy with PAC script');

function cli(args) {
  this.pac =  typeof args.pac === 'string' ? args.pac : null;
  this.pacHost = typeof args.pacHost === 'string' ? args.pacHost : null;
  this.pacPort = typeof args.pacPort === 'number' ? args.pacPort : null;
  this.proxyHost = typeof args.proxyHost === 'string' ? args.proxyHost : '0.0.0.0';
  this.proxyPort = typeof args.proxyPort === 'number' ? args.proxyPort : 6969;
  this._configPath = typeof args.configPath === 'string' ? args.configPath : defaultConfigPath;
  this._profilePath = typeof args.profilePath === 'string' ? args.profilePath : defaultProfilePath;
  this.debugHost = typeof args.debugHost === 'string' ? args.debugHost : '0.0.0.0';
  this.debugPort = typeof args.debugPort === 'number' ? args.debugPort : 2300;
  this.rules = args.rules instanceof Object ? args.rules : {};
}

/**
 * @param {String} _path
 * Get configuration
 * (Static Method)
 */
cli.getConfig = function (_path = '') {
  return JSON.parse(fs.readFileSync(_path ? path.join(__dirname, configPath, _path) : defaultProfilePath));
}

/**
 *
 * @param {String} _path
 * TODO: Support multiple profiles at a time
 * Get profiles
 * (Static Method)
 */
cli.getProfiles = function (_path = '') {
  return JSON.parse(fs.readFileSync(_path ? path.join(__dirname, profilePath, _path) : defaultProfilePath));
}

/**
 * @param {String} configPath | Passed from CLI
 * @param {String} profilePath | Passed from CLI
 * (Static Method)
 */
cli.mergeArgs = function (configPath = '', profilePath = '') {
  return Object.assign(this.getConfig(configPath), this.getProfiles(profilePath), argsCLI);
}


// Merge arguments passed from CLI to arguments schema
const condition = !!(argsCLI.profilePath && argsCLI.configPath);

const finalArgs = new cli(cli.mergeArgs(argsCLI.configPath, argsCLI.profilePath));

const {
  pac,
  pacHost,
  pacPort,
  proxyHost,
  proxyPort,
  _profilePath,
  debugHost,
  debugPort
} = finalArgs

const questions = [];
  if (!profilePath) {
  questions.push({
    type: 'confirm',
    name: 'proxy',
    message: 'Do you have proxy enable?',
    default: false
  });
  questions.push({
     type: 'input',
     name: 'pac',
     message: 'Your PAC server address:',
     default: pac
   })
  questions.push({
    type: 'input',
    name: 'profiles',
    message: 'Proxy profiles: (path: profile.yml)',
    default: profilePath
  });
  }

module.exports = (async () => {
  const answers = await inq.prompt(questions);
  proxyMe(finalArgs);
})();
