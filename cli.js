const inq = require('inquirer');
const minimist = require('minimist');
const yamlParser = require('js-yaml');
const fs = require('fs');
const isEmpty = require('lodash/isEmpty');
const proxyMe = require('./index.js');
const profilePath = './profiles';
const profileDoc = yamlParser.safeLoad(fs.readFileSync(profilePath + '/test.yaml', 'utf-8'));

const argsCLI = minimist(process.argv.slice(2));
delete argsCLI._;
console.log(argsCLI);
console.log('A CLI to create a proxy with PAC script');


function argsSchema(args) {
  this.pac =  args.pac || '0.0.0.0:6969';
  this.pacHost = args.pacHost || null;
  this.pacPort = args.pacPort || null;
  this.proxyHost = args.proxyHost || '0.0.0.0';
  this.proxyPort = args.proxyPort || 6789;
  this.profile = args.profile || './profiles/test.yaml';
}



// Merge arguments passed from CLI to arguments schema

const finalArgs = new argsSchema((isEmpty(argsCLI) ? false : argsCLI) || profileDoc);
const {
  pac,
  pacHost,
  pacPort,
  proxyHost,
  proxyPort,
  profile
} = finalArgs

const questions = [];
  if (!profile) {
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

  if (profile)
  questions.push({
    type: 'input',
    name: 'profiles',
    message: 'Proxy profiles: (path: profile.yml)',
    default: profile
  });
  }

module.exports = (async () => {

  proxyMe(finalArgs);
  const answers = await inq.prompt(questions);
})();
