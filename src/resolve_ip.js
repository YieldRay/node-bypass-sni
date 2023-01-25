const resolveNormal = require("./resolve_ip_normal");
const { dohResolve: resolveDoH } = require("./resolve_ip_doh");

const httpRequest = require("./http_bypass_sni");
/**
 * This use HTTP HEAD request for test
 */
async function testBypass(domain, ip, timeout = 2000) {
    try {
        const { statusCode } = await httpRequest({
            host: ip,
            servername: domain,
            signal: AbortSignal.timeout(timeout),
            method: "HEAD",
        });
        return statusCode.startsWith("2") || statusCode.startsWith("3");
    } catch (_) {
        return false;
    } finally {
        return false;
    }
}

/**
 * @returns {Promise<[boolean,string]>}
 */
async function testIPs(domain, ips, timeout) {
    if (!Array.isArray(ips)) {
        const ok = await testBypass(domain, ips, timeout);
        return [ok, ips];
    }
    for (const ip of ips) {
        const ok = await testBypass(domain, ip, timeout);
        if (ok) return [true, ip];
    }
    // in this turn, no available ip
    return [false, ips[0]];
}

/**
 * @param DOMAIN2IP {object}
 * @param servers {string[]|string} use string[] for normal DNS, and use string for DoH
 * @example
 * const resolve4 = createResolve({"example.net","127.0.0.1"},["8.8.8.8"])
 * const ip: string = await resolve4("example.net") // single IP adress
 */
function createResolve(DOMAIN2IP = {}, servers = ["8.8.8.8"]) {
    return async function (domain) {
        if (domain in DOMAIN2IP) {
            const [ok, ip] = await testIPs(domain, DOMAIN2IP[domain]);
            // if (ok) return ip;
            return ip;
        }
        const resolve = typeof servers === "string" ? resolveDoH : resolveNormal;
        const ips = await resolve(domain, servers);

        if (ips.length === 1) return ips[0];
        const [ok, ip] = await testIPs(domain, ips);

        return ip;
    };
}

module.exports = createResolve;
