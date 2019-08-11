const { execSync } = require('child_process');
const OSName = 'linux'
module.exports = function revertProxyUrl({ autoconfigUrl, proxyMode } = {}) {
    if (!proxyMode) {
        return;
    }
    if (OSName === 'linux') {
        execSync(`gsettings set org.gnome.system.proxy autoconfig-url ${autoconfigUrl}`);
        execSync(`gsettings set org.gnome.system.proxy mode ${proxyMode}`);
        return { autoconfigUrl, proxyMode };
    }
}

