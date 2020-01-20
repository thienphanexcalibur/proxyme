#!/usr/bin/env node
const inq = require('inquirer');
const minimist = require('minimist'); const fs = require('fs');
const path = require('path');
const proxyMe = require('./proxyme.js');
const chalk = require('chalk');
const commander = require('commander');

/* Dirty hack to get current npm version */
function getVersion() {
  return require(path.join(__dirname,'package.json')).version;
}

/* For purpose of displaying possible options when typing proxyme --help */
commander
  .option('--init', 'Init proxyme')
  .option('--publicPath', 'Set your proxyme public path, where to generate necessary files - default ./')
  .option('--proxyHost', 'Your proxy host - default 0.0.0.0')
  .option('--proxyPort', 'Your proxy port - RANDOM')
  .option('--debugHost', 'Your debug host - default 0.0.0.0')
  .option('--debugPort', 'Your debug port - default 2300')
  .option('--pac', 'Your PAC (Proxy Auto-Config) URL - default 6970')
  .option('--configPath', 'Your config path')
  .option('--profilePath', 'Your profile contain rules path')
  .option('--certDir', 'Your certificate directory - should be in ./certs')
  .version(getVersion())
  .parse(process.argv);

	/* CLI Arguments parsing */
const argsCLI = minimist(process.argv.slice(2));
if (argsCLI.debug) {
	console.log(argsCLI);
}

	/* Using minimist arguments parsing can append "_" key - we want out object clean */
delete argsCLI._;

	/* Set public path, can be overwritten through cli, default -  process.cwd() */
const publicPath = argsCLI.publicPath ||  process.cwd();
const certPath = argsCLI.certDir || path.resolve(publicPath, '.http-mitm-proxy/certs','ca.pem');

	/* Directories making */
if (!fs.existsSync(publicPath)) {
	fs.mkdirSync(publicPath);
}

let returnCertPath = path.resolve(process.cwd(), 'certs');
if (!fs.existsSync(returnCertPath)) {
  fs.mkdirSync(returnCertPath);
}

	/* Profiles Directory */
const profileDirPath = path.join(publicPath, 'profiles');

const defaultProfilePath = path.normalize(path.join(profileDirPath, 'default.json'));

	/* Configurations Directory */
const configDirPath = path.join(publicPath, 'config');

const defaultConfigPath = path.normalize(path.join(configDirPath, 'config.json'));

function init({publicPath, pac, proxyHost, proxyPort, debugHost, debugPort, certDir}) {
  // Check if profile directory path exists
  if (!fs.existsSync(profileDirPath)) {
    fs.mkdirSync(profileDirPath);
    fs.writeFileSync(defaultProfilePath, JSON.stringify({
      "rules":
        {
          "example.com": [
            {
              "somepath": [
                {},
                {
                  "host": "",
                  "port": null
                }
              ]
            },
            {
              "host": "",
              "port": null
            }
          ]
        }
    }, null, '\t'));
  }

  if (!fs.existsSync(configDirPath)) {
    fs.mkdirSync(configDirPath);
    fs.writeFileSync(defaultConfigPath, JSON.stringify({
      pac,
      proxyHost,
      proxyPort,
      debugHost,
      debugPort,
      publicPath,
      certDir
    }, null, '\t'));
  }
}

console.log(chalk.bgGreen.black('Simplyfing your development with PROXYME proxy server'));

function cli(args) {
  this.pac =  typeof args.pac === 'string' && args.pac;
  this.pacHost = typeof args.pacHost === 'string' && args.pacHost;
  this.pacPort = typeof args.pacPort === 'number' && args.pacPort;
  this.proxyHost = typeof args.proxyHost === 'string' && args.proxyHost;
  this.proxyPort = typeof args.proxyPort === 'number' && args.proxyPort;
  this._configPath = typeof args.configPath === 'string' &&  args.configPath;
  this._profilePath = typeof args.profilePath === 'string' && args.profilePath;
  this.debugHost = typeof args.debugHost === 'string' && args.debugHost;
  this.debugPort = typeof args.debugPort === 'number' && args.debugPort;
  this.rules = args.rules instanceof Array ? args.rules : [];
	this.certDir = typeof args.certDir === 'number' && args.certDir;
}

/**
 * @param {String} _path
 * Get configuration
 * (Static Method)
 */
cli.getConfig = function (_path) {
  return JSON.parse(fs.readFileSync(_path || defaultConfigPath));
}

/**
 *
 * @param {String} _path
 * TODO: Support multiple profiles at a time
 * Get profiles
 * (Static Method)
 */
cli.getProfiles = function (_path) {
  return JSON.parse(fs.readFileSync(_path || defaultProfilePath));
}

cli.getCertDir = function (_path) {
	return {certDir: _path}
}

/**
 * @param {String} configPath | Passed from CLI
 * @param {String} profilePath | Passed from CLI
 * (Static Method)
 */
cli.mergeArgs = function (configPath, profilePath, certPath) {
	// Merge down everything
  return Object.assign(this.getCertDir(certPath), this.getConfig(configPath), this.getProfiles(profilePath), argsCLI);
}

const questions = [];
  questions.push({
    type: 'input',
    name: 'proxyHost',
    message: 'Your proxy host:',
    default: '0.0.0.0'
  });

  questions.push({
    type: 'input',
    name: 'input',
    name: 'proxyPort',
    message: 'Your proxy port:',
		default: 6969
	});
  questions.push({
    type: 'input',
    name: 'pac',
    message: 'Your PAC server address:',
    default: ''
  });
  questions.push({
    type: 'input',
    name: 'debugHost',
    message: 'Your debug server host ?:',
    default: '0.0.0.0',
  });
  questions.push({
    type: 'input',
    name: 'debugPort',
    message: 'Your debug server port ?:',
    default: 2300
  });
  questions.push({
    type: 'input',
    name: 'certDir',
    message: 'Your certificate directories ?:',
    default: ''
  });

module.exports = (async () => {
  let answers = {};
  if (argsCLI.init) {
    answers = await inq.prompt(questions);
    init(answers);
    console.log('Your settings: ', {...answers});
    proxyMe(answers);
  } else {
		const finalArgs =
			argsCLI.configPath ?
				new cli(cli.mergeArgs(argsCLI.configPath, argsCLI.profilePath, argsCLI.certDir))
			: cli.mergeArgs(argsCLI.configPath, argsCLI.profilePath, certPath);
    const {proxyHost, proxyPort, pac, debugHost, debugPort, certDir} = finalArgs;
    console.log(`
		  Your PROXYME settings:
				PROXY HOST: ${proxyHost}
				PROXY PORT: ${proxyPort}
				PAC Address: ${pac}
				DEBUG HOST: ${debugHost}
				DEBUG PORT: ${debugPort}
				CERTIFICATE DIRECTORY: ${certDir}
    `)
    proxyMe(finalArgs);
  }
})();
