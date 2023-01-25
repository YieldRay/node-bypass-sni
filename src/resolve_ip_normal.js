const { Resolver } = require("node:dns/promises");

module.exports = function (domain, servers) {
    const resolver = new Resolver();
    resolver.setServers(servers);
    return resolver.resolve4(domain);
};
