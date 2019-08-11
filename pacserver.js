const http = require('http');
const genPac = require('./lib/genPac');
module.exports = function pacServer({ host = 'localhost', pacPort = 8081, proxyPort = 8080, domains, urls}) {
    const server = http.createServer((req, res) => {
    });
    server.on('request', (req, response) => {
        let host = req.headers.host.replace(/:.*$/, '');
        let pacFile = genPac({ proxyPort, host, domains, urls });
        console.log(`pac config sent from ${host}`, pacFile);
        response.writeHead(200, { 'Content-Type': 'application/x-ns-proxy-autoconfig' });
        response.end(pacFile);
    });
    server.on('clientError', (err, socket) => {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    server.listen(pacPort);
}