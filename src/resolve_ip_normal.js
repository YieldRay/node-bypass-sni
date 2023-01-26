const { Resolver } = require("node:dns/promises");

module.exports = function (domain, servers = ["185.222.222.222", "45.11.45.11"]) {
    const resolver = new Resolver();
    resolver.setServers(servers);
    return resolver.resolve4(domain);
};
