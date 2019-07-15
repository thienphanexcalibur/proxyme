const inq = require('inquirer');
const minimist = require('minimist');
const yamlParser = require('js-yaml');
const fs = require('fs');
const isEmpty = require('lodash/isEmpty');
const proxyMe = require('./index.js');

let publicProfilePath = './profiles';
const defaultProfilePath =  publicProfilePath + '/default.yaml';


function getProfileData(profilePath) {
  return yamlParser.safeLoad(fs.readFileSync(profilePath || defaultProfilePath, 'utf-8'));
}
const argsCLI = minimist(process.argv.slice(2));
delete argsCLI._;
console.log('A CLI to create a proxy with PAC script');

function argsSchema(args) {
  this.pac =  args.pac;
  this.pacHost = args.pacHost || null;
  this.pacPort = args.pacPort || null;
  this.proxyHost = args.proxyHost || '0.0.0.0';
  this.proxyPort = args.proxyPort || 6789;
  this.profilePath = args.profilePath || defaultProfilePath;
}

// Merge arguments passed from CLI to arguments schema

const finalArgs = new argsSchema((isEmpty(argsCLI) ? false : argsCLI) || getProfileData(argsCLI.profilePath));

const {
  pac,
  pacHost,
  pacPort,
  proxyHost,
  proxyPort,
  profilePath
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
