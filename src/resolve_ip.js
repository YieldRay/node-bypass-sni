const { Resolver } = require("node:dns/promises");
/**
 * @param DOMAIN2IP {object}
 * @example
 * const resolve4 = createResolve({"example.net","127.0.0.1"},["8.8.8.8"])
 * const ip: string = resolve4("example.net") // single IP adress
 */
function createResolve(DOMAIN2IP = {}, servers = ["8.8.8.8"]) {
    const resolver = new Resolver();
    resolver.setServers(servers);
    return async function (domain) {
        if (domain in DOMAIN2IP) return DOMAIN2IP[domain];
        const ips = await resolver.resolve(domain);
        return ips[0];
    };
}

module.exports = createResolve;
