const httpRequest = require("../src/http_bypass_sni");
const createResolve = require("../src/resolve_ip");
const resolve4 = createResolve({}, "https://cors.488848.xyz/https://cloudflare-dns.com/dns-query");

async function testBypass(domain, ip, timeout = 2000) {
    try {
        const { statusCode } = await httpRequest({
            host: ip || (await resolve4(domain)),
            servername: domain,
            signal: AbortSignal.timeout(timeout),
            method: "HEAD",
        });
        return statusCode.startsWith("2") || statusCode.startsWith("3");
    } catch (e) {
        return false;
    }
}

// ["210.140.92.183", "210.140.92.187", "210.140.92.193"]
testBypass("www.pixiv.net", "210.140.92.183").then(console.log);
// testBypass("i.pximg.net", "210.140.92.145").then(console.log);
