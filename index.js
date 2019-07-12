

module.exports = function proxyMe({ pac, proxyHost, proxyPort}) {
  console.log(proxyHost, proxyPort);
const Proxy = require('http-mitm-proxy');

const proxy = Proxy();
const {spawn} = require('child_process');

// Inject global PAC file for determine proxy traffics
const attachProcess = spawn('bash', ['attach.script']);
proxy.onRequest(function(ctx, callback) {
  ctx.use(Proxy.gunzip);
  const remoteAddress = ctx.clientToProxyRequest.connection.remoteAddress;
  let url = ctx.clientToProxyRequest.url;
  const host = ctx.clientToProxyRequest.headers.host;
  // Log
  console.log(remoteAddress, ' requests ', ctx.clientToProxyRequest.url);

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

proxy.listen({host: proxyHost ,port: proxyPort})
// Revert global proxy configuration
process.on('SIGINT', () => {
  spawn('bash', ['detach.script']);
  process.exit();
});
};
