/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable guard-for-in */
const Proxy = require('http-mitm-proxy');
const proxy = Proxy();
const {
    spawn,
} = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');
const chalk = require('chalk');

let plugins = null;
const pluginPath = path.resolve(process.cwd(), 'plugins');

// Check if plugin paths exists then make a closure ;)
if (fs.existsSync(pluginPath)) {
    console.log(chalk.green('Your plugin path', pluginPath));
    plugins = require(pluginPath);
}

module.exports = function proxyMe(args) {
    const {
        // publicPath = process.cwd(),
        pac,
        proxyHost,
        proxyPort,
        debugHost,
        debugPort,
        rules,
        certDir,
    } = args;

    if (certDir) {
        console.log(chalk.bgWhite.black('Your certificate directory:', certDir));
    }

    /* Setup debug server to display all traffics from proxy */
    const debugServer = http.createServer((req, res) => {
        const staticBasePath = __dirname;
        const resolvedBase = path.resolve(staticBasePath);
        const safeSuffix = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
        let fileLoc = path.join(resolvedBase, safeSuffix);

        if (req.url === '/') {
            res.writeHead(200, {
                'Content-Type': 'text/html',
            });
            fileLoc = path.join(fileLoc, 'index.html');
        }

        fs.readFile(fileLoc, function (err, data) {
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
        port: debugPort,
    }, () => {
        console.log(chalk.bgGreen.black(`[DEBUG SERVER] Debug server is running at\nhttp://${debugHost}:${debugPort}\n`));
    });

    const io = require('socket.io')(debugServer);

    /* Inject global PAC file for determine proxy traffics */
    spawn('bash', ['attach.sh', '--pac', pac], {
        cwd: path.join(__dirname, 'scripts'),
    });

    if (!certDir.match(/ca.pem/)) {
        proxy.onCertificateRequired = function (hostname, callback) {
            return callback(null, {
                keyFile: path.resolve(certDir, `${hostname}-key.pem`),
                certFile: path.resolve(certDir, `${hostname}-cert.pem`),
            });
        };
    }
    proxy.onRequest(function (ctx, callback) {
        ctx.use(Proxy.gunzip);
        const { remoteAddress } = ctx.clientToProxyRequest.connection;

        const { url } = ctx.clientToProxyRequest;
        const { host } = ctx.clientToProxyRequest.headers;
        // Log
        console.log(remoteAddress, ' requests ', url);

        // Transport to socket
        io.emit('request', `${remoteAddress} requests ${url}`);


        const hostMatched = rules[host];
        // Add more logic here
        // [NOTICE] Currently support only level 1 path
        if (hostMatched) {
            // If https protocol
            if (ctx.proxyToServerRequestOptions.agent.protocol === 'https:') {
                ctx.isSSL = false;
                ctx.proxyToServerRequestOptions.agent = proxy.httpAgent;
            }

            const [mapPaths, hostMapping] = hostMatched;
            for (const iterPath in mapPaths) {
                /* TODO: running an excursion here to map all subpaths to their hosts and ports */
                const [mapPath, pathMapping] = mapPaths[iterPath];
				if (url.match(new RegExp(iterPath))) {
					if (url.match(new RegExp(`${iterPath}$`))) {
						if (!pathMapping.directWithoutRewrite) {
							ctx.proxyToServerRequestOptions.path = ctx.proxyToServerRequestOptions.path.replace(`/${iterPath}`, '');
						}
					}
					// With parameters
					if (url.match(`${iterPath}\\?(.*)`)) {
						ctx.proxyToServerRequestOptions.path = ctx.proxyToServerRequestOptions.path.replace(/\?(.*)/, '/');
					}
					ctx.proxyToServerRequestOptions.host = pathMapping.host;
					ctx.proxyToServerRequestOptions.port = pathMapping.port;
				}
            }
            if (hostMapping && hostMapping instanceof Object) {
                ctx.proxyToServerRequestOptions.host = hostMapping.host;
                ctx.proxyToServerRequestOptions.port = hostMapping.port;
            }
        }
        if (plugins) {
            plugins.call(this, ctx, proxy);
        }
        return callback();
    });

    const certProcess = spawn('bash', ['addcert.sh', '--publicPath', process.cwd(), '--certDir', certDir], {
        cwd: path.join(__dirname, 'scripts'),
    });

    certProcess.stdout.on('data', (data) => {
    // Log output
        if (data.toString()) {
            console.log(`${chalk.bgBlue.black(data.toString())}\n`);
        }
    });

    proxy.onError((ctx, err, errorKind) => {
        console.log(err);
        console.log(errorKind);
    });

    proxy.listen({
        host: proxyHost,
        port: proxyPort,
        keepAlive: true,
    });
    // Revert global proxy configuration
    process.on('SIGINT', () => {
        console.log(chalk.bgWhite.black('\nRemoved global PAC configuration\n'), pac);
        spawn('bash', ['detach.sh'], {
            cwd: path.join(__dirname, 'scripts'),
        });
        console.log(chalk.bgWhite.black('Removed proxyme certificate!'));
        debugServer.close();
        debugServer.on('close', function () {
            process.exit(1);
        });
    });
};
