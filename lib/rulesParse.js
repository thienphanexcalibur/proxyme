module.exports = function rulesParse(rules=[]) {
    const domains = new Set('*');
    const urls = new Set('*');
    return {domains: Array.from(domains), urls: Array.from(urls)}
}