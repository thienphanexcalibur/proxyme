/* global __dirname, process */
const Proxy = require('http-mitm-proxy');
const proxy = Proxy();
const fs = require('fs');
const http = require('http');
const path = require('path');
const chalk = require('chalk');
const attachProxy = require('./scripts/attach');
const detachProxy = require('./scripts/detach');
const pacServer = require('./pacserver');
const rulesParse = require('./lib/rulesParse');

module.exports = function proxyMe(args) {
  // Destructuring arguments
  const {
    pacPort,
    proxyHost,
    proxyPort,
    debugHost,
    debugPort,
    rules
  } = args;

  /* Setup debug server to display all traffics from proxy */
  const debugServer = http.createServer((req, res) => {
    const staticBasePath = __dirname;
    const resolvedBase = path.resolve(staticBasePath);
    const safeSuffix = path.normalize(req.url).replace(/^(\.\.[/\\])+/, '');
    let fileLoc = path.join(resolvedBase, safeSuffix);

    if (req.url === '/') {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      fileLoc = path.join(fileLoc, 'index.html');
    }

    fs.readFile(fileLoc, function(err, data) {
        if (err) {
            res.writeHead(404, 'Not Found');
            res.write('404: File Not Found!');
            return res.end();
        }

        res.statusCode = 200;

        res.write(data);
        return res.end();
    });
  });
  debugServer.listen({
    host: debugHost,
    port: debugPort
  }, () => {
    console.log(chalk.bgGreen.black(`Debug server is running at  http://${debugHost}:${debugPort}`));
  });

  const io = require('socket.io')(debugServer);
  io.on('connection', (socket) => {
    socket.emit('soundcheck', 'hello');
  });

  const { domains, urls, parsedRules } = rulesParse(rules);

  /** */
  // Inject global PAC file for determine proxy traffics

  pacServer({ host: proxyHost, pacPort, proxyPort, domains, urls })
  const autoproxySettings = attachProxy(`http://localhost:${pacPort}/`);

  proxy.onRequest(function (ctx, callback) {
    ctx.use(Proxy.gunzip);
    const remoteAddress = ctx.clientToProxyRequest.connection.remoteAddress;
    let url = ctx.clientToProxyRequest.url;
    const host = ctx.clientToProxyRequest.headers.host;
    // Log
    console.log(remoteAddress, ' requests ', ctx.clientToProxyRequest.url);

    // Transport to socket
    io.emit('request', `${remoteAddress} requests ${url}`)

    // If https protocol
    if (ctx.proxyToServerRequestOptions.agent.protocol === 'https:') {
      ctx.isSSL = false;
      ctx.proxyToServerRequestOptions.agent = proxy.httpAgent;
    }

    for(let rule in rules) {
      const extractURLSegments = rule.split('/');
      const extractHost = extractURLSegments[0];
      const extractPath = extractURLSegments[1];
      if (host === extractHost) {
          if (extractPath) {
            ctx.proxyToServerRequestOptions.path = ctx.proxyToServerRequestOptions.path.replace(extractPath, '/')
          }
          ctx.proxyToServerRequestOptions.host = rules[rule][0];
          ctx.proxyToServerRequestOptions.port = rules[rule][1];
        }
    }
    callback();
  });


  proxy.onError((ctx, err, errorKind) => {
    console.log(err);
    console.log(errorKind);
  })

  proxy.listen({
    host: proxyHost,
    port: proxyPort
  })
  // Revert global proxy configuration
  process.on('SIGINT', () => {
    console.log('exiting');
    detachProxy(autoproxySettings);
    debugServer.on('close', function () {
      process.exit(1);
    });
    debugServer.close();
  });
};
