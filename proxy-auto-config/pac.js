module.exports = (urls = [], hosts = [], proxyHost, proxyPort) => {
	const proxyUrls = urls.map(url => `shExpMatch(url, "${url}")`).join(' || ');
	const proxyHosts = hosts.map(host => `shExpMatch(host, "${host}")`).join(' || ');
  const proxyHostsString = proxyHosts ?
`if(${proxyHosts}) {
      return "PROXY ${proxyHost}:${proxyPort}; DIRECT";
   }` : '';
  const proxyUrlsString = proxyUrls ?
`if(${proxyUrls}) {
      return "PROXY ${proxyHost}:${proxyPort}; DIRECT";
   }` : '';

	return ` function FindProxyForURL(url, host) {
        ${proxyHostsString}
        ${proxyUrlsString}
        return "DIRECT;";
	}`
}
