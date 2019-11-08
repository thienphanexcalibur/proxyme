const childProcess = require('child_process');
const {spawn} = childProcess;
const http = require('http');
const fs = require('fs');
const pac = require('./pac.js');
const rules = require('./rules.js');

const proxyHost = rules.proxyHost;
const proxyPort = rules.proxyPort;
const urls = rules.urls;
const hosts = rules.hosts;
const pacHost = '0.0.0.0';
const pacPort = proxyPort + 1;

const pacContent = pac(urls, hosts, proxyHost, proxyPort);
console.log(pacContent)

const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/x-ns-proxy-autoconfig');
	res.setHeader('Extension', 'pac');
	res.end(pacContent);
});

server.on('request', (req, res) => {
	console.log(req.connection.remoteAddress, 'is connecting');
});

server.listen(pacPort, pacHost, () => {
	console.log(`PAC Server is running at http://${pacHost}:${pacPort}`);
});

