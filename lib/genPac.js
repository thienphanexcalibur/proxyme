module.exports = function ({host = 'locahost', proxyPort, urls = ['*'], domains = ['*']}) {

    allowedHostsCond = domains.map((host) => {
        return `shExpMatch(host, "${host}")`;
    }).join(' || ');

    allowedUrlCond = urls.map(url => {
        return `shExpMatch(url, "${url}")`;
    }).join(' || ');

    return `
function FindProxyForURL(url, host) {
	if (!${allowedHostsCond}) {
		return "DIRECT";
	}
	if (!${allowedUrlCond}) {
        return "DIRECT";
    }
    return "PROXY ${host}:${proxyPort}; DIRECT";
}
`;
};
