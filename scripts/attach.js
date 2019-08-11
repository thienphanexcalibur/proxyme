const { execSync } = require('child_process');
const OSName = 'linux'
module.exports = function setProxyUrl(url) {
    console.log('pac url: ', url);
    if (OSName === 'linux') {

        const autoconfigUrl = execSync('gsettings get org.gnome.system.proxy autoconfig-url', {encoding: 'utf-8'});
        const proxyMode = execSync('gsettings get org.gnome.system.proxy mode', { encoding: 'utf-8' });
        execSync(`gsettings set org.gnome.system.proxy autoconfig-url "${url}"`);
        execSync('gsettings set org.gnome.system.proxy mode auto');
        return { autoconfigUrl, proxyMode };
    }
};

