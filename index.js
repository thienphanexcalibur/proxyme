const Proxy = require('http-mitm-proxy');
const proxy = Proxy();
const {
  spawn
} = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');


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
  port: 2300
}, () => {
  console.log('Debug server is running');
});

const io = require('socket.io')(server);
io.on('connection', (socket) => {
  socket.emit('soundcheck', 'hello');
});


module.exports = function proxyMe({
  pac,
  proxyHost,
  proxyPort,
  profilePath
}) {
  // Inject global PAC file for determine proxy traffics
  const attachProcess = spawn('bash', [`attach.script`, '--pac', pac]);

  proxy.onRequest(function (ctx, callback) {
    ctx.use(Proxy.gunzip);
    const remoteAddress = ctx.clientToProxyRequest.connection.remoteAddress;
    let url = ctx.clientToProxyRequest.url;
    const host = ctx.clientToProxyRequest.headers.host;
    // Log
    console.log(remoteAddress, ' requests ', ctx.clientToProxyRequest.url);

    // Transport to socket

    io.emit('request', `${remoteAddress} requests   ${url}`)


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
    spawn('bash', ['detach.script']);
    process.exit();
  });
};
