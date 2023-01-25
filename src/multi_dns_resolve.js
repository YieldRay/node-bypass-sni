const { Resolver } = require("node:dns/promises");

const DNS_SERVERS = {
    google: ["8.8.8.8", "8.8.4.4"],
    nortonConnectSafe: ["199.85.126.10", "199.85.127.10"],
    openDNS: ["208.67.222.222", "208.67.220.220"],
    dnh: ["84.200.69.80", "84.200.70.40"],
    comodo: ["8.26.56.26", "8.20.247.20"],
    verisign: ["64.6.64.6", "64.6.65.6"],
    114: ["114.114.114.114", "114.114.115.115"],
    ali: ["223.5.5.5", "223.6.6.6"],
    dnspod: ["119.29.29.29", "182.254.116.116"],
    baidu: ["180.76.76.76"],
    360: ["101.226.4.6", "123.125.81.6", "101.226.4.6", "101.226.4.6"],
};

/**
 * @param domain {string}
 * @returns {string[]}
 */
async function multidnsResolve(domain) {
    const ps = await Promise.allSettled(
        Object.values(DNS_SERVERS).map((servers) => {
            const resolver = new Resolver();
            resolver.setServers(servers);
            return resolver.resolve(domain);
        })
    );
    const arr4arr = ps.filter((p) => (p.status = "fulfilled")).map((p) => p.value);
    const flatArray = (arr) => arr.reduce((a, b) => a.concat(b), []);
    return [...new Set(flatArray(arr4arr))];
}

module.exports = multidnsResolve;
