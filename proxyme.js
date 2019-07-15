const Proxy = require('http-mitm-proxy');
const proxy = Proxy();
const {
  spawn
} = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

module.exports = function proxyMe(args) {

  const {
    pac,
    proxyHost,
    proxyPort,
    profilePath,
    debugHost,
    debugPort
  } = args;

  console.log(args);

  /* Setup debug server to display all traffics from proxy */
  const server = http.createServer((req, res) => {
    const staticBasePath = './';
    var resolvedBase = path.resolve(staticBasePath);
    var safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
    let fileLoc = path.join(resolvedBase, safeSuffix);

    if (req.url === '/') {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      fileLoc = 'index.html';
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

  server.listen({
    host: debugHost,
    port: debugPort
  }, () => {
    console.log('Debug server is running at ',`http://${debugHost}:${debugPort}`);
  });

  const io = require('socket.io')(server);
  io.on('connection', (socket) => {
    socket.emit('soundcheck', 'hello');
  });

  /** */
  // Inject global PAC file for determine proxy traffics
  spawn('bash', ['attach.script', '--pac', pac], {
    cwd: path.join(__dirname, 'scripts')
  });

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
    // Put host conditions here
    if (host === 'coccoc.com') {
      if (url.match(/ntp-mobile/)) {
        ctx.proxyToServerRequestOptions.path = ctx.proxyToServerRequestOptions.path.replace('/ntp-mobile/', '/');
        ctx.proxyToServerRequestOptions.host = 'localhost';
        ctx.proxyToServerRequestOptions.port = '8080'
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
    spawn('bash', ['detach.script'], {
      cwd: path.join(__dirname, 'scripts')
    });
    process.exit();
  });
};
